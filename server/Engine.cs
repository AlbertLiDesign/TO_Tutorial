using System.Diagnostics;
using Tutorial.Fem;
using Tutorial.Optimization;

public record Settings(int Dim=2, int Nx=80, int Ny=50, int Nz=4, double Vf=.5,
    double Er=.02, double Radius=3, double Penalty=3, int MaxIter=100,
    double Young=1, double Nu=.30000001192092896, double Force=-1, double LoadY=.5)
{
    public void Validate()
    {
        if (Dim is not (2 or 3) || Nx<4 || Ny<4 || Nx>200 || Ny>150 || Nz<1 || Nz>32)
            throw new ArgumentException("网格范围：Nx 4–200、Ny 4–150、Nz 1–32。");
        if ((long)Nx*Ny*(Dim==3?Nz:1)>(Dim==3?32000:30000)) throw new ArgumentException("网格上限：2D 30,000 / 3D 32,000 单元。");
        if (!double.IsFinite(Vf+Er+Radius+Penalty+Young+Nu+Force+LoadY) || Vf<.05 || Vf>.95 || Er<.001 || Er>.2 || Radius<1 || Radius>8 || Penalty<1 || Penalty>5 || MaxIter<1 || MaxIter>300 || Young<.000001 || Young>1e9 || Nu<0 || Nu>=.49 || Force==0 || Math.Abs(Force)>1e6 || LoadY<0 || LoadY>1)
            throw new ArgumentException("参数超出范围，请检查输入。");
    }
}
public record Frame(int Iter, double C, double Volume, double Delta, double Threshold, double Seconds, double[] Density, double[] Sensitivity);
public static class Engine
{
    public static FEModel Build(Settings s)
    {
        var nodes=new List<Node>(); var elements=new List<Element>();
        var material=new Material(s.Young,s.Nu); int nz=s.Dim==3?s.Nz:0;
        int Id(int x,int y,int z=0)=>(z*(s.Nx+1)+x)*(s.Ny+1)+y;
        for(int z=0;z<=nz;z++) for(int x=0;x<=s.Nx;x++) for(int y=0;y<=s.Ny;y++) nodes.Add(new Node((double)x,(double)y,(double)z));
        for(int z=0;z<(s.Dim==3?s.Nz:1);z++) for(int x=0;x<s.Nx;x++) for(int y=0;y<s.Ny;y++)
        {
            var ids=new List<int>{Id(x,y,z),Id(x+1,y,z),Id(x+1,y+1,z),Id(x,y+1,z)};
            if(s.Dim==3) ids.AddRange(new[]{Id(x,y,z+1),Id(x+1,y,z+1),Id(x+1,y+1,z+1),Id(x,y+1,z+1)});
            var en=ids.Select(i=>nodes[i]).ToList();
            elements.Add(s.Dim==2?new Quad4(en,material):new Hex8(en,material));
        }
        var supports=new List<Support>();
        for(int z=0;z<=nz;z++) for(int y=0;y<=s.Ny;y++) supports.Add(new Support(Id(0,y,z),true,true,true));
        // For odd grids, split the load between adjacent nodes so its location remains exact.
        var loads=new List<Load>(); double yp=s.LoadY*s.Ny,zp=nz*.5;
        foreach(var (y,wy) in Split(yp)) foreach(var (z,wz) in Split(zp))
            if(wy*wz>0) loads.Add(new Load(Id(s.Nx,y,z),0,s.Force*wy*wz,0));
        return new FEModel(s.Dim,nodes,elements,loads,supports);
    }
    static IEnumerable<(int,double)> Split(double v)
    {int low=(int)Math.Floor(v);yield return(low,1-(v-low));if(v>low)yield return(low+1,v-low);}
    public static BESO Create(Settings s,string path,FEModel model=null)=>new BESO(path,model??Build(s),s.Radius,s.Er,s.Penalty,s.Vf,s.MaxIter);
    public static Frame Capture(BESO b,double elapsed)
    {
        return new Frame(b.iter,b.LastC,b.Model.Elements.Average(e=>e.Xe),b.Delta,b.isovalues.Last(),elapsed,b.Model.Elements.Select(e=>e.Xe).ToArray(),b.Sensitivities.ToArray());
    }
}
public sealed class Run : IDisposable
{
    public readonly string Id=Guid.NewGuid().ToString("N");
    public readonly Settings Settings; public readonly List<Frame> Frames=new();
    public readonly object Gate=new(); public string State="queued",Error=null;
    public volatile bool Cancel=false, Pause=false; public volatile int Steps=0;
    public DateTime Touched=DateTime.UtcNow;
    public Run(Settings s){Settings=s;}
    public void Dispose(){Cancel=true;}
    public void Execute(SemaphoreSlim queue)
    {
        string dir=Path.Combine(Path.GetTempPath(),"topteach-"+Id); Directory.CreateDirectory(dir);
        BESO b=null;
        try
        {
            while(!queue.Wait(200)) {if(Cancel)return;}
            try
            {
                if(Cancel)return;
                lock(Gate) State="initializing";
                b=Engine.Create(Settings,Path.Combine(dir,"beso")); b.Initialize(); var clock=Stopwatch.StartNew();
                while(!b.converged&&!Cancel)
                {
                    if(Pause&&Steps<=0){lock(Gate)State="paused";Thread.Sleep(80);continue;}
                    if(Steps>0)Steps--;
                    lock(Gate)State="running";
                    int prior=b.iter; b.Optimize(false);
                    if(b.iter>prior){var f=Engine.Capture(b,clock.Elapsed.TotalSeconds);lock(Gate)Frames.Add(f);}
                }
                lock(Gate) State=Cancel?"cancelled":b.iter>=Settings.MaxIter?"limit":"converged";
            }
            finally{queue.Release();}
        }
        catch(Exception e){lock(Gate){State="error";Error=e.Message;}Console.Error.WriteLine(e);}
        finally{b?.Model.Dispose();Directory.Delete(dir,true); if(Cancel)lock(Gate)State="cancelled";}
    }
}
