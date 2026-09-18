// SPDX-License-Identifier: MIT
using Tutorial.Fem;
using KDTree;
namespace Tutorial.Optimization;

/// <summary>Row-normalized distance filter, including the transpose for chain-rule gradients.</summary>
public sealed class DensityFilter
{
    private readonly int[][] neighbours;
    private readonly double[][] weights;
    public DensityFilter(FEModel model,double radius)
    {
        int count=model.Elements.Count;
        var points=model.Elements.Select(e=>new[]{e.Nodes.Average(n=>n.Position.X),e.Nodes.Average(n=>n.Position.Y),e.Nodes.Average(n=>n.Position.Z)}).ToArray();
        var tree=new KDTree<int>(3);for(int i=0;i<count;i++)tree.AddPoint(points[i],i);
        neighbours=new int[count][];weights=new double[count][];
        for(int i=0;i<count;i++){
            neighbours[i]=tree.NearestNeighbors(points[i],count,radius*radius).ToArray();
            weights[i]=neighbours[i].Select(j=>Math.Max(0,radius-Math.Sqrt(points[i].Zip(points[j],(a,b)=>(a-b)*(a-b)).Sum()))).ToArray();
            double total=weights[i].Sum();for(int j=0;j<weights[i].Length;j++)weights[i][j]/=total;
        }
    }
    public double[] Apply(double[] x)
    {
        var result=new double[x.Length];
        for(int i=0;i<x.Length;i++)for(int k=0;k<weights[i].Length;k++)result[i]+=weights[i][k]*x[neighbours[i][k]];
        return result;
    }
    public double[] Transpose(double[] x)
    {
        var result=new double[x.Length];
        for(int i=0;i<x.Length;i++)for(int k=0;k<weights[i].Length;k++)result[neighbours[i][k]]+=weights[i][k]*x[i];
        return result;
    }
}
