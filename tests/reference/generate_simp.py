"""Independent SIMP reference: Gauss integration, SciPy sparse solve and Brent OC.
Equations: Andreassen et al. (2011), density-filter variant (top88 ft=2).
Original code; the cantilever loads replace the paper's half-MBB example.
Run with NumPy and SciPy; generated fixtures need no Python packages at runtime.
"""
import itertools, json, pathlib
import numpy as np
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import spsolve
from scipy.optimize import brentq

def solve_case(dim):
    nx,ny,nz=12,8,2 if dim==3 else 1
    nu=.30000001192092896; p=3; floor=1e-9; radius=2.; vf=.5
    signs=np.array([[-1,-1],[1,-1],[1,1],[-1,1]] if dim==2 else [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]])
    if dim==2: D=np.array([[1,nu,0],[nu,1,0],[0,0,(1-nu)/2]])/(1-nu**2)
    else:
        D=np.zeros((6,6));D[:3,:3]=nu;np.fill_diagonal(D[:3,:3],1-nu);D[3:,3:]=np.eye(3)*(1-2*nu)/2;D/=(1+nu)*(1-2*nu)
    ke=np.zeros((len(signs)*dim,)*2)
    for q in itertools.product([-1/np.sqrt(3),1/np.sqrt(3)],repeat=dim):
        grad=np.zeros((dim,len(signs)))
        for a in range(dim):
            grad[a]=signs[:,a]/2**(dim-1)
            for b in range(dim):
                if a!=b:grad[a]*=1+signs[:,b]*q[b]
        B=np.zeros((3 if dim==2 else 6,len(signs)*dim))
        for i in range(len(signs)):
            if dim==2:
                dx,dy=grad[:,i];B[:,2*i:2*i+2]=[[dx,0],[0,dy],[dy,dx]]
            else:
                dx,dy,dz=grad[:,i];B[:,3*i:3*i+3]=[[dx,0,0],[0,dy,0],[0,0,dz],[dy,dx,0],[0,dz,dy],[dz,0,dx]]
        ke+=B.T@D@B/2**dim
    node=lambda x,y,z=0:(z*(nx+1)+x)*(ny+1)+y
    edofs=[]; centers=[]
    for z in range(nz if dim==3 else 1):
        for x in range(nx):
            for y in range(ny):
                ids=[node(x+(s[0]+1)//2,y+(s[1]+1)//2,z+(s[2]+1)//2 if dim==3 else 0) for s in signs]
                edofs.append([dim*i+d for i in ids for d in range(dim)]);centers.append([x+.5,y+.5,z+.5])
    edofs=np.array(edofs);centers=np.array(centers);n=len(edofs)
    ndof=(nx+1)*(ny+1)*(nz+1 if dim==3 else 1)*dim
    fixed=[node(0,y,z)*dim+d for z in range(nz+1 if dim==3 else 1) for y in range(ny+1) for d in range(dim)]
    free=np.setdiff1d(np.arange(ndof),fixed); force=np.zeros(ndof);force[node(nx,ny//2,nz//2 if dim==3 else 0)*dim+1]=-1
    H=np.maximum(0,radius-np.linalg.norm(centers[:,None,:]-centers[None,:,:],axis=2));H/=H.sum(axis=1)[:,None]
    dv=H.T@np.ones(n);x=np.full(n,vf);rho=x.copy();frames=[]
    ii=np.repeat(edofs,len(edofs[0]),axis=1).ravel();jj=np.tile(edofs,(1,len(edofs[0]))).ravel()
    def analyze(rho):
        factors=floor+(1-floor)*rho**p
        K=coo_matrix((np.einsum('e,ij->eij',factors,ke).ravel(),(ii,jj)),shape=(ndof,ndof)).tocsc()
        u=np.zeros(ndof);u[free]=spsolve(K[free][:,free],force[free]);ce=np.einsum('ei,ij,ej->e',u[edofs],ke,u[edofs]);return force@u,ce
    for iteration in range(1,21):
        c,ce=analyze(rho);gain=H.T@(p*(1-floor)*rho**(p-1)*ce)
        lower=np.maximum(0,x-.2);upper=np.minimum(1,x+.2)
        def update(lam):return np.clip(x*np.sqrt(np.maximum(gain,1e-30)/(lam*dv)),lower,upper)
        lam=brentq(lambda l:dv@update(l)/n-vf,1e-15,max(1,float((gain/dv).max())*1e6),xtol=1e-13)
        x=update(lam);rho=H@x;post,_=analyze(rho)
        frames.append(dict(iter=iteration,preCompliance=c,compliance=post,density=rho.tolist()))
    return dict(dim=dim,nx=nx,ny=ny,nz=nz,vf=vf,radius=radius,penalty=p,nu=nu,frames=frames)
path=pathlib.Path(__file__).with_name('simp-independent.json')
path.write_text(json.dumps(dict(source='https://doi.org/10.1007/s00158-010-0594-7',description='Independent equations-based reference, not execution of the original MATLAB code',cases=[solve_case(2),solve_case(3)]),separators=(',',':'))+'\n')
print(path)
