// SPDX-License-Identifier: MIT
using Tutorial.Fem;
using KDTree;
namespace Tutorial.Optimization;

/// <summary>Zero-stiffness BESO with active-DOF assembly, nodal sensitivity
/// extrapolation followed by nodal-radius filtering and global sensitivity ranking.</summary>
public sealed class HardKillBESO : IterativeOptimizer
{
    private double volume=1;
    private int[] passive;
    private int[][] nodesInRadius;
    private double[][] nodalWeights;
    public HardKillBESO(FEModel model,Settings s):base(model,s){}
    public override void Initialize()
    {
        base.Initialize();volume=1;
        var loads=Model.Loads.Select(l=>l.NodeID).ToHashSet();
        passive=settings.ProtectLoad?Model.Elements.Where(e=>e.Nodes.Any(n=>loads.Contains(n.ID))).Select(e=>e.ID).ToArray():Array.Empty<int>();
        if(passive.Length>Math.Floor(settings.Vf*Model.Elements.Count+1e-10))throw new ArgumentException("The solid load pad exceeds the volume budget.");
        var tree=new KDTree<int>(3);
        foreach(var node in Model.Nodes)tree.AddPoint(new[]{node.Position.X,node.Position.Y,node.Position.Z},node.ID);
        nodesInRadius=new int[Model.Elements.Count][];nodalWeights=new double[Model.Elements.Count][];
        foreach(var e in Model.Elements){
            var c=new[]{e.Nodes.Average(n=>n.Position.X),e.Nodes.Average(n=>n.Position.Y),e.Nodes.Average(n=>n.Position.Z)};
            nodesInRadius[e.ID]=tree.NearestNeighbors(c,Model.Nodes.Count,settings.Radius*settings.Radius*settings.ElementSize*settings.ElementSize).ToArray();
            nodalWeights[e.ID]=nodesInRadius[e.ID].Select(j=>{var p=Model.Nodes[j].Position;return Math.Max(0,settings.Radius*settings.ElementSize-Math.Sqrt(Math.Pow(p.X-c[0],2)+Math.Pow(p.Y-c[1],2)+Math.Pow(p.Z-c[2],2)));}).ToArray();
        }
    }
    public override void Optimize(bool writeFiles=false)
    {
        if(Done())return;iter++;Model.AnalyzeHardKill();
        var nodal=new double[Model.Nodes.Count];var count=new int[nodal.Length];double c=0;
        foreach(var e in Model.Elements){e.C=e.Xe>0?e.UnitEnergy():0;c+=e.C;if(e.Xe>0)foreach(var n in e.Nodes){nodal[n.ID]+=e.C;count[n.ID]++;}}
        if(!double.IsFinite(c)||c<=0)throw new InvalidOperationException("Invalid hard-kill energy.");
        history.Add(c);
        for(int i=0;i<nodal.Length;i++)if(count[i]>0)nodal[i]/=count[i];
        var score=new double[Model.Elements.Count];
        foreach(var e in Model.Elements){double sum=0,total=0;for(int k=0;k<nodesInRadius[e.ID].Length;k++){
            int j=nodesInRadius[e.ID][k];
            double w=nodalWeights[e.ID][k];sum+=w*nodal[j];total+=w;
        }score[e.ID]=total>0?sum/total:0;}
        if(Sensitivities.Count>0)for(int i=0;i<score.Length;i++)score[i]=(score[i]+Sensitivities[i])*.5;
        Sensitivities=score.ToList();volume=Math.Max(settings.Vf,volume*(1-settings.Er));
        var previous=Model.Elements.Select(e=>e.Xe).ToArray();
        int keep=(int)Math.Floor(volume*score.Length+1e-10);
        var admissible=Enumerable.Range(0,score.Length).Where(i=>previous[i]==0).OrderByDescending(i=>score[i]).ThenBy(i=>i).Take((int)Math.Floor(settings.AdditionRatio*score.Length+1e-10)).ToHashSet();
        var selected=new bool[score.Length];foreach(int i in passive)selected[i]=true;
        foreach(int i in Enumerable.Range(0,score.Length).Where(i=>!selected[i]&&(previous[i]>0||admissible.Contains(i))).OrderByDescending(i=>score[i]).ThenBy(i=>i).Take(Math.Max(0,keep-passive.Length)))selected[i]=true;
        foreach(var e in Model.Elements)e.Xe=selected[e.ID]?1:0;
        change=Model.Elements.Count(e=>e.Xe!=previous[e.ID])/(double)score.Length;
        Finish(Model.Elements.Where(e=>e.Xe>0).Min(e=>score[e.ID]));
        converged=iter>=10&&Delta<1e-3&&change==0&&Math.Abs(Model.Elements.Average(e=>e.Xe)-settings.Vf)<=1.0/score.Length+1e-10;
    }
    public static bool[] SelectBySensitivity(double[] score,int keep)
    {
        var selected=new bool[score.Length];
        foreach(int i in Enumerable.Range(0,score.Length).OrderByDescending(i=>score[i]).ThenBy(i=>i).Take(Math.Clamp(keep,0,score.Length)))selected[i]=true;
        return selected;
    }
}

public static class GridNeighbors
{
    public static int[][] Create(int nx,int ny,int nz)
    {
        int Id(int x,int y,int z)=>(z*nx+x)*ny+y;var result=new int[nx*ny*nz][];
        for(int z=0;z<nz;z++)for(int x=0;x<nx;x++)for(int y=0;y<ny;y++){
            var a=new List<int>();void Add(int xx,int yy,int zz){if(xx>=0&&xx<nx&&yy>=0&&yy<ny&&zz>=0&&zz<nz)a.Add(Id(xx,yy,zz));}
            Add(x-1,y,z);Add(x+1,y,z);Add(x,y-1,z);Add(x,y+1,z);if(nz>1){Add(x,y,z-1);Add(x,y,z+1);}result[Id(x,y,z)]=a.ToArray();
        }return result;
    }
}
