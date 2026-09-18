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
for invalid in [dict(method='wrong'),dict(besoKill='wrong'),dict(elementSize=0),dict(additionRatio=.3),dict(moveLimit=0),dict(timeStep=1),dict(regularization=-1)]:
    try:req('/api/runs',invalid);raise AssertionError('Invalid parameters accepted')
    except urllib.error.HTTPError as e:assert e.code==400
report=dict(passed=True,reports=reports)
out=pathlib.Path(os.environ.get('TOPTEACH_REPORT_DIR','artifacts'));out.mkdir(exist_ok=True,parents=True)
(out/'api-methods-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
