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
        // Independent derivative and interface-transport checks (not merely bounds).
        foreach(int dim in new[]{2,3}){
            var settings=new Settings(Dim:dim,Nx:8,Ny:6,Nz:2,Method:"level-set");
            var solver=new LevelSetOptimizer(Engine.Build(settings),settings);solver.Initialize();
            using var model=solver.Model;
            var field=model.Elements.Select(e=>.3*Math.Sin(e.ID*.7)).ToArray();
            double Evaluate(double[] f){foreach(var e in model.Elements)e.Xe=LevelSetOptimizer.Density(f[e.ID]);model.Analyze(1);return model.Elements.Sum(e=>e.Xe*e.UnitEnergy());}
            Evaluate(field);var derivative=model.Elements.Select(e=>-LevelSetOptimizer.DensityDerivative(field[e.ID])*e.UnitEnergy()).ToArray();double error=0;
            foreach(int i in new[]{0,13,25,47}){const double h=1e-5;field[i]+=h;double a=Evaluate(field);field[i]-=2*h;double b=Evaluate(field);field[i]+=h;error=Math.Max(error,Math.Abs((a-b)/(2*h)-derivative[i])/Math.Max(1,Math.Abs(derivative[i])));}
            Require(error<1e-5,"Level-set adjoint sensitivity fails finite differences");
            var plane=model.Elements.Select(e=>e.Nodes.Average(n=>n.Position.X)-4).ToArray();
            var redistance=solver.Reinitialize(plane);Require(plane.Zip(redistance).All(p=>Math.Abs(p.First-p.Second)<1e-12),"Planar signed-distance reinitialization moved boundary");
            var transported=solver.Advance(plane,Enumerable.Repeat(1.0,plane.Length).ToArray(),0,.2);
            for(int z=0;z<(dim==3?2:1);z++)for(int x=1;x<7;x++)for(int y=0;y<6;y++){int i=(z*8+x)*6+y;Require(Math.Abs(transported[i]-plane[i]-.2/dim)<1e-12,"HJ plane transport sign/speed");}
            reports.Add(new{test="level-set adjoint finite difference, planar transport and signed distance",dim,maxRelativeError=error,passed=true});
        }
        // A removed right strip must give exactly the smaller physical model's C,
        // with fewer free DOFs and no residual stiffness in the deleted strip.
        foreach(int dim in new[]{2,3}){
            using var full=Engine.Build(new Settings(Dim:dim,Nx:8,Ny:6,Nz:2));
            using var reference=Engine.Build(new Settings(Dim:dim,Nx:6,Ny:6,Nz:2));
            full.Initialize();int before=full.FreeDofCount;
            foreach(var e in full.Elements)if(e.Nodes.Average(n=>n.Position.X)>6)e.Xe=0;
            full.Loads.Clear();foreach(var load in reference.Loads){var p=reference.Nodes[load.NodeID].Position;int id=full.Nodes.FindIndex(n=>n.Position==p);full.Loads.Add(new Load(id,load.X,load.Y,load.Z));}
            full.AnalyzeHardKill();reference.Initialize();reference.Analyze(1);
            double c=full.Elements.Where(e=>e.Xe>0).Sum(e=>e.UnitEnergy()),expected=reference.Elements.Sum(e=>e.UnitEnergy());
            Require(full.FreeDofCount<before&&Math.Abs(c-expected)/expected<1e-10,"Hard kill is not exact element/DOF removal");
            reports.Add(new{test="hard-kill reduced mesh equality",dim,relativeError=Math.Abs(c-expected)/expected,freeDofs=full.FreeDofCount,passed=true});
        }
        foreach(int dim in new[]{2,3})foreach(string method in new[]{"BESO","BESO-hard","SIMP","ESO","level-set"}){
            var settings=new Settings(Dim:dim,Nx:16,Ny:10,Nz:2,Vf:.6,Er:.08,MaxIter:method=="level-set"?300:80,Method:method=="BESO-hard"?"BESO":method,BesoKill:method=="BESO-hard"?"hard":"soft");
            var solver=Engine.Create(settings,"");
            try{
                solver.Initialize();var initial=solver.Model.Elements.Select(e=>e.Xe).ToArray();var previous=initial;double initialC=0,maxVolumeError=0;int steps=0;bool intermediate=false,hasBoundary=false;double priorEnergy=double.PositiveInfinity,priorAnalyzedVolume=1;int regrown=0;
                while(!solver.converged){double analyzedVolume=solver.Model.Elements.Average(e=>e.Xe);int before=solver.iter;solver.Optimize();if(before==solver.iter)break;var f=Engine.Capture(solver,0);steps++;
                    if(steps==1)initialC=f.C;
                    Require(double.IsFinite(f.C)&&f.C>0&&double.IsFinite(f.Delta),method+" invalid objective");
                    Require(f.Density.All(x=>double.IsFinite(x)&&x>=(method=="BESO-hard"?0:method=="level-set"?LevelSetOptimizer.VoidStiffness:.001)-1e-10&&x<=1+1e-10),method+" density bounds");
                    Require(f.Sensitivity.Length==f.Density.Length&&f.Sensitivity.All(double.IsFinite),method+" sensitivities");
                    Require(Math.Abs(f.Density.Average()-f.Volume)<1e-12,method+" volume definition");
                    intermediate|=f.Density.Any(x=>x>.01&&x<.99);
                    if(method=="BESO-hard"){
                        Require(f.Density.All(x=>x==0||x==1),"Hard kill has nonbinary density");
                        regrown+=f.Density.Zip(previous).Count(p=>p.First>p.Second);
                    }
                    if(method=="ESO")Require(f.Density.Zip(previous).All(p=>p.First<=p.Second),"ESO restored removed material");
                    if(method=="SIMP")maxVolumeError=Math.Max(maxVolumeError,Math.Abs(f.Volume-settings.Vf));
                    if(method=="level-set"){
                        if(Math.Abs(analyzedVolume-settings.Vf)<1e-5&&Math.Abs(priorAnalyzedVolume-settings.Vf)<1e-5)
                            Require(f.C<=priorEnergy*(1+1e-7),"Level set increased energy at fixed volume");
                        Require(f.LevelSet!=null&&f.LevelSet.All(double.IsFinite),"Missing/bad level set field");
                        Require(f.LevelSet.Select(LevelSetOptimizer.Density).Zip(f.Density).All(p=>Math.Abs(p.First-p.Second)<1e-12),"Level set density not derived from phi");
                        Require(f.Volume>=settings.Vf-1e-8,"Level-set volume overshoot");
                        maxVolumeError=Math.Abs(f.Volume-settings.Vf);
                        hasBoundary|=f.LevelSet.Min()<0&&f.LevelSet.Max()>0;
                    }
                    previous=f.Density;priorEnergy=f.C;priorAnalyzedVolume=analyzedVolume;
                }
                Require(steps>1&&steps<=settings.MaxIter,method+" iteration count");
                if(method=="SIMP"){
                    Require(intermediate&&maxVolumeError<1e-7,"SIMP did not preserve physical volume / continuous density");
                    Require(solver.LastC<initialC,"SIMP did not improve uniform initial design");
                }
                if(method=="level-set")Require(hasBoundary&&maxVolumeError<1e-8,"Level set did not evolve an interface at the prescribed volume: "+previous.Average());
                if(method=="BESO-hard")Require(regrown>0,"Hard-kill BESO never restored material");
                if(method=="ESO")Require(previous.Average()>=settings.Vf-1e-10&&previous.Average()-settings.Vf<=1.0/previous.Length,"ESO final volume");
                reports.Add(new{method,dim,steps,initialC,finalC=solver.LastC,volume=previous.Average(),maxVolumeError,intermediate,hasBoundary,regrown,passed=true});
            }finally{solver.Model.Dispose();}
        }
        foreach(var bad in new[]{new Settings(Method:"bad"),new Settings(TimeStep:double.NaN),new Settings(MoveLimit:0),new Settings(Regularization:1)}){
            bool rejected=false;try{bad.Validate();}catch(ArgumentException){rejected=true;}Require(rejected,"Invalid method parameter accepted");
        }
        string dir=Environment.GetEnvironmentVariable("TOPTEACH_REPORT_DIR")??Path.Combine(Path.GetTempPath(),"topteach-reports");Directory.CreateDirectory(dir);
        string output=JsonSerializer.Serialize(new{passed=true,reports},new JsonSerializerOptions{WriteIndented=true});File.WriteAllText(Path.Combine(dir,"methods-report.json"),output);Console.WriteLine(output);
    }
}
