using System.Text.Json;
using Tutorial.Fem;
using Tutorial.Optimization;

public static class MethodVerification
{
    static void Require(bool test,string message){if(!test)throw new Exception(message);}
    public static void Run()
    {
        var reports=new List<object>();
        // Check the physical density filter chain rule against FEA finite differences.
        using(var model=Engine.Build(new Settings(Nx:8,Ny:6))){
            model.Initialize();var filter=new DensityFilter(model,2);
            var x=Enumerable.Range(0,48).Select(i=>.55+.1*Math.Sin(i)).ToArray();
            double Evaluate(double[] design){var rho=filter.Apply(design);foreach(var e in model.Elements)e.Xe=rho[e.ID];model.Analyze(3);return model.Elements.Sum(e=>Math.Pow(e.Xe,3)*e.UnitEnergy());}
            Evaluate(x);
            var dc=filter.Transpose(model.Elements.Select(e=>-3*e.Xe*e.Xe*e.UnitEnergy()).ToArray());
            double maxError=0;
            foreach(int i in new[]{0,13,25,47}){const double h=1e-5;x[i]+=h;double plus=Evaluate(x);x[i]-=2*h;double minus=Evaluate(x);x[i]+=h;double numerical=(plus-minus)/(2*h);maxError=Math.Max(maxError,Math.Abs(numerical-dc[i])/Math.Max(1,Math.Abs(dc[i])));}
            Require(maxError<1e-5,"SIMP filtered sensitivity differs from finite differences");
            reports.Add(new{test="filtered SIMP gradient vs central finite differences",maxRelativeError=maxError,passed=true});
        }
        foreach(int dim in new[]{2,3})foreach(string method in new[]{"BESO","SIMP","ESO","level-set"}){
            var settings=new Settings(Dim:dim,Nx:16,Ny:10,Nz:2,Vf:.6,Er:.08,MaxIter:80,Method:method);
            var solver=Engine.Create(settings,"");
            try{
                solver.Initialize();var initial=solver.Model.Elements.Select(e=>e.Xe).ToArray();var previous=initial;double initialC=0,maxVolumeError=0;int steps=0;bool intermediate=false,hasBoundary=false;
                while(!solver.converged){int before=solver.iter;solver.Optimize();if(before==solver.iter)break;var f=Engine.Capture(solver,0);steps++;
                    if(steps==1)initialC=f.C;
                    Require(double.IsFinite(f.C)&&f.C>0&&double.IsFinite(f.Delta),method+" invalid objective");
                    Require(f.Density.All(x=>double.IsFinite(x)&&x>=.001-1e-10&&x<=1+1e-10),method+" density bounds");
                    Require(f.Sensitivity.Length==f.Density.Length&&f.Sensitivity.All(double.IsFinite),method+" sensitivities");
                    Require(Math.Abs(f.Density.Average()-f.Volume)<1e-12,method+" volume definition");
                    intermediate|=f.Density.Any(x=>x>.01&&x<.99);
                    if(method=="ESO")Require(f.Density.Zip(previous).All(p=>p.First<=p.Second),"ESO restored removed material");
                    if(method=="SIMP")maxVolumeError=Math.Max(maxVolumeError,Math.Abs(f.Volume-settings.Vf));
                    if(method=="level-set"){
                        Require(f.LevelSet!=null&&f.LevelSet.All(x=>x>=-1&&x<=1),"Missing/bad level set field");
                        Require(f.LevelSet.Select(LevelSetOptimizer.Density).Zip(f.Density).All(p=>Math.Abs(p.First-p.Second)<1e-12),"Level set density not derived from phi");
                        double scheduled=Math.Max(settings.Vf,Math.Pow(1-settings.Er,f.Iter));
                        maxVolumeError=Math.Max(maxVolumeError,Math.Abs(f.Volume-scheduled));
                        hasBoundary|=f.LevelSet.Min()<0&&f.LevelSet.Max()>0;
                    }
                    previous=f.Density;
                }
                Require(steps>1&&steps<=settings.MaxIter,method+" iteration count");
                if(method=="SIMP"){
                    Require(intermediate&&maxVolumeError<1e-7,"SIMP did not preserve physical volume / continuous density");
                    Require(solver.LastC<initialC,"SIMP did not improve uniform initial design");
                }
                if(method=="level-set")Require(hasBoundary&&maxVolumeError<1e-8,"Level set did not evolve an interface at the prescribed volume");
                if(method=="ESO")Require(previous.Average()>=settings.Vf-1e-10&&previous.Average()-settings.Vf<=1.0/previous.Length,"ESO final volume");
                reports.Add(new{method,dim,steps,initialC,finalC=solver.LastC,volume=previous.Average(),maxVolumeError,intermediate,hasBoundary,passed=true});
            }finally{solver.Model.Dispose();}
        }
        foreach(var bad in new[]{new Settings(Method:"bad"),new Settings(TimeStep:double.NaN),new Settings(MoveLimit:0),new Settings(Regularization:1)}){
            bool rejected=false;try{bad.Validate();}catch(ArgumentException){rejected=true;}Require(rejected,"Invalid method parameter accepted");
        }
        string dir=Environment.GetEnvironmentVariable("TOPTEACH_REPORT_DIR")??Path.Combine(Path.GetTempPath(),"topteach-reports");Directory.CreateDirectory(dir);
        string output=JsonSerializer.Serialize(new{passed=true,reports},new JsonSerializerOptions{WriteIndented=true});File.WriteAllText(Path.Combine(dir,"methods-report.json"),output);Console.WriteLine(output);
    }
}
