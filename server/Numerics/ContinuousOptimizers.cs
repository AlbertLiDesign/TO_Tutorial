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
        Model.Initialize();filter=new DensityFilter(Model,settings.Radius*settings.ElementSize);
        iter=0;converged=false;Delta=1;change=1;history.Clear();isovalues.Clear();Sensitivities.Clear();
        foreach(var e in Model.Elements)e.Xe=1;
    }
    protected double[] Analyze(double penalty,double minimumStiffness=0)
    {
        Model.Analyze(penalty,minimumStiffness);
        var energy=Model.Elements.Select(e=>e.UnitEnergy()).ToArray();
        foreach(var e in Model.Elements)e.C=(minimumStiffness+(1-minimumStiffness)*Math.Pow(e.Xe,penalty))*energy[e.ID];
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
    public const double Emin=1e-9;
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
        var energy=Analyze(settings.Penalty,Emin);
        var gain=filter.Transpose(Model.Elements.Select(e=>(1-Emin)*settings.Penalty*Math.Pow(e.Xe,settings.Penalty-1)*energy[e.ID]).ToArray());
        Sensitivities=gain.ToList();
        double low=0,high=gain.Select((g,i)=>g/volumeGradient[i]).Max()*1e6+1,lambda=0;
        var next=new double[design.Length];
        for(int k=0;k<100;k++){
            lambda=(low+high)*.5;
            for(int i=0;i<next.Length;i++)next[i]=Math.Clamp(design[i]*Math.Sqrt(Math.Max(1e-30,gain[i])/(lambda*volumeGradient[i])),Math.Max(0,design[i]-settings.MoveLimit),Math.Min(1,design[i]+settings.MoveLimit));
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
