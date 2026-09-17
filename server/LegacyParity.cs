using System.Text.Json;
public static class LegacyParity
{
    public static void Run()
    {
        var reports=new List<object>();bool passed=true;
        foreach(var path in Directory.GetFiles(Path.Combine(AppContext.BaseDirectory,"fixtures","baselines"),"*.json").Order())
        {
            using var doc=JsonDocument.Parse(File.ReadAllText(path));var root=doc.RootElement;
            var s=root.GetProperty("settings").Deserialize<Settings>(new JsonSerializerOptions{PropertyNameCaseInsensitive=true});
            var expected=root.GetProperty("frames").EnumerateArray().ToArray();
            var dir=Path.Combine(Path.GetTempPath(),"topteach-legacy-"+Guid.NewGuid());Directory.CreateDirectory(dir);
            var b=Engine.Create(s,Path.Combine(dir,"beso"));int mismatches=0,firstMismatch=0,steps=0;double cDiff=0,thresholdDiff=0;
            try
            {
                b.Initialize();
                while(!b.converged)
                {
                    int before=b.iter;b.Optimize(false);if(before==b.iter)break;
                    var f=Engine.Capture(b,0);steps++;
                    if(f.Iter>expected.Length){mismatches++;if(firstMismatch==0)firstMismatch=f.Iter;continue;}
                    var old=expected[f.Iter-1];var mask=old.GetProperty("solid").GetString();
                    for(int i=0;i<f.Density.Length;i++)if((f.Density[i]==1?'1':'0')!=mask[i]){mismatches++;if(firstMismatch==0)firstMismatch=f.Iter;}
                    cDiff=Math.Max(cDiff,Math.Abs(f.C-old.GetProperty("c").GetDouble())/Math.Max(1,Math.Abs(old.GetProperty("c").GetDouble())));
                    thresholdDiff=Math.Max(thresholdDiff,Math.Abs(f.Threshold-old.GetProperty("threshold").GetDouble()));
                }
                bool exactTopology=mismatches==0&&steps==expected.Length;
                passed&=exactTopology&&cDiff<=1e-9;
                reports.Add(new{name=Path.GetFileNameWithoutExtension(path),steps,expectedSteps=expected.Length,topologyMismatches=mismatches,firstMismatch,maxRelativeCError=cDiff,maxAbsoluteThresholdError=thresholdDiff,exactTopology});
            }
            finally{b.Model.Dispose();Directory.Delete(dir,true);}
        }
        var output=JsonSerializer.Serialize(new{passed,scope="Original DLL snapshots captured on macOS ARM64; topology must match every step, energy relative tolerance 1e-9",reports},new JsonSerializerOptions{WriteIndented=true});
        var reportDir=Environment.GetEnvironmentVariable("TOPTEACH_REPORT_DIR")??Path.Combine(Path.GetTempPath(),"topteach-reports");Directory.CreateDirectory(reportDir);File.WriteAllText(Path.Combine(reportDir,"legacy-parity-report.json"),output);Console.WriteLine(output);
        if(!passed)throw new Exception("Legacy KDTree regression differs; see legacy-parity-report.json");
    }
}
