// SPDX-License-Identifier: MIT
using Tutorial.Fem;
using KDTree;
namespace Tutorial.Optimization;

/// <summary>Compliance-minimizing soft-kill BESO with history-averaged sensitivity.</summary>
public sealed class BESO : IOptimizer
{
    public FEModel Model {get;}
    public int iter {get;private set;}
    public bool converged {get;private set;}
    public double Delta {get;private set;}=1;
    public double LastC=>history[^1];
    public List<double> Sensitivities {get;private set;}=new();
    public List<double> isovalues {get;}=new();
    private readonly double radius,er,penalty,target;
    private readonly int maximum;
    private double volume=1;
    private readonly List<double> history=new();
    private int[][] neighbours;private double[][] weights;
    public BESO(string unusedOutputPath,FEModel model,double rmin,double ert,double p,double vf,int maxIter)
    {Model=model;radius=rmin;er=ert;penalty=p;target=vf;maximum=maxIter;}
    public void Initialize()
    {
        Model.Initialize();iter=0;converged=false;Delta=1;volume=1;history.Clear();isovalues.Clear();Sensitivities.Clear();
        foreach(var e in Model.Elements)e.Xe=1;
        var centres=Model.Elements.Select(e=>new[]{e.Nodes.Sum(n=>n.Position.X)/e.Nodes.Count,e.Nodes.Sum(n=>n.Position.Y)/e.Nodes.Count,e.Nodes.Sum(n=>n.Position.Z)/e.Nodes.Count}).ToArray();
        var tree=new KDTree<int>(3);for(int i=0;i<centres.Length;i++)tree.AddPoint(centres[i],i);
        neighbours=new int[centres.Length][];weights=new double[centres.Length][];
        Parallel.For(0,centres.Length,i=>
        {
            neighbours[i]=tree.NearestNeighbors(centres[i],centres.Length,radius*radius).ToArray();
            weights[i]=new double[neighbours[i].Length];double sum=0;
            for(int k=0;k<neighbours[i].Length;k++)
            {
                var a=centres[i];var b=centres[neighbours[i][k]];
                double dx=a[0]-b[0],dy=a[1]-b[1],dz=a[2]-b[2];
                weights[i][k]=radius-Math.Sqrt(dx*dx+dy*dy+dz*dz);sum+=weights[i][k];
            }
            for(int k=0;k<weights[i].Length;k++)weights[i][k]/=sum;
        });
    }
    public void Optimize(bool unusedWriteFiles=false)
    {
        if(iter>=maximum || (Delta<=1e-3&&Math.Abs(volume-target)<=.01)){converged=true;return;}
        iter++;volume=Math.Max(target,volume*(1-er));Model.Analyze(penalty);
        var raw=new double[Model.Elements.Count];double energy=0;
        foreach(var e in Model.Elements){double c=e.UnitEnergy();e.C=Math.Pow(e.Xe,penalty)*c;energy+=e.C;raw[e.ID]=Math.Pow(e.Xe,penalty-1)*c;}
        history.Add(energy);var filtered=new double[raw.Length];
        for(int i=0;i<raw.Length;i++)
        {
            double sum=0;for(int j=0;j<neighbours[i].Length;j++)sum+=raw[neighbours[i][j]]*weights[i][j];
            filtered[i]=iter>1?(sum+Sensitivities[i])*.5:sum;
        }
        Sensitivities=filtered.ToList();double low=filtered.Min(),high=filtered.Max(),threshold=0;
        while((high-low)/high>1e-5)
        {
            threshold=(high+low)*.5;double sum=0;
            foreach(var e in Model.Elements){e.Xe=filtered[e.ID]>threshold?1:.001;sum+=e.Xe;}
            if(sum-volume*raw.Length>0)low=threshold;else high=threshold;
        }
        isovalues.Add(threshold);
        if(iter>10){double newer=0,older=0;for(int i=1;i<6;i++){newer+=history[^i];older+=history[history.Count-5-i];}Delta=Math.Abs((newer-older)/older);}
    }
}
