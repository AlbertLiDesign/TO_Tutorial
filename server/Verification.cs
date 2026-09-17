using System.Globalization;
using System.Text.Json;
using Tutorial.Fem;
using Tutorial.Optimization;
public static class Verification
{
    public static void Run()
    {
        var reports=new List<object>();
        var sample=Path.Combine(AppContext.BaseDirectory,"fixtures","reference-cantilever-80x50.txt");
        var material=new Material(1,.30000001192092896);
        FEModel Reference2D()
        {
            var nodes=new List<Node>();var elems=new List<Element>();var loads=new List<Load>();var supports=new List<Support>();
            foreach(var line in File.ReadLines(sample)){
                var t=line.Split(',');double D(int i)=>double.Parse(t[i],CultureInfo.InvariantCulture);int I(int i)=>int.Parse(t[i]);
                switch(t[0]){
                    case "N":nodes.Add(new Node(D(1),D(2),D(3)));break;
                    case "E":elems.Add(new Quad4(t.Skip(1).Select(x=>nodes[int.Parse(x)]).ToList(),material));break;
                    case "L":loads.Add(new Load(I(1),D(2),D(3),D(4)));break;
                    case "S":supports.Add(new Support(I(1),I(2)==1,I(3)==1,I(4)==1));break;
                }
            }
            return new FEModel(2,nodes,elems,loads,supports);
        }
        void Compare(string name,Settings s,FEModel reference)
        {
            var dir=Path.Combine(Path.GetTempPath(),Guid.NewGuid().ToString());Directory.CreateDirectory(dir);
            var a=Engine.Create(s,Path.Combine(dir,"web"));var b=new BESO(Path.Combine(dir,"direct"),reference,s.Radius,s.Er,s.Penalty,s.Vf,s.MaxIter);
            double maxC=0,maxSen=0;int mismatch=0,steps=0;
            try{
                a.Initialize();b.Initialize();
                while(!a.converged&&!b.converged){int prev=a.iter;a.Optimize(false);b.Optimize(false);if(a.iter==prev)break;
                    var fa=Engine.Capture(a,0);var fb=Engine.Capture(b,0);steps++;
                    maxC=Math.Max(maxC,Math.Abs(fa.C-fb.C));
                    for(int i=0;i<fa.Density.Length;i++){if(fa.Density[i]!=fb.Density[i])mismatch++;maxSen=Math.Max(maxSen,Math.Abs(fa.Sensitivity[i]-fb.Sensitivity[i]));}
                    if(fa.Volume!=fb.Volume||fa.Delta!=fb.Delta||fa.Threshold!=fb.Threshold)throw new Exception("History mismatch");
                }
                if(mismatch!=0||maxC!=0||maxSen!=0||a.iter!=b.iter||a.converged!=b.converged)throw new Exception("Independent model parity failed");
                reports.Add(new{name,steps,densityMismatches=mismatch,maxComplianceDifference=maxC,maxSensitivityDifference=maxSen,passed=true});
            }finally{a.Model.Dispose();b.Model.Dispose();Directory.Delete(dir,true);}
        }
        Compare("80x50 generated cantilever vs reference input",new Settings(),Reference2D());
        // Independent reference mesh construction; same canonical numbering as the web contract.
        var s3=new Settings(Dim:3,Nx:12,Ny:8,Nz:4,MaxIter:45);
        var ns=Enumerable.Range(0,5).SelectMany(z=>Enumerable.Range(0,13).SelectMany(x=>Enumerable.Range(0,9).Select(y=>new Node((double)x,(double)y,(double)z)))).ToList();
        Node At(int x,int y,int z)=>ns.Single(n=>n.Position.X==x&&n.Position.Y==y&&n.Position.Z==z);
        var es=new List<Element>();
        for(int z=0;z<4;z++)for(int x=0;x<12;x++)for(int y=0;y<8;y++)es.Add(new Hex8(new(){At(x,y,z),At(x+1,y,z),At(x+1,y+1,z),At(x,y+1,z),At(x,y,z+1),At(x+1,y,z+1),At(x+1,y+1,z+1),At(x,y+1,z+1)},material));
        Compare("12x8x4 independent 3D cantilever",s3,new FEModel(3,ns,es,new(){new Load(ns.IndexOf(At(12,4,2)),0,-1,0)},ns.Where(n=>n.Position.X==0).Select(n=>new Support(ns.IndexOf(n),true,true,true)).ToList()));
        var output=JsonSerializer.Serialize(new{time=DateTime.UtcNow,scope="Same source and native binary; serial assembly; exact equality on tested cases only",reports},new JsonSerializerOptions{WriteIndented=true});
        var reportDir=Environment.GetEnvironmentVariable("TOPTEACH_REPORT_DIR")??Path.Combine(Path.GetTempPath(),"topteach-reports");
        Directory.CreateDirectory(reportDir);
        File.WriteAllText(Path.Combine(reportDir,"parity-report.json"),output);Console.WriteLine(output);
    }
}
