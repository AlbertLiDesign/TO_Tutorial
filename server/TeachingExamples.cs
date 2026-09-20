using System.Text.Json;

/// <summary>Reproducible textbook examples; no optimizer is started.</summary>
public static class TeachingExamples
{
    public static void Run()
    {
        void Check(bool ok,string message){if(!ok)throw new InvalidOperationException(message);}
        var mechanics=new List<object>();
        foreach(int dim in new[]{2,3}){
            double Solve(double young,double force){
                using var model=Engine.Build(new Settings(Dim:dim,Nx:12,Ny:8,Nz:2,Young:young,Force:force));
                model.Initialize();foreach(var e in model.Elements)e.Xe=1;
                model.Analyze(3);return 2*model.Elements.Sum(e=>e.UnitEnergy());
            }
            double c=Solve(1,-1),c2=Solve(1,-2),ce=Solve(2,-1);
            Check(Math.Abs(c2/c-4)<1e-8&&Math.Abs(ce/c-.5)<1e-8,"Fixed-design scaling failed");
            mechanics.Add(new{dim,nx=12,ny=8,nz=dim==3?2:0,density=1,h=1,compliance=c,doubledForceCompliance=c2,doubledModulusCompliance=ce,forceRatio=c2/c,modulusRatio=ce/c});
        }
        // Local update exercise: supplied gradients, not a fabricated FE history.
        double[] x={.5,.5,.5,.5},gain={8,2,8,2};double lambda=4.5;
        var updated=x.Select((v,i)=>Math.Clamp(v*Math.Sqrt(gain[i]/lambda),v-.2,v+.2)).ToArray();
        Check(Math.Abs(updated.Sum()-2)<1e-12,"OC volume failed");
        // Six equal square cells, element index e=2*x+y. R=1: only the four
        // corner nodes have positive weights and those four weights are equal.
        int[] solid={1,1,1,0,1,1};double[] energy={4,1,2,0,1,.5},prior={2,1,2,6,1,.5};
        var sums=new double[12];var counts=new int[12];
        int Node(int ix,int iy)=>ix*3+iy;
        int[] Nodes(int e){int ix=e/2,iy=e%2;return new[]{Node(ix,iy),Node(ix+1,iy),Node(ix+1,iy+1),Node(ix,iy+1)};}
        for(int e=0;e<6;e++)if(solid[e]==1)foreach(int n in Nodes(e)){sums[n]+=energy[e];counts[n]++;}
        var nodal=sums.Select((v,i)=>counts[i]>0?v/counts[i]:0).ToArray();
        var filtered=Enumerable.Range(0,6).Select(e=>Nodes(e).Average(n=>nodal[n])).ToArray();
        var averaged=filtered.Select((v,i)=>(v+prior[i])/2).ToArray();
        const double admission=1.0/6;int cap=(int)Math.Floor(admission*6+1e-10);
        var eligible=Enumerable.Range(0,6).Where(e=>solid[e]==0).OrderByDescending(e=>averaged[e]).ThenBy(e=>e).Take(cap).ToHashSet();
        var selected=Enumerable.Range(0,6).Where(e=>solid[e]==1||eligible.Contains(e)).OrderByDescending(e=>averaged[e]).ThenBy(e=>e).Take(3).Order().ToArray();
        Check(selected.SequenceEqual(new[]{0,2,3}),"BESO ranking exercise failed");
        var report=new{passed=true,description="Fixed-design elasticity and isolated update exercises; not optimization benchmarks",mechanics,oc=new{design=x,negativeGradient=gain,lambda,move=.2,updated,volume=updated.Sum()},beso=new{nx=3,ny=2,index="e=2*x+y; zero-based",solid,energy,prior,nodal,filtered,averaged,admissionRatio=admission,keep=3,selected}};
        Console.WriteLine(JsonSerializer.Serialize(report,new JsonSerializerOptions{WriteIndented=true}));
    }
}
