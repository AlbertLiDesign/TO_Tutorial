// SPDX-License-Identifier: MIT
using Tutorial.Fem;
namespace Tutorial.Optimization;

/// <summary>Zero-stiffness BESO with active-DOF assembly, nodal sensitivity
/// extrapolation, and face connectivity to avoid floating material and hinges.</summary>
public sealed class HardKillBESO : IterativeOptimizer
{
    private double volume=1;
    private int[][] neighbors;
    private int[] anchors,supportCells;
    public HardKillBESO(FEModel model,Settings s):base(model,s){}
    public override void Initialize()
    {
        base.Initialize();volume=1;
        neighbors=GridNeighbors.Create(settings.Nx,settings.Ny,settings.Dim==3?settings.Nz:1);
        var loaded=Model.Loads.Select(l=>l.NodeID).ToHashSet();
        anchors=Model.Elements.Where(e=>e.Nodes.Any(n=>loaded.Contains(n.ID))).Select(e=>e.ID).ToArray();
        supportCells=Model.Elements.Where(e=>e.Nodes.Count(n=>n.Position.X==0)>0).Select(e=>e.ID).ToArray();
    }
    public override void Optimize(bool writeFiles=false)
    {
        if(Done())return;iter++;Model.AnalyzeHardKill();
        var nodal=new double[Model.Nodes.Count];var count=new int[nodal.Length];double c=0;
        foreach(var e in Model.Elements){e.C=e.Xe>0?e.UnitEnergy():0;c+=e.C;if(e.Xe>0)foreach(var n in e.Nodes){nodal[n.ID]+=e.C;count[n.ID]++;}}
        if(!double.IsFinite(c)||c<=0)throw new InvalidOperationException("Invalid hard-kill energy.");
        history.Add(c);
        for(int i=0;i<nodal.Length;i++)if(count[i]>0)nodal[i]/=count[i];
        var raw=Model.Elements.Select(e=>e.Xe>0?e.C:e.Nodes.Average(n=>nodal[n.ID])).ToArray();
        var score=filter.Apply(raw);
        if(Sensitivities.Count>0)for(int i=0;i<score.Length;i++)score[i]=(score[i]+Sensitivities[i])*.5;
        Sensitivities=score.ToList();volume=Math.Max(settings.Vf,volume*(1-settings.Er));
        var previous=Model.Elements.Select(e=>e.Xe).ToArray();
        var selected=ConnectedSelection(score,(int)Math.Ceiling(volume*score.Length));
        foreach(var e in Model.Elements)e.Xe=selected[e.ID]?1:0;
        change=Model.Elements.Count(e=>e.Xe!=previous[e.ID])/(double)score.Length;
        Finish(Model.Elements.Where(e=>e.Xe>0).Min(e=>score[e.ID]));
        converged=iter>=10&&Delta<1e-3&&change==0&&Math.Abs(Model.Elements.Average(e=>e.Xe)-settings.Vf)<=1.0/score.Length+1e-10;
    }
    private bool[] ConnectedSelection(double[] score,int keep)
    {
        // A minimum-cost material path joins each loaded cell to a fixed face.
        // Remaining cells are ranked on the connected frontier; void cells can return.
        int n=score.Length;double scale=Math.Max(score.Max(),1e-30);
        var distance=Enumerable.Repeat(double.PositiveInfinity,n).ToArray();var parent=Enumerable.Repeat(-1,n).ToArray();
        var queue=new PriorityQueue<int,(double,int)>();
        foreach(int i in supportCells){distance[i]=0;queue.Enqueue(i,(0,i));}
        while(queue.TryDequeue(out int i,out var key)){
            if(key.Item1>distance[i])continue;
            foreach(int j in neighbors[i]){
                double d=distance[i]+1/Math.Sqrt(.01+Math.Max(0,score[j])/scale);
                if(d<distance[j]){distance[j]=d;parent[j]=i;queue.Enqueue(j,(d,j));}
            }
        }
        var selected=new bool[n];int total=0;
        foreach(int start in anchors)for(int i=start;i>=0&&!selected[i];i=parent[i]){selected[i]=true;total++;}
        var frontier=new PriorityQueue<int,(double,int)>();var queued=new bool[n];
        void Add(int i){foreach(int j in neighbors[i])if(!selected[j]&&!queued[j]){queued[j]=true;frontier.Enqueue(j,(-score[j],j));}}
        for(int i=0;i<n;i++)if(selected[i])Add(i);
        while(total<keep&&frontier.TryDequeue(out int i,out _)){selected[i]=true;total++;Add(i);}
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
