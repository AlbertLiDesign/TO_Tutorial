// SPDX-License-Identifier: MIT
using Tutorial.Fem;
using KDTree;
namespace Tutorial.Optimization;

/// <summary>Shape-driven Hamilton-Jacobi level set on cell centers. Positive phi
/// is solid. Distances and interface width are in element-edge units.</summary>
public sealed class LevelSetOptimizer : IterativeOptimizer
{
    public const double InterfaceWidth=.75, VoidStiffness=1e-6;
    private double[] phi;
    private int nx,ny,nz;
    private double[][] points;
    public override double[] LevelSet=>phi;
    public LevelSetOptimizer(FEModel model,Settings s):base(model,s){}
    public static double Heaviside(double v)=>v<=-InterfaceWidth?0:v>=InterfaceWidth?1:.5*(1+v/InterfaceWidth+Math.Sin(Math.PI*v/InterfaceWidth)/Math.PI);
    public static double Density(double v)=>VoidStiffness+(1-VoidStiffness)*Heaviside(v);
    public static double DensityDerivative(double v)=>Math.Abs(v)>=InterfaceWidth?0:(1-VoidStiffness)*.5/InterfaceWidth*(1+Math.Cos(Math.PI*v/InterfaceWidth));
    private int Id(int x,int y,int z)=>(z*nx+x)*ny+y;
    public override void Initialize()
    {
        base.Initialize();nx=settings.Nx;ny=settings.Ny;nz=settings.Dim==3?settings.Nz:1;
        points=Model.Elements.Select(e=>new[]{e.Nodes.Average(n=>n.Position.X)/settings.ElementSize,e.Nodes.Average(n=>n.Position.Y)/settings.ElementSize,e.Nodes.Average(n=>n.Position.Z)/settings.ElementSize}).ToArray();
        // Seed through-holes in 3D too; subsequent velocity and transport are fully 3D.
        // Shape-only level sets cannot nucleate holes from an everywhere-solid field.
        double spacing=Math.Max(5,Math.Min(nx,ny)/4.0),radius=spacing*.28;
        int cols=Math.Max(1,(int)(nx/spacing)-1),rows=Math.Max(1,(int)(ny/spacing)-1);
        phi=points.Select(p=>{
            double d=double.PositiveInfinity;
            for(int x=1;x<=cols;x++)for(int y=1;y<=rows;y++)d=Math.Min(d,Math.Sqrt(Math.Pow(p[0]-nx*x/(double)(cols+1),2)+Math.Pow(p[1]-ny*y/(double)(rows+1),2))-radius);
            return d;
        }).ToArray();
        // Start above the budget when possible, retaining a reproducible perforated design.
        if(phi.Average(Density)<settings.Vf)ShiftToVolume(phi,settings.Vf);
        Apply(phi);
    }
    private void Apply(double[] field){foreach(var e in Model.Elements)e.Xe=Density(field[e.ID]);}
    public override void Optimize(bool writeFiles=false)
    {
        if(Done())return;iter++;
        var unit=Analyze(1);
        Sensitivities=phi.Select((v,i)=>unit[i]*DensityDerivative(v)).ToList();
        double oldVolume=phi.Average(Density),target=Math.Max(settings.Vf,oldVolume*(1-settings.Er));
        var working=(double[])phi.Clone();
        if(iter%5==0){working=Reinitialize(working);ShiftToVolume(working,oldVolume);}
        double[] BuildDrive(double[] working)
        {
            // Extend solid-side energy to the void before smoothing the velocity.
            // Weak-phase displacement gradients are not the solid boundary shape derivative.
            var solid=Enumerable.Range(0,phi.Length).Where(i=>working[i]>=0).ToArray();
            var solidTree=new KDTree<int>(3);foreach(int i in solid)solidTree.AddPoint(points[i],i);
            var extended=unit.Select((u,i)=>working[i]>=0?u:unit[solidTree.NearestNeighbors(points[i],1).First()]).ToArray();
            var filtered=filter.Apply(extended);var band=Enumerable.Range(0,phi.Length).Where(i=>Math.Abs(working[i])<1.5).ToArray();
            if(band.Length==0)throw new InvalidOperationException("Level-set interface vanished; use a finer mesh or a less extreme volume.");
            double mean=Math.Max(band.Average(i=>filtered[i]),1e-30);
            var tree=new KDTree<int>(3);foreach(int i in band)tree.AddPoint(points[i],i);
            var drive=new double[phi.Length];
            for(int i=0;i<phi.Length;i++){
                int j=Math.Abs(working[i])<1.5?i:tree.NearestNeighbors(points[i],1).First();
                drive[i]=filtered[j]/mean;
            }
            var curvature=Curvature(working);
            for(int i=0;i<drive.Length;i++)drive[i]+=settings.Regularization*curvature[i];
            return drive;
        }
        var drive=BuildDrive(working);
        double lower=drive.Min()-1,upper=drive.Max()+1,lambda=0;
        double[] candidate=null;bool accepted=false;double step=settings.TimeStep;
        // CFL-limited boundary transport, with volume multiplier and energy backtracking.
        for(int attempt=0;attempt<9;attempt++){
            double low=lower,high=upper;
            double vMax=Advance(working,drive,low,step).Average(Density),vMin=Advance(working,drive,high,step).Average(Density);
            // Reserve half the admissible motion for shape improvement instead of
            // consuming the entire CFL step on uniform erosion to chase the volume.
            double reachable=Math.Clamp(target,oldVolume-.5*Math.Max(0,oldVolume-vMin),oldVolume+.5*Math.Max(0,vMax-oldVolume));
            for(int k=0;k<48;k++){
                lambda=(low+high)*.5;candidate=Advance(working,drive,lambda,step);
                if(candidate.Average(Density)>reachable)low=lambda;else high=lambda;
            }
            Apply(candidate);
            if(oldVolume>settings.Vf+1e-5){accepted=true;break;}
            Model.Analyze(1);double trial=Model.Elements.Sum(e=>e.Xe*e.UnitEnergy());
            if(double.IsFinite(trial)&&trial<=LastC*(1+1e-8)){accepted=true;break;}
            step*=.5;
            // Distance rebuilding is geometric housekeeping, not a guaranteed descent.
            // Retry from the original field if it obstructs the line search.
            working=(double[])phi.Clone();
            drive=BuildDrive(working);lower=drive.Min()-1;upper=drive.Max()+1;
        }
        change=accepted?candidate.Select((v,i)=>Math.Abs(Density(v)-Density(phi[i]))).Max():1;
        if(accepted)phi=candidate;Apply(phi);Finish(lambda);
        converged=accepted&&iter>=15&&Delta<1e-3&&change<.002&&Math.Abs(phi.Average(Density)-settings.Vf)<1e-5;
    }
    // Upwind Godunov discretization of phi_t = V |grad(phi)|, with a CFL step.
    public double[] Advance(double[] field,double[] speed,double multiplier,double step)
    {
        double maximum=speed.Max(v=>Math.Abs(v-multiplier));double dt=step/Math.Max(maximum*settings.Dim,1e-30);
        var next=new double[field.Length];
        double P(int x,int y,int z)=>field[Id(Math.Clamp(x,0,nx-1),Math.Clamp(y,0,ny-1),Math.Clamp(z,0,nz-1))];
        for(int z=0;z<nz;z++)for(int x=0;x<nx;x++)for(int y=0;y<ny;y++){
            int i=Id(x,y,z);double v=speed[i]-multiplier,a=field[i],norm=0;
            void Axis(double left,double right){double dm=a-left,dp=right-a;norm+=v>=0?Math.Max(Math.Pow(Math.Min(dm,0),2),Math.Pow(Math.Max(dp,0),2)):Math.Max(Math.Pow(Math.Max(dm,0),2),Math.Pow(Math.Min(dp,0),2));}
            Axis(P(x-1,y,z),P(x+1,y,z));Axis(P(x,y-1,z),P(x,y+1,z));if(nz>1)Axis(P(x,y,z-1),P(x,y,z+1));
            next[i]=a+dt*v*Math.Sqrt(norm);
        }return next;
    }
    private double[] Curvature(double[] field)
    {
        var normals=new double[3][] {new double[field.Length],new double[field.Length],new double[field.Length]};
        double P(double[] f,int x,int y,int z)=>f[Id(Math.Clamp(x,0,nx-1),Math.Clamp(y,0,ny-1),Math.Clamp(z,0,nz-1))];
        for(int z=0;z<nz;z++)for(int x=0;x<nx;x++)for(int y=0;y<ny;y++){
            int i=Id(x,y,z);double dx=(P(field,x+1,y,z)-P(field,x-1,y,z))*.5,dy=(P(field,x,y+1,z)-P(field,x,y-1,z))*.5,dz=nz>1?(P(field,x,y,z+1)-P(field,x,y,z-1))*.5:0;
            double norm=Math.Sqrt(dx*dx+dy*dy+dz*dz+1e-12);normals[0][i]=dx/norm;normals[1][i]=dy/norm;normals[2][i]=dz/norm;
        }
        var result=new double[field.Length];
        for(int z=0;z<nz;z++)for(int x=0;x<nx;x++)for(int y=0;y<ny;y++)result[Id(x,y,z)]=.5*(P(normals[0],x+1,y,z)-P(normals[0],x-1,y,z)+P(normals[1],x,y+1,z)-P(normals[1],x,y-1,z)+(nz>1?P(normals[2],x,y,z+1)-P(normals[2],x,y,z-1):0));
        return result;
    }
    public double[] Reinitialize(double[] field)
    {
        var crossings=new List<double[]>();var neighbors=GridNeighbors.Create(nx,ny,nz);
        for(int i=0;i<field.Length;i++)foreach(int j in neighbors[i])if(j>i&&(field[i]>=0)!=(field[j]>=0)){
            double t=field[i]/(field[i]-field[j]);crossings.Add(points[i].Select((v,d)=>v+t*(points[j][d]-v)).ToArray());
        }
        if(crossings.Count==0)return (double[])field.Clone();
        var tree=new KDTree<int>(3);for(int i=0;i<crossings.Count;i++)tree.AddPoint(crossings[i],i);
        return field.Select((v,i)=>{var p=crossings[tree.NearestNeighbors(points[i],1).First()];double d=Math.Sqrt(points[i].Select((a,k)=>(a-p[k])*(a-p[k])).Sum());return v>=0?d:-d;}).ToArray();
    }
    private static void ShiftToVolume(double[] field,double volume)
    {
        double low=-field.Max()-InterfaceWidth,high=-field.Min()+InterfaceWidth;
        for(int k=0;k<64;k++){double shift=(low+high)*.5;if(field.Average(v=>Density(v+shift))>volume)high=shift;else low=shift;}
        double offset=(low+high)*.5;for(int i=0;i<field.Length;i++)field[i]+=offset;
    }
}
