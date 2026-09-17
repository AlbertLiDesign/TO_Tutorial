using MathNet.Numerics.LinearAlgebra.Double;
using System.Text.Json;
namespace Tutorial.Fem;
public static class ElementVerification
{
    public static void Run()
    {
        var material=new Material(1,.3);
        var cases=new List<(string Name,Element Element,double Measure)> {
            ("square Q4",new Quad4(new(){new(0,0),new(1,0),new(1,1),new(0,1)},material),1),
            ("trapezoid Q4",new Quad4(new(){new(0,0),new(2,0),new(1.5,1),new(0,1)},material),1.75),
            ("sheared H8",new Hex8(new(){new(0,0,0),new(2,0,0),new(2.2,1,0),new(.2,1,0),new(.3,0,1.5),new(2.3,0,1.5),new(2.5,1,1.5),new(.5,1,1.5)},material),3)
        };
        foreach(var (_,e,measure) in cases)
        {
            e.ComputeKe();
            if((e.Ke-e.Ke.Transpose()).FrobeniusNorm()>1e-10)throw new Exception("Element stiffness is not symmetric");
            var first=e.Ke.Clone();e.ComputeKe();
            if((e.Ke-first).FrobeniusNorm()!=0)throw new Exception("Repeated stiffness assembly changes the matrix");
            for(int d=0;d<e.Dim;d++)
            {
                var u=new DenseMatrix(e.Nodes.Count*e.Dim,1);for(int i=0;i<e.Nodes.Count;i++)u[i*e.Dim+d,0]=1;
                if(e.Ke.Multiply(u).FrobeniusNorm()>1e-9)throw new Exception("Rigid translation generates force");
            }
            foreach(var node in e.Nodes)node.Disp=new Vec3(-node.Position.Y,node.Position.X,0);
            if(Math.Abs(e.UnitEnergy())>1e-9)throw new Exception("Rigid rotation generates energy");
            foreach(var node in e.Nodes)node.Disp=new Vec3(node.Position.X,e.Dim==2?-material.nu*node.Position.Y:0,0);
            double modulus=e.Dim==2?material.E:material.E*(1-material.nu)/((1+material.nu)*(1-2*material.nu));
            double expected=.5*modulus*measure;
            if(Math.Abs(e.UnitEnergy()-expected)>1e-6*expected)throw new Exception("Constant strain patch energy is incorrect");
        }
        Console.WriteLine(JsonSerializer.Serialize(new{passed=true,cases=cases.Select(c=>c.Name),checks=new[]{"stiffness symmetry","rigid translation","rigid rotation","constant strain analytic energy","repeatable integration"}}));
    }
}
