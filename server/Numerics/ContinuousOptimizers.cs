// SPDX-License-Identifier: MIT
using Tutorial.Fem;
namespace Tutorial.Optimization;

public abstract class IterativeOptimizer : IOptimizer
{
    protected const double Minimum=.001;
    protected readonly Settings settings;
    protected DensityFilter filter;
    protected readonly List<double> history=new();
    protected double change=1;
    public FEModel Model {get;}
    public int iter {get;protected set;}
    public bool converged {get;protected set;}
    public double Delta {get;protected set;}=1;
    public double LastC=>history[^1];
    public List<double> Sensitivities {get;protected set;}=new();
    public List<double> isovalues {get;}=new();
    public virtual double[] LevelSet=>null;
    protected IterativeOptimizer(FEModel model,Settings s){Model=model;settings=s;}
    public virtual void Initialize()
    {
        Model.Initialize();filter=new DensityFilter(Model,settings.Radius);
        iter=0;converged=false;Delta=1;change=1;history.Clear();isovalues.Clear();Sensitivities.Clear();
        foreach(var e in Model.Elements)e.Xe=1;
    }
    protected double[] Analyze(double penalty)
    {
        Model.Analyze(penalty);
        var energy=Model.Elements.Select(e=>e.UnitEnergy()).ToArray();
        foreach(var e in Model.Elements)e.C=Math.Pow(e.Xe,penalty)*energy[e.ID];
        history.Add(Model.Elements.Sum(e=>e.C));
        if(!double.IsFinite(LastC)||LastC<=0)throw new InvalidOperationException("Non-finite or non-positive structural energy.");
        return energy;
    }
    protected bool Done()
    {if(iter>=settings.MaxIter||converged){converged=true;return true;}return false;}
    protected void Finish(double threshold)
    {
        isovalues.Add(threshold);
        if(iter>=10){double recent=history.TakeLast(5).Sum(),previous=history.Skip(history.Count-10).Take(5).Sum();Delta=Math.Abs(recent-previous)/Math.Max(Math.Abs(previous),1e-30);}
    }
    public abstract void Optimize(bool writeFiles=false);
}

/// <summary>SIMP with a physical density filter and an OC update with move limits.</summary>
public sealed class SIMP : IterativeOptimizer
{
    private double[] design,volumeGradient;
    public SIMP(FEModel model,Settings s):base(model,s){}
    public override void Initialize()
    {
        base.Initialize();design=Enumerable.Repeat(settings.Vf,Model.Elements.Count).ToArray();
        volumeGradient=filter.Transpose(Enumerable.Repeat(1.0,design.Length).ToArray());
        foreach(var e in Model.Elements)e.Xe=settings.Vf;
    }
    public override void Optimize(bool writeFiles=false)
    {
        if(Done())return;iter++;
        var energy=Analyze(settings.Penalty);
        var gain=filter.Transpose(Model.Elements.Select(e=>settings.Penalty*Math.Pow(e.Xe,settings.Penalty-1)*energy[e.ID]).ToArray());
        Sensitivities=gain.ToList();
        double low=0,high=gain.Select((g,i)=>g/volumeGradient[i]).Max()*1e6+1,lambda=0;
        var next=new double[design.Length];
        for(int k=0;k<100;k++){
            lambda=(low+high)*.5;
            for(int i=0;i<next.Length;i++)next[i]=Math.Clamp(design[i]*Math.Sqrt(Math.Max(1e-30,gain[i])/(lambda*volumeGradient[i])),Math.Max(Minimum,design[i]-settings.MoveLimit),Math.Min(1,design[i]+settings.MoveLimit));
            // Sum(Hx) = (H^T 1)^T x: exact physical-volume constraint.
            double volume=next.Select((x,i)=>x*volumeGradient[i]).Sum()/next.Length;
            if(volume>settings.Vf)low=lambda;else high=lambda;
            if((high-low)/Math.Max(high,1e-30)<1e-10)break;
        }
        change=next.Select((x,i)=>Math.Abs(x-design[i])).Max();design=next;
        var physical=filter.Apply(design);foreach(var e in Model.Elements)e.Xe=physical[e.ID];
        Finish(lambda);
        converged=iter>=10&&Delta<1e-3&&change<.01&&Math.Abs(physical.Average()-settings.Vf)<1e-5;
    }
}

/// <summary>Unidirectional, energy-ranked ESO. Removed elements cannot return.</summary>
public sealed class ESO : IterativeOptimizer
{
    private double scheduledVolume=1;
    public ESO(FEModel model,Settings s):base(model,s){}
    public override void Initialize(){base.Initialize();scheduledVolume=1;}
    public override void Optimize(bool writeFiles=false)
    {
        if(Done())return;iter++;
        var energy=Analyze(settings.Penalty);
        Sensitivities=filter.Apply(Model.Elements.Select(e=>Math.Pow(e.Xe,settings.Penalty-1)*energy[e.ID]).ToArray()).ToList();
        scheduledVolume=Math.Max(settings.Vf,scheduledVolume*(1-settings.Er));
        int n=Model.Elements.Count;
        int keep=(int)Math.Ceiling((scheduledVolume-Minimum)*n/(1-Minimum));
        var solid=Model.Elements.Where(e=>e.Xe>.5).OrderBy(e=>Sensitivities[e.ID]).ThenBy(e=>e.ID).ToArray();
        int remove=Math.Max(0,solid.Length-keep);double threshold=0;
        for(int i=0;i<remove;i++){solid[i].Xe=Minimum;threshold=Sensitivities[solid[i].ID];}
        Finish(threshold);
        // A final unchanged analysis evaluates the completed removal-only design.
        converged=scheduledVolume<=settings.Vf&&remove==0;
    }
}

