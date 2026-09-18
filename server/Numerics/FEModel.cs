// SPDX-License-Identifier: MIT
using System.Runtime.InteropServices;
namespace Tutorial.Fem;

/// <summary>Serial upper-CSR assembly and exact elimination of fixed DOFs.</summary>
public sealed class FEModel : IDisposable
{
    public int Dim {get;}
    public List<Node> Nodes {get;}
    public List<Element> Elements {get;}
    public List<Load> Loads {get;}
    public List<Support> Supports {get;}
    private int[] globalToFree, rows, columns;
    private double[] values, force, displacement;
    private IntPtr handle;
    public FEModel(int dim,List<Node> nodes,List<Element> elements,List<Load> loads,List<Support> supports)
    {
        Dim=dim;Nodes=nodes;Elements=elements;Loads=loads;Supports=supports;
        for(int i=0;i<nodes.Count;i++)nodes[i].ID=i;
        for(int i=0;i<elements.Count;i++)elements[i].ID=i;
    }
    public void Initialize(bool hardKill=false)
    {
        if(Dim is not (2 or 3)||Elements.Count==0||Loads.Count==0||Supports.Count==0)throw new ArgumentException("Incomplete finite-element model");
        var fixedDof=new bool[Nodes.Count*Dim];
        foreach(var s in Supports){fixedDof[s.NodeID*Dim]|=s.Ux;fixedDof[s.NodeID*Dim+1]|=s.Uy;if(Dim==3)fixedDof[s.NodeID*Dim+2]|=s.Uz;}
        if(hardKill){
            // A disconnected, unloaded free body has arbitrary rigid displacement
            // and zero strain. Eliminate that block without modifying its material.
            var adjacencyNodes=Enumerable.Range(0,Nodes.Count).Select(_=>new List<int>()).ToArray();
            foreach(var e in Elements.Where(e=>e.Xe>0))foreach(var node in e.Nodes)adjacencyNodes[node.ID].Add(e.ID);
            var active=new bool[Nodes.Count];var visited=new bool[Elements.Count];var pending=new Queue<int>();
            foreach(var support in Supports){active[support.NodeID]=true;pending.Enqueue(support.NodeID);}
            while(pending.TryDequeue(out int i))foreach(int id in adjacencyNodes[i])if(!visited[id]){
                visited[id]=true;foreach(var node in Elements[id].Nodes)if(!active[node.ID]){active[node.ID]=true;pending.Enqueue(node.ID);}
            }
            foreach(var load in Loads)if(!active[load.NodeID]&&(load.X!=0||load.Y!=0||load.Z!=0))throw new InvalidOperationException("Hard-kill design disconnects a load.");
            for(int i=0;i<Nodes.Count;i++)if(!active[i])for(int d=0;d<Dim;d++)fixedDof[i*Dim+d]=true;
        }
        int count=0;globalToFree=fixedDof.Select(f=>f?-1:count++).ToArray();
        if(count==0)throw new ArgumentException("The model has no free degrees of freedom");
        var adjacency=Enumerable.Range(0,count).Select(_=>new HashSet<int>()).ToArray();
        var first=Elements[0];first.ComputeKe();
        bool SameGeometry(Element e)
        {
            if(e.GetType()!=first.GetType()||e.Material!=first.Material)return false;
            var a=e.Nodes[0].Position;var b=first.Nodes[0].Position;
            return e.Nodes.Select((n,i)=>{var f=first.Nodes[i].Position;return n.Position.X-a.X==f.X-b.X&&n.Position.Y-a.Y==f.Y-b.Y&&n.Position.Z-a.Z==f.Z-b.Z;}).All(v=>v);
        }
        foreach(var e in Elements)
        {
            if(e!=first){if(SameGeometry(e))e.Ke=first.Ke;else e.ComputeKe();}
            e.DOFs=e.Nodes.SelectMany(n=>Enumerable.Range(0,Dim).Select(d=>n.ID*Dim+d)).ToArray();
            if(hardKill&&e.Xe==0)continue;
            for(int i=0;i<e.DOFs.Length;i++)for(int j=i;j<e.DOFs.Length;j++)
            {int a=globalToFree[e.DOFs[i]],b=globalToFree[e.DOFs[j]];if(a>=0&&b>=0)adjacency[Math.Min(a,b)].Add(Math.Max(a,b));}
        }
        rows=new int[count+1];for(int i=0;i<count;i++)rows[i+1]=rows[i]+adjacency[i].Count;
        columns=adjacency.SelectMany(set=>set.Order()).ToArray();values=new double[columns.Length];force=new double[count];displacement=new double[count];
        foreach(var load in Loads){double[] f={load.X,load.Y,load.Z};for(int d=0;d<Dim;d++){int k=globalToFree[load.NodeID*Dim+d];if(k>=0)force[k]+=f[d];}}
        Dispose();handle=NativeCreate(rows,columns,values,count,columns.Length);
        if(handle==IntPtr.Zero)throw new InvalidOperationException("CHOLMOD symbolic analysis failed");
    }
    public int FreeDofCount=>force?.Length??0;
    public void AnalyzeHardKill(){Initialize(true);Analyze(1);}
    public void Analyze(double penalty,double minimumStiffness=0)
    {
        Array.Clear(values);
        foreach(var e in Elements)
        {
            double factor=minimumStiffness+(1-minimumStiffness)*Math.Pow(e.Xe,penalty);if(factor==0)continue;
            for(int i=0;i<e.DOFs.Length;i++)
            {
                int a=globalToFree[e.DOFs[i]];if(a<0)continue;
                for(int j=i;j<e.DOFs.Length;j++)
                {
                    int b=globalToFree[e.DOFs[j]];if(b<0)continue;
                    double k=e.Ke[i,j];if(Math.Abs(k)<1e-10)continue;
                    int row=Math.Min(a,b),col=Math.Max(a,b);
                    int index=Array.BinarySearch(columns,rows[row],rows[row+1]-rows[row],col);
                    if(index<0)throw new InvalidOperationException("Sparse pattern mismatch");
                    values[index]+=k*factor;
                }
            }
        }
        if(NativeSolve(handle,values,force,displacement)!=1)throw new InvalidOperationException("The stiffness matrix is singular or indefinite. Check disconnected material, mechanisms, supports and filter radius.");
        double U(int g){int i=globalToFree[g];return i<0?0:displacement[i];}
        foreach(var node in Nodes)node.Disp=new Vec3(U(node.ID*Dim),U(node.ID*Dim+1),Dim==3?U(node.ID*Dim+2):0);
    }
    public void Dispose(){if(handle!=IntPtr.Zero){NativeRelease(handle);handle=IntPtr.Zero;}}
    [DllImport("BesoNative.dll",EntryPoint="beso_create",CallingConvention=CallingConvention.Cdecl)]private static extern IntPtr NativeCreate(int[] rows,int[] columns,double[] values,int size,int nonzeros);
    [DllImport("BesoNative.dll",EntryPoint="beso_solve",CallingConvention=CallingConvention.Cdecl)]private static extern int NativeSolve(IntPtr handle,double[] values,double[] force,double[] displacement);
    [DllImport("BesoNative.dll",EntryPoint="beso_release",CallingConvention=CallingConvention.Cdecl)]private static extern void NativeRelease(IntPtr handle);
}
