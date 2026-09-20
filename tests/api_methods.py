"""Exercise method dispatch and serialized density/level-set histories over HTTP."""
import json, math, os, pathlib, time, urllib.request, urllib.error
base=os.environ.get('TOPTEACH_TEST_URL','http://127.0.0.1:5080')
def req(path,data=None):
    request=urllib.request.Request(base+path,data=None if data is None else json.dumps(data).encode(),headers={'Content-Type':'application/json'})
    with urllib.request.urlopen(request,timeout=30) as response:return json.load(response)
reports=[]
for dim in [2,3]:
    for method in ['SIMP','BESO','BESO-hard','ESO','level-set']:
        settings=dict(dim=dim,nx=12,ny=8,nz=2,vf=.6,er=.08,radius=2,penalty=3,maxIter=3,method="BESO" if method=="BESO-hard" else method,besoKill="hard" if method=="BESO-hard" else "soft")
        run=req('/api/runs',settings)['id'];deadline=time.time()+60
        while True:
            result=req('/api/runs/'+run)
            assert result['state']!='error',result
            if result['state'] in ['limit','converged']:break
            assert time.time()<deadline,method
            time.sleep(.1)
        assert result['settings']['method']==settings['method']
        assert result['count']==3,result
        frames=result['frames'];n=12*8*(2 if dim==3 else 1)
        for f in frames:
            assert len(f['density'])==n and len(f['sensitivity'])==n
            assert math.isfinite(f['c']) and f['c']>0
            assert all(-1e-10<=x<=1+1e-10 for x in f['density'])
            if method=='BESO-hard':assert all(x==0 or x==1 for x in f['density'])
            if method=='level-set':assert len(f['levelSet'])==n
            else:assert f.get('levelSet') is None
            if method=='SIMP':assert abs(f['volume']-.6)<1e-7
        if method=='ESO':
            for a,b in zip(frames,frames[1:]):assert all(y<=x for x,y in zip(a['density'],b['density']))
        reports.append(dict(dim=dim,method=method,state=result['state'],frames=len(frames),passed=True))
# Displayed delta must reproduce the post-update compliance frames exactly.
run=req('/api/runs',dict(nx=8,ny=6,method='SIMP',maxIter=12))['id']
deadline=time.time()+60
while True:
    result=req('/api/runs/'+run)
    assert result['state']!='error',result
    if result['state'] in ['limit','converged']:break
    assert time.time()<deadline
    time.sleep(.1)
frames=[]
while len(frames)<result['count']:
    batch=req('/api/runs/'+run+'?after='+str(frames[-1]['iter'] if frames else 0))['frames']
    assert batch
    frames.extend(batch)
assert len(frames)>=10
for i,f in enumerate(frames):
    expected=1.0
    if i>=9:
        old=sum(x['c'] for x in frames[i-9:i-4]);new=sum(x['c'] for x in frames[i-4:i+1])
        expected=abs(new-old)/max(abs(old),1e-30)
    assert abs(f['delta']-expected)<1e-12,(i,f['delta'],expected)
reports.append(dict(test='post-update displayed delta',passed=True))
for invalid in [dict(method='wrong'),dict(besoKill='wrong'),dict(elementSize=0),dict(additionRatio=.3),dict(moveLimit=0),dict(timeStep=1),dict(regularization=-1)]:
    try:req('/api/runs',invalid);raise AssertionError('Invalid parameters accepted')
    except urllib.error.HTTPError as e:assert e.code==400
report=dict(passed=True,reports=reports)
out=pathlib.Path(os.environ.get('TOPTEACH_REPORT_DIR','artifacts'));out.mkdir(exist_ok=True,parents=True)
(out/'api-methods-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