/// <summary>Bounded reaction-diffusion level set on the element grid, with a smooth
/// Heaviside interface and linear ersatz material. phi=0 defines the boundary.</summary>
public sealed class LevelSetOptimizer : IterativeOptimizer
{
    private double[] phi;
    private double scheduledVolume=1;
    private const double Epsilon=.15;
    public override double[] LevelSet=>phi;
    public LevelSetOptimizer(FEModel model,Settings s):base(model,s){}
    public static double Density(double value)
    {
        double h=value<=-Epsilon?0:value>=Epsilon?1:.5*(1+value/Epsilon+Math.Sin(Math.PI*value/Epsilon)/Math.PI);
        return Minimum+(1-Minimum)*h;
    }
    public override void Initialize()
    {base.Initialize();phi=Enumerable.Repeat(.3,Model.Elements.Count).ToArray();scheduledVolume=1;}
    public override void Optimize(bool writeFiles=false)
    {
        if(Done())return;iter++;
        var energy=Analyze(1);var drive=filter.Apply(energy);Sensitivities=drive.ToList();
        double average=drive.Average();
        for(int i=0;i<drive.Length;i++)drive[i]=Math.Min(5,drive[i]/Math.Max(average,1e-30));
        int nx=settings.Nx,ny=settings.Ny,nz=settings.Dim==3?settings.Nz:1;
        int Id(int x,int y,int z)=>(z*nx+x)*ny+y;
        var neighbors=new int[phi.Length][];
        for(int z=0;z<nz;z++)for(int x=0;x<nx;x++)for(int y=0;y<ny;y++){
            var adjacent=new List<int>();
            void Add(int xx,int yy,int zz){if(xx>=0&&xx<nx&&yy>=0&&yy<ny&&zz>=0&&zz<nz)adjacent.Add(Id(xx,yy,zz));}
            Add(x-1,y,z);Add(x+1,y,z);Add(x,y-1,z);Add(x,y+1,z);
            if(nz>1){Add(x,y,z-1);Add(x,y,z+1);}
            neighbors[Id(x,y,z)]=adjacent.ToArray();
        }
        bool atTarget=scheduledVolume<=settings.Vf;
        scheduledVolume=Math.Max(settings.Vf,scheduledVolume*(1-settings.Er));
        double lambda=0,dt=settings.TimeStep;
        var next=new double[phi.Length];bool accepted=false;
        // Once volume is fixed, reject energy-increasing trial steps. This also
        // prevents an aggressive pseudo-time step from producing a two-cycle.
        for(int attempt=0;attempt<(atTarget?9:1);attempt++){
            // Backward-Euler diffusion keeps smoothing stable in both 2D and 3D.
            // Radius sets its length scale; missing neighbors impose zero flux.
            var rhs=phi.Select((v,i)=>v+dt*drive[i]).ToArray();
            var smooth=(double[])rhs.Clone();var buffer=new double[phi.Length];
            double alpha=dt*settings.Regularization*settings.Radius*settings.Radius;
            for(int sweep=0;sweep<60;sweep++){
                double error=0;
                for(int i=0;i<smooth.Length;i++){
                    double sum=0;foreach(int j in neighbors[i])sum+=smooth[j];
                    buffer[i]=(rhs[i]+alpha*sum)/(1+alpha*neighbors[i].Length);
                    error=Math.Max(error,Math.Abs(buffer[i]-smooth[i]));
                }
                (smooth,buffer)=(buffer,smooth);if(error<1e-10)break;
            }
            double low=-4/dt-10,high=4/dt+10;
            for(int k=0;k<64;k++){
                lambda=(low+high)*.5;
                for(int i=0;i<phi.Length;i++)next[i]=Math.Clamp(smooth[i]-dt*lambda,-1,1);
                if(next.Average(Density)>scheduledVolume)low=lambda;else high=lambda;
            }
            foreach(var e in Model.Elements)e.Xe=Density(next[e.ID]);
            if(!atTarget){accepted=true;break;}
            Model.Analyze(1);
            double trial=Model.Elements.Sum(e=>e.Xe*e.UnitEnergy());
            if(double.IsFinite(trial)&&trial<=LastC*(1+1e-9)){accepted=true;break;}
            dt*=.5;
        }
        change=accepted?next.Select((x,i)=>Math.Abs(x-phi[i])).Max():1;
        if(accepted)phi=next;
        foreach(var e in Model.Elements)e.Xe=Density(phi[e.ID]);
        Finish(lambda);
        converged=iter>=10&&scheduledVolume<=settings.Vf&&Delta<1e-3&&change<.01;
    }
}
