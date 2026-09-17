import json,time,urllib.request,urllib.error,os,pathlib
base=os.environ.get('TOPTEACH_TEST_URL','http://127.0.0.1:5080')
def req(path,data=None):
 r=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers={'Content-Type':'application/json'})
 with urllib.request.urlopen(r,timeout=30) as f:
  text=f.read();return json.loads(text) if text else None
def wait(i,pred,timeout=45):
 end=time.time()+timeout
 while time.time()<end:
  s=req('/api/runs/'+i)
  if s['state']=='error':raise AssertionError(s['error'])
  if pred(s):return s
  time.sleep(.15)
 raise AssertionError('Timed out')
s=dict(dim=2,nx=30,ny=20,nz=4,vf=.4,er=.02,radius=2,penalty=3,maxIter=60,young=1,nu=.3,force=-1,loadY=.5)
i=req('/api/runs',s)['id'];req('/api/runs/'+i+'/pause',{});a=wait(i,lambda a:a['state']=='paused');count=a['count'];req('/api/runs/'+i+'/step',{});b=wait(i,lambda a:a['state']=='paused' and a['count']==count+1);req('/api/runs/'+i+'/resume',{});wait(i,lambda a:a['count']>b['count']);wait(i,lambda a:a['state'] in ['limit','converged']);i=req('/api/runs',s)['id'];req('/api/runs/'+i+'/stop',{});wait(i,lambda a:a['state']=='cancelled')
s.update(dim=3,nx=10,ny=6,nz=3,maxIter=3)
i=req('/api/runs',s)['id'];a=wait(i,lambda a:a['state']=='limit');assert a['count']==3;assert len(a['frames'][-1]['density'])==180;assert a['frames'][-1]['c']>0
s['nx']=10000
try:req('/api/runs',s);raise AssertionError('Expected validation failure')
except urllib.error.HTTPError as e:assert e.code==400
report={'passed':True,'checks':['pause','one-step exactly one iteration','resume','stop','3D odd thickness and iteration limit','density length','positive energy','invalid mesh rejected']}
report_dir=pathlib.Path(os.environ.get('TOPTEACH_REPORT_DIR','artifacts'))
report_dir.mkdir(parents=True,exist_ok=True)
(report_dir/'api-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
