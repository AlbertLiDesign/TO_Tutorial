import './tutorial.js?v=13';
import {showPane} from './layout.js?v=13';
import {t, meshText, applyLanguage, toggleLanguage} from './i18n.js?v=13';
const $=s=>document.querySelector(s), fields=['additionRatio','elementSize','nx','ny','nz','vf','er','radius','penalty','maxIter','young','nu','force','loadY','moveLimit','timeStep','regularization'];
let dim=2,runId=null,frames=[],current=-1,state='ready',running=false,sensitivity=false,follow=true,pollTimer=null,requesting=false,polling=false;
let activeSettings=null,angle=-.55,pitch=.35,zoom=1,drag=null;
// Canvas and CSS legends read the same PaperCut-inspired palette.
const palette = getComputedStyle(document.documentElement);
const ink = name => palette.getPropertyValue('--'+name).trim();
const heatStops = Array.from({length:6},(_,i)=>ink('heat-'+i).slice(1).match(/../g).map(v=>parseInt(v,16)));
const states={ready:'就绪',queued:'排队中',initializing:'初始化有限元',running:'正在优化',paused:'已暂停',cancelled:'已停止',converged:'已收敛',limit:'达到迭代上限',error:'计算出错'};

let connectionKey='正在连接计算核心', errorKey='', retryError=false;
function setConnection(key){connectionKey=key;$('#connection').textContent=t(key);}
function showError(message,retry=false){errorKey=message;retryError=retry;$('#error').textContent=(retry?t('连接中断，正在重试：'):'')+t(message);}
$('#language').onclick=()=>{toggleLanguage();setConnection(connectionKey);showError(errorKey,retryError);setState(state);updateForm();render();};
applyLanguage();setConnection(connectionKey);
function settings(){let p={dim,method:$('#method').value,besoKill:$('#besoKill').value,protectLoad:$('#protectLoad').checked};for(const f of fields)p[f]=Number($('#'+f).value);p.vf/=100;p.er/=100;p.additionRatio/=100;return p;}
function modelSettings(){return activeSettings??settings();}
function updateForm(){let p=settings();document.querySelectorAll('[data-methods]').forEach(label=>{label.hidden=!label.dataset.methods.split(' ').includes(p.method);label.querySelector('input,select').disabled=label.hidden;});$('#addition-label').hidden=!(p.method==='BESO'&&p.besoKill==='hard');$('#additionRatio').disabled=$('#addition-label').hidden;$('#load-pad-label').hidden=!(p.method==='BESO'&&p.besoKill==='hard');$('#protectLoad').disabled=$('#load-pad-label').hidden;$('#penalty').closest('label').hidden=p.method==='level-set'||(p.method==='BESO'&&p.besoKill==='hard');$('#penalty').disabled=$('#penalty').closest('label').hidden;$('#vf-value').textContent=p.vf*100+'%';$('#depth-label').hidden=dim===2;$('#mesh-info').textContent=meshText(p.nx*p.ny*(dim===3?p.nz:1),dim);document.querySelectorAll('[data-mesh]').forEach(b=>b.classList.toggle('active',b.dataset.mesh===`${p.nx},${p.ny}`));if(!activeSettings)render();}
function setState(s){state=s;running=['queued','initializing','running','paused'].includes(s);$('#status').textContent=t(states[s]??s);$('#fields').disabled=running;$('#method').disabled=running;$('#run').disabled=running||requesting;$('#run').textContent=running?t('计算任务进行中'):t('开始优化');$('#pause').disabled=!running;$('#pause').textContent=s==='paused'?t('继续'):t('暂停');$('#step').disabled=!running;$('#stop').disabled=!running;$('#reset').disabled=running;document.querySelectorAll('[data-dim]').forEach(b=>b.disabled=running);}
async function api(url,body){const r=await fetch(url,{...(body!==undefined?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});let data=await r.json().catch(()=>null);if(!r.ok)throw Error(data?.error??`${t('请求失败')} (${r.status})`);return data;}
$('#parameters').addEventListener('submit',async e=>{e.preventDefault();if(running||requesting)return;requesting=true;showError('');setState(state);try{let p=settings();const result=await api('/api/runs',p);runId=result.id;activeSettings=p;frames=[];current=-1;follow=true;setState('queued');showPane('results');render();poll();}catch(e){showError(e.message);}finally{requesting=false;setState(state);}});
async function poll(){clearTimeout(pollTimer);if(!runId||polling)return;polling=true;const id=runId;try{const r=await api(`/api/runs/${id}?after=${frames.length}`);if(id!==runId)return;frames.push(...r.frames);if(follow)current=frames.length-1;setState(r.state);if(r.error)showError(r.error);render();if(running||frames.length<r.count)pollTimer=setTimeout(poll,frames.length<r.count?30:400);}catch(e){showError(e.message,true);pollTimer=setTimeout(poll,2000);}finally{polling=false;}}
async function action(a){try{await api(`/api/runs/${runId}/${a}`,{});if(a==='resume')setState('running');poll();}catch(e){showError(e.message);}}
$('#pause').onclick=()=>action(state==='paused'?'resume':'pause');$('#step').onclick=()=>action('step');$('#stop').onclick=()=>action('stop');
for(const f of fields)$('#'+f).addEventListener('input',updateForm);
$('#protectLoad').onchange=$('#besoKill').onchange=$('#method').onchange=()=>{if(running)return;if($('#method').value==='level-set'&&$('#maxIter').value==='100')$('#maxIter').value='300';activeSettings=null;frames=[];current=-1;runId=null;setState('ready');updateForm();};
document.querySelectorAll('[data-dim]').forEach(b=>b.onclick=()=>{dim=Number(b.dataset.dim);activeSettings=null;frames=[];current=-1;runId=null;setState('ready');document.querySelectorAll('[data-dim]').forEach(t=>{t.classList.toggle('selected',t===b);t.setAttribute('aria-selected',t===b);});updateForm();});
document.querySelectorAll('[data-mesh]').forEach(b=>b.onclick=()=>{const[nx,ny]=b.dataset.mesh.split(',');$('#nx').value=nx;$('#ny').value=ny;updateForm();});
$('#reset').onclick=()=>{if(running)return;$('#parameters').reset();dim=2;document.querySelector('[data-dim="2"]').click();updateForm();};
$('#solid-view').onclick=()=>{sensitivity=false;render();};$('#sensitivity-view').onclick=()=>{sensitivity=true;render();};$('#grid').onchange=()=>render();$('#fit').onclick=()=>{angle=-.55;pitch=.35;zoom=1;render();};
$('#timeline').oninput=e=>{follow=false;current=Number(e.target.value)-1;render();};$('#live').onclick=()=>{follow=true;current=frames.length-1;render();};
$('#download').onclick=async()=>{const provenance=await api('/api/provenance').catch(()=>null);const data={schemaVersion:2,settings:activeSettings,state,definition:'C = f^T u for the displayed density. Sensitivity is the score used for the preceding update. Element index = (z*nx+x)*ny+y. Physical element edge = settings.elementSize.',provenance,frames};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));a.download=`toplab-${activeSettings.method}-${activeSettings.dim}d-${activeSettings.nx}x${activeSettings.ny}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};
function canvas(el){const r=el.getBoundingClientRect(),dpr=devicePixelRatio||1;el.width=r.width*dpr;el.height=r.height*dpr;const ctx=el.getContext('2d');ctx.scale(dpr,dpr);return [ctx,r.width,r.height];}
function densityColor(v){const rgb=ink('material').slice(1).match(/../g).map(x=>parseInt(x,16));return `rgb(${rgb.map(c=>Math.round(255+(c-255)*v)).join(',')})`;}
function heat(v){const stops=heatStops,n=stops.length-1,value=Math.max(0,Math.min(1,v)),k=Math.min(n-1,Math.floor(value*n)),t=value*n-k;return `rgb(${stops[k].map((c,i)=>Math.round(c*(1-t)+stops[k+1][i]*t)).join(',')})`;}
function render(){const p=modelSettings(),f=frames[current];$('#model-title').innerHTML=`${p.method==='level-set'?'Level set':p.method}${p.method==='BESO'?' / '+(p.besoKill==='hard'?'Hard kill':'Soft kill'):''} · ${t('Cantilever')} <span>${p.nx} × ${p.ny}${p.dim===3?' × '+p.nz:''}</span>`;$('#iteration').textContent=String(f?.iter??0).padStart(3,'0');$('#iteration-cap').textContent='/ '+p.maxIter;$('#compliance').textContent=f?f.c.toPrecision(6):'—';$('#volume').innerHTML=((f?.volume??(p.method==='SIMP'?p.vf:1))*100).toFixed(1)+'<em>%</em>';$('#target-label').textContent=t('目标')+' '+Math.round(p.vf*100)+'%';$('#delta').textContent=f?f.delta.toExponential(2):'—';$('#timeline').max=frames.length;$('#timeline').value=current+1;$('#timeline').disabled=!frames.length;$('#timeline-label').textContent=`${current+1} / ${frames.length}`;$('#download').disabled=!frames.length;$('#solid-view').classList.toggle('selected',!sensitivity);$('#sensitivity-view').classList.toggle('selected',sensitivity);$('#legend').hidden=!sensitivity;$('#view-note').textContent=p.method==='level-set'?(p.dim===2?t('零等值线 φ = 0'):t('体素边界')):p.method==='SIMP'?(p.dim===2?t('密度'):t('三维显示 ρ ≥ 0.5')):(p.dim===2?t('Q4 · 平面应力'):t('H8 · 拖拽旋转 / 滚轮缩放'));$('#boundary-note').textContent=`${t('左侧固定')} · y/H=${p.loadY} · Fy=${p.force}`;drawScene(p,f);drawChart();}
function drawScene(p,f){if(!$('#scene').clientWidth||!$('#scene').clientHeight)return;if(!Number.isInteger(p.nx)||!Number.isInteger(p.ny)||!Number.isInteger(p.nz)||p.nx<4||p.ny<4||p.nz<1||p.nx>200||p.ny>150||p.nz>32||p.nx*p.ny*(p.dim===3?p.nz:1)>32000)return;const[c,w,h]=canvas($('#scene'));c.fillStyle=ink('canvas-paper');c.fillRect(0,0,w,h);c.fillStyle=ink('canvas-dots');for(let x=12;x<w;x+=20)for(let y=12;y<h;y+=20){c.beginPath();c.arc(x,y,.6,0,Math.PI*2);c.fill();}let values=f?.sensitivity,max=values?.reduce((a,b)=>Math.max(a,b),0)??1;const color=i=>sensitivity&&values?heat(Math.pow(Math.max(0,values[i]/(max||1)),.35)):(p.method==='SIMP'?densityColor(f?.density[i]??p.vf):ink('material'));
if(p.dim===2){const scale=Math.min((w-115)/p.nx,(h-Math.min(70,h*.3))/p.ny),left=(w-p.nx*scale)/2,top=(h-p.ny*scale)/2;
 c.fillStyle=ink('canvas-void');c.fillRect(left,top,p.nx*scale,p.ny*scale);
 if(f?.levelSet&&!sensitivity)drawLevelSet(c,p,f.levelSet,left,top,scale);
 else for(let x=0;x<p.nx;x++)for(let y=0;y<p.ny;y++){const i=x*p.ny+y;if(!f||sensitivity||p.method==='SIMP'||f.density[i]>.5){c.fillStyle=color(i);c.fillRect(left+x*scale,top+(p.ny-y-1)*scale,scale+.2,scale+.2);}}
 c.strokeStyle=ink('canvas-border');c.lineWidth=.8;c.strokeRect(left,top,p.nx*scale,p.ny*scale);
 if($('#grid').checked&&scale>=2){c.strokeStyle='rgba(55,45,75,.17)';c.lineWidth=.5;c.beginPath();for(let x=0;x<=p.nx;x++){c.moveTo(left+x*scale,top);c.lineTo(left+x*scale,top+p.ny*scale);}for(let y=0;y<=p.ny;y++){c.moveTo(left,top+y*scale);c.lineTo(left+p.nx*scale,top+y*scale);}c.stroke();}
 c.strokeStyle=ink('canvas-support');c.lineWidth=2;c.beginPath();c.moveTo(left-4,top);c.lineTo(left-4,top+p.ny*scale);c.stroke();c.lineWidth=1;for(let y=top;y<top+p.ny*scale;y+=9){c.beginPath();c.moveTo(left-4,y);c.lineTo(left-13,y+8);c.stroke();}
 arrow(c,left+p.nx*scale+7,top+(1-p.loadY)*p.ny*scale,p.force<0?1:-1,Math.min(38,h*.25));if(h>150){c.font='12px sans-serif';c.fillStyle=ink('canvas-label');c.textAlign='center';c.fillText(`${+(p.nx*p.elementSize).toPrecision(6)}`,left+p.nx*scale/2,top+p.ny*scale+24);c.save();c.translate(left-28,top+p.ny*scale/2);c.rotate(-Math.PI/2);c.fillText(`${+(p.ny*p.elementSize).toPrecision(6)}`,0,0);c.restore();}return;}
 const scale=Math.min((w-110)/(p.nx+p.nz*.65),(h-Math.min(70,h*.3))/(p.ny+p.nx*.3))*zoom;
 function project(x,y,z){x-=p.nx/2;y-=p.ny/2;z-=p.nz/2;const a=x*Math.cos(angle)+z*Math.sin(angle),b=-x*Math.sin(angle)+z*Math.cos(angle);const yy=y*Math.cos(pitch)-b*Math.sin(pitch),zz=y*Math.sin(pitch)+b*Math.cos(pitch);return[w/2+a*scale,h/2-yy*scale,zz];}
 const defs=[{n:[1,0,0],v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],shade:.84},{n:[-1,0,0],v:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],shade:.84},{n:[0,1,0],v:[[0,1,0],[0,1,1],[1,1,1],[1,1,0]],shade:1.12},{n:[0,-1,0],v:[[0,0,1],[0,0,0],[1,0,0],[1,0,1]],shade:.7},{n:[0,0,1],v:[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],shade:1},{n:[0,0,-1],v:[[1,0,0],[0,0,0],[0,1,0],[1,1,0]],shade:.9}];
 const id=(x,y,z)=>(z*p.nx+x)*p.ny+y,solid=(x,y,z)=>x>=0&&x<p.nx&&y>=0&&y<p.ny&&z>=0&&z<p.nz&&(!f||f.density[id(x,y,z)]>.5);
 const faces=[];
 for(let z=0;z<p.nz;z++)for(let x=0;x<p.nx;x++)for(let y=0;y<p.ny;y++){if(!solid(x,y,z))continue;for(const d of defs){if(solid(x+d.n[0],y+d.n[1],z+d.n[2]))continue;const vertices=d.v.map(v=>project(x+v[0],y+v[1],z+v[2]));faces.push({vertices,depth:vertices.reduce((s,v)=>s+v[2],0)/4,color:color(id(x,y,z)),shade:d.shade});}}
 faces.sort((a,b)=>a.depth-b.depth);for(const face of faces){c.beginPath();face.vertices.forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.closePath();c.fillStyle=face.color;c.fill();c.fillStyle=face.shade<1?`rgba(30,24,47,${1-face.shade})`:`rgba(255,255,255,${face.shade-1})`;c.fill();if($('#grid').checked){c.strokeStyle='rgba(55,45,75,.2)';c.lineWidth=.5;c.stroke();}}
 // Fixed-plane outline and load retain their true 3D coordinates.
 c.strokeStyle=ink('canvas-support');c.lineWidth=2;c.beginPath();[[0,0,0],[0,p.ny,0],[0,p.ny,p.nz],[0,0,p.nz],[0,0,0]].map(v=>project(...v)).forEach((v,i)=>i?c.lineTo(v[0],v[1]):c.moveTo(v[0],v[1]));c.stroke();const l=project(p.nx,p.ny*p.loadY,p.nz/2);arrow(c,l[0]+3,l[1],p.force<0?1:-1,Math.min(38,h*.25));
}
// Piecewise-linear zero contour from the cell-centered signed-distance field.
function drawLevelSet(c,p,phi,left,top,scale){
 const at=(x,y)=>phi[Math.max(0,Math.min(p.nx-1,x))*p.ny+Math.max(0,Math.min(p.ny-1,y))];
 const sample=(x,y)=>{const ix=Math.floor(x-.5),iy=Math.floor(y-.5),a=x-.5-ix,b=y-.5-iy;return (1-a)*(1-b)*at(ix,iy)+a*(1-b)*at(ix+1,iy)+(1-a)*b*at(ix,iy+1)+a*b*at(ix+1,iy+1);};
 c.fillStyle=ink('material');
 for(let x=0;x<p.nx;x++)for(let y=0;y<p.ny;y++){
   const v=[[x,y],[x+1,y],[x+1,y+1],[x,y+1]].map(([a,b])=>[a,b,sample(a,b)]),center=[x+.5,y+.5,at(x,y)];
   if(v.every(v=>v[2]>=0)&&center[2]>=0){c.fillRect(left+x*scale,top+(p.ny-y-1)*scale,scale+.15,scale+.15);continue;}
   if(v.every(v=>v[2]<0)&&center[2]<0)continue;
   for(let j=0;j<4;j++){
     const triangle=[center,v[j],v[(j+1)%4]],poly=[];
     for(let k=0;k<3;k++){const a=triangle[k],b=triangle[(k+1)%3];if(a[2]>=0)poly.push(a);if((a[2]>=0)!==(b[2]>=0)){const t=a[2]/(a[2]-b[2]);poly.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}}
     if(poly.length){c.beginPath();poly.forEach(([a,b],i)=>{const px=left+a*scale,py=top+(p.ny-b)*scale;i?c.lineTo(px,py):c.moveTo(px,py);});c.closePath();c.fill();}
   }
 }
}
function arrow(c,x,y,d,length=38){c.strokeStyle=ink('load');c.fillStyle=ink('load');c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+length*d);c.stroke();c.beginPath();c.moveTo(x,y+length*d);c.lineTo(x-5,y+(length-8)*d);c.lineTo(x+5,y+(length-8)*d);c.closePath();c.fill();c.font='12px sans-serif';c.textAlign='left';c.fillText('F',x+9,y+length*.5*d);}
function drawChart(){
  if(!$('#chart').clientWidth||!$('#chart').clientHeight)return;
  const[c,w,h]=canvas($('#chart'));
  c.font='11px sans-serif';
  if(!frames.length){
    c.textAlign='center';c.fillStyle=ink('canvas-label');
    c.fillText(t('开始优化后显示真实迭代记录'),w/2,h/2);return;
  }
  // Independent axes keep actual energy and volume fraction in their own units.
  const peak=Math.max(...frames.map(f=>f.c));
  const rawMax=peak>0?peak*1.05:1;
  const step=10**Math.floor(Math.log10(rawMax))/5;
  const max=Math.ceil(rawMax/step)*step;
  const format=v=>v===0?'0':max>=1e5||max<.01?v.toExponential(1):Number(v.toPrecision(3)).toString();
  const divisions=h<180?2:4;
  const ticks=Array.from({length:divisions+1},(_,j)=>format(max*(1-j/divisions)));
  const left=Math.max(32,...ticks.map(v=>c.measureText(v).width+8)),right=w-42;
  const top=h<120?14:20,bottom=h-(h<120?17:23);
  const X=i=>left+i/Math.max(1,frames.length-1)*(right-left);
  const Y=(v,limit)=>bottom-v/limit*(bottom-top);
  c.textAlign='left';c.fillStyle=ink('chart-energy');c.fillText('C',left,11);
  c.textAlign='right';c.fillStyle=ink('chart-volume');c.fillText('V/V₀',right,11);
  for(let j=0;j<=divisions;j++){
    const y=top+(bottom-top)*j/divisions;
    c.strokeStyle=ink('canvas-grid');c.beginPath();c.moveTo(left,y);c.lineTo(right,y);c.stroke();
    c.textAlign='right';c.fillStyle=ink('chart-energy');c.fillText(ticks[j],left-7,y+4);
    c.textAlign='left';c.fillStyle=ink('chart-volume');c.fillText((100-j*100/divisions)+'%',right+7,y+4);
  }
  function line(fn,limit,col,dashed=false){
    c.beginPath();frames.forEach((f,i)=>i?c.lineTo(X(i),Y(fn(f),limit)):c.moveTo(X(i),Y(fn(f),limit)));
    c.strokeStyle=col;c.lineWidth=2;c.setLineDash(dashed?[5,3]:[]);c.stroke();c.setLineDash([]);
    if(frames.length===1){c.fillStyle=col;c.beginPath();c.arc(X(0),Y(fn(frames[0]),limit),3,0,Math.PI*2);c.fill();}
  }
  line(f=>f.c,max,ink('chart-energy'));
  line(f=>f.volume,1,ink('chart-volume'),true);
  if(current>=0){
    c.strokeStyle=ink('canvas-cursor');c.setLineDash([3,3]);c.beginPath();c.moveTo(X(current),top);c.lineTo(X(current),bottom);c.stroke();c.setLineDash([]);
  }
  c.textAlign='left';c.fillStyle=ink('canvas-label');c.fillText('1',left,h-5);
  c.textAlign='right';c.fillText(t('迭代')+' '+frames.length,right,h-5);
}
$('#scene').onpointerdown=e=>{if(modelSettings().dim!==3)return;drag=[e.clientX,e.clientY];e.target.setPointerCapture(e.pointerId);};$('#scene').onpointermove=e=>{if(!drag)return;angle+=(e.clientX-drag[0])*.008;pitch=Math.max(-1.4,Math.min(1.4,pitch+(e.clientY-drag[1])*.008));drag=[e.clientX,e.clientY];drawScene(modelSettings(),frames[current]);};$('#scene').onpointerup=()=>drag=null;$('#scene').onpointercancel=()=>drag=null;$('#scene').addEventListener('wheel',e=>{if(modelSettings().dim!==3)return;e.preventDefault();zoom=Math.min(3,Math.max(.4,zoom*Math.exp(-e.deltaY*.001)));drawScene(modelSettings(),frames[current]);},{passive:false});
const resizeCanvas=new ResizeObserver(()=>render());resizeCanvas.observe($('#scene'));resizeCanvas.observe($('#chart'));updateForm();api('/api/health').then(()=>setConnection('原生计算核心已连接')).catch(()=>{setConnection('计算服务未连接');showError('无法连接 Top Lab 计算服务，请启动服务器。');});
