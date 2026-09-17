// SPDX-License-Identifier: MIT
// Standalone small-strain isotropic Q4 (plane stress) and H8 finite elements.
using MathNet.Numerics.LinearAlgebra;
using MathNet.Numerics.LinearAlgebra.Double;
namespace Tutorial.Fem;

public record Vec3(double X, double Y, double Z);
public sealed class Node(double x,double y,double z=0)
{
    public Vec3 Position {get;}=new(x,y,z);
    public Vec3 Disp {get;set;}=new(0,0,0);
    public int ID {get;set;}
}
public record Material(double E,double nu);
public record Load(int NodeID,double X,double Y,double Z=0);
public record Support(int NodeID,bool Ux,bool Uy,bool Uz=true);
public abstract class Element
{
    public int ID;
    public List<Node> Nodes;
    public Material Material;
    public int Dim;
    public double Xe=1, C;
    public Matrix<double> Ke;
    public int[] DOFs;
    public abstract void ComputeKe();
    public double UnitEnergy()
    {
        var u=new DenseMatrix(Nodes.Count*Dim,1);
        for(int i=0;i<Nodes.Count;i++)
        {
            u[i*Dim,0]=Nodes[i].Disp.X;u[i*Dim+1,0]=Nodes[i].Disp.Y;
            if(Dim==3)u[i*Dim+2,0]=Nodes[i].Disp.Z;
        }
        return .5*u.TransposeThisAndMultiply(Ke).Multiply(u)[0,0];
    }
}
public sealed class Quad4 : Element
{
    public Quad4(List<Node> nodes,Material material)
    {if(nodes.Count!=4)throw new ArgumentException("Q4 needs four nodes");Nodes=nodes;Material=material;Dim=2;}
    public override void ComputeKe()
    {
        // The regular square has an exact closed form; preserve it for the teaching grid.
        var a=Nodes[0].Position;double h=Nodes[1].Position.X-a.X;
        if(h>0 && Nodes[1].Position.Y==a.Y && Nodes[2].Position.X==a.X+h && Nodes[2].Position.Y==a.Y+h && Nodes[3].Position.X==a.X && Nodes[3].Position.Y==a.Y+h)
        {
            double n=Material.nu,scale=Material.E/(1-n*n);
            double[] k={.5-n/6,.125+n*.125,-.25-n/12,-.125+n*.375,-.25+n/12,-.125-n*.125,n/6,.125-n*.375};
            for(int i=0;i<8;i++)k[i]*=scale;
            int[,] index={{0,1,2,3,4,5,6,7},{1,0,7,6,5,4,3,2},{2,7,0,5,6,3,4,1},{3,6,5,0,7,2,1,4},{4,5,6,7,0,1,2,3},{5,4,3,2,1,0,7,6},{6,3,4,1,2,7,0,5},{7,2,1,4,3,6,5,0}};
            Ke=DenseMatrix.Create(8,8,(i,j)=>k[index[i,j]]);return;
        }
        // Isoparametric quadrilateral fallback, node order counter-clockwise.
        double nu=Material.nu,coeff=Material.E/(1-nu*nu);
        var d=DenseMatrix.OfArray(new double[,]{{coeff,nu*coeff,0},{nu*coeff,coeff,0},{0,0,(1-nu)*.5*coeff}});
        double[] points={-.7745967,0,.7745967},weights={.5555556,.8888889,.5555556};
        int[] sx={-1,1,1,-1},sy={-1,-1,1,1};Ke=new DenseMatrix(8,8);
        for(int a0=0;a0<3;a0++)for(int b0=0;b0<3;b0++)
        {
            var grad=new double[2,4];var jac=new DenseMatrix(2,2);
            for(int i=0;i<4;i++)
            {
                grad[0,i]=sx[i]*(1+sy[i]*points[b0])*.25;grad[1,i]=sy[i]*(1+sx[i]*points[a0])*.25;
                for(int r=0;r<2;r++){jac[r,0]+=grad[r,i]*Nodes[i].Position.X;jac[r,1]+=grad[r,i]*Nodes[i].Position.Y;}
            }
            double det=jac.Determinant();if(det<=0)throw new ArgumentException("Q4 has inverted or degenerate geometry");
            var inv=jac.Inverse();var b=new DenseMatrix(3,8);
            for(int i=0;i<4;i++)
            {
                double dx=inv[0,0]*grad[0,i]+inv[0,1]*grad[1,i],dy=inv[1,0]*grad[0,i]+inv[1,1]*grad[1,i];
                b[0,2*i]=dx;b[1,2*i+1]=dy;b[2,2*i]=dy;b[2,2*i+1]=dx;
            }
            Ke+=weights[a0]*weights[b0]*b.TransposeThisAndMultiply(d).Multiply(b).Multiply(det);
        }
    }
}
public sealed class Hex8 : Element
{
    public Hex8(List<Node> nodes,Material material)
    {if(nodes.Count!=8)throw new ArgumentException("H8 needs eight nodes");Nodes=nodes;Material=material;Dim=3;}
    public override void ComputeKe()
    {
        double n=Material.nu,c=Material.E/((1+n)*(1-2*n));var d=new DenseMatrix(6,6);
        for(int i=0;i<3;i++)for(int j=0;j<3;j++)d[i,j]=(i==j?1-n:n)*c;
        for(int i=3;i<6;i++)d[i,i]=(1-2*n)*c*.5;
        // Decimal quadrature and traversal order intentionally match the reference fixtures.
        double[] points={-.8611363,-.3399810,.8611363,.3399810},weights={.3478548,.6521452,.3478548,.6521452};
        int[] sx={-1,1,1,-1,-1,1,1,-1},sy={-1,-1,1,1,-1,-1,1,1},sz={-1,-1,-1,-1,1,1,1,1};
        Ke=new DenseMatrix(24,24);
        for(int ix=0;ix<4;ix++)for(int iy=0;iy<4;iy++)for(int iz=0;iz<4;iz++)
        {
            var grad=new double[3,8];var jac=new DenseMatrix(3,3);
            for(int i=0;i<8;i++)
            {
                grad[0,i]=sx[i]*(1+sy[i]*points[iy])*(1+sz[i]*points[iz])*.125;
                grad[1,i]=sy[i]*(1+sx[i]*points[ix])*(1+sz[i]*points[iz])*.125;
                grad[2,i]=sz[i]*(1+sx[i]*points[ix])*(1+sy[i]*points[iy])*.125;
                for(int r=0;r<3;r++)
                {jac[r,0]+=grad[r,i]*Nodes[i].Position.X;jac[r,1]+=grad[r,i]*Nodes[i].Position.Y;jac[r,2]+=grad[r,i]*Nodes[i].Position.Z;}
            }
            double det=jac.Determinant();if(det<=0)throw new ArgumentException("H8 has inverted or degenerate geometry");
            var inv=jac.Inverse();var b=new DenseMatrix(6,24);
            for(int i=0;i<8;i++)
            {
                double dx=inv[0,0]*grad[0,i]+inv[0,1]*grad[1,i]+inv[0,2]*grad[2,i];
                double dy=inv[1,0]*grad[0,i]+inv[1,1]*grad[1,i]+inv[1,2]*grad[2,i];
                double dz=inv[2,0]*grad[0,i]+inv[2,1]*grad[1,i]+inv[2,2]*grad[2,i];int col=3*i;
                b[0,col]=dx;b[1,col+1]=dy;b[2,col+2]=dz;
                b[3,col]=dy;b[3,col+1]=dx;b[4,col+1]=dz;b[4,col+2]=dy;b[5,col]=dz;b[5,col+2]=dx;
            }
            Ke+=weights[ix]*weights[iy]*weights[iz]*b.TransposeThisAndMultiply(d).Multiply(b).Multiply(Math.Abs(det));
        }
    }
}
