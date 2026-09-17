using System.Text.Json;
using KDTree;
public static class SpatialVerification
{
    public static void Run()
    {
        int queries=0;
        var random=new Random(5817);
        foreach(int dimensions in new[]{2,3,5})
        {
            var points=Enumerable.Range(0,240).Select(_=>Enumerable.Range(0,dimensions).Select(_=>(double)random.Next(-4,5)).ToArray()).ToArray();
            var tree=new KDTree<int>(dimensions);
            for(int i=0;i<points.Length;i++)tree.AddPoint(points[i],i);
            void Check(int seed)
            {
                var rng=new Random(seed);var q=Enumerable.Range(0,dimensions).Select(_=>rng.NextDouble()*10-5).ToArray();
                foreach(double radius in new[]{0d,1d,4d,25d,-1d}) foreach(int count in new[]{0,1,7,1024})
                {
                    double D(int i)=>points[i].Select((x,d)=>(x-q[d])*(x-q[d])).Sum();
                    var expected=Enumerable.Range(0,points.Length).Select(i=>(i,dist:D(i))).Where(t=>radius<0||t.dist<=radius).OrderBy(t=>t.dist).ThenBy(t=>t.i).Take(count).Select(t=>t.i);
                    if(!tree.NearestNeighbors(q,count,radius).SequenceEqual(expected))throw new Exception("KD-tree does not match exhaustive search");
                    Interlocked.Increment(ref queries);
                }
            }
            Parallel.For(0,40,Check);
            tree.AddPoint(Enumerable.Repeat(100d,dimensions).ToArray(),240);
            if(tree.NearestNeighbors(Enumerable.Repeat(100d,dimensions).ToArray(),1,0).Single()!=240)throw new Exception("Rebuild after insertion failed");
        }
        var ties=new KDTree<int>(2,1);
        double[][] coordinates={new[]{1d,0},new[]{-1d,0},new[]{0d,1},new[]{0d,-1},new[]{1d,0}};
        for(int i=0;i<coordinates.Length;i++)ties.AddPoint(coordinates[i],i);
        coordinates[0][0]=999; // Input ownership: the index must hold a copy.
        if(!ties.NearestNeighbors(new[]{0d,0},3,1).SequenceEqual(new[]{0,1,2}))throw new Exception("Tie or inclusive radius failure");
        if(new KDTree<int>(3).NearestNeighbors(new double[3],10).Any())throw new Exception("Empty tree failure");
        var report=new{passed=true,queries,checks=new[]{"exhaustive 2D/3D/5D comparison","parallel queries","inclusive squared radius","deterministic equal-distance order","duplicate points","insertion after first query","copied input coordinates","empty and zero-count queries"}};
        Console.WriteLine(JsonSerializer.Serialize(report));
    }
}
