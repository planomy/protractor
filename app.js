(()=>{'use strict';
const ns='http://www.w3.org/2000/svg';const $=id=>document.getElementById(id);const scale=$('scale'),ref=$('reference'),arc=$('arc'),arm=$('arm'),root=$('rotated');let max=180, angle=60, rotation=0, locked=false,visible=true,dragging=null, top=true;
const make=(tag,attrs,par)=>{const e=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));par.append(e);return e};
const xy=(r,d)=>({x:r*Math.cos(d*Math.PI/180),y:-r*Math.sin(d*Math.PI/180)});const pathArc=(r,a,b)=>{const p=xy(r,a),q=xy(r,b);return `M ${p.x} ${p.y} A ${r} ${r} 0 ${Math.abs(b-a)>180?1:0} ${b>a?0:1} ${q.x} ${q.y}`};
function render(){scale.replaceChildren();ref.replaceChildren();arc.replaceChildren();arm.replaceChildren();root.setAttribute('transform',`translate(250 229) rotate(${-rotation})`);
if(max===180){make('path',{d:'M -192 0 A 192 192 0 0 1 192 0 L -192 0',fill:'#75d9ec', 'fill-opacity':'.19',stroke:'#69ddeb','stroke-width':2},scale)}else{make('circle',{r:192,fill:'#75d9ec','fill-opacity':'.15',stroke:'#69ddeb','stroke-width':2},scale)}
for(let d=0;d<max;d+=5){const outer=xy(192,d),inner=xy(d%30===0?171:d%10===0?181:187,d);make('line',{x1:outer.x,y1:outer.y,x2:inner.x,y2:inner.y,stroke:'#f7ffff','stroke-width':d%30===0?2:1,'stroke-opacity':'.95'},scale);if(d%30===0){const p=xy(153,d);const t=make('text',{x:p.x,y:p.y+4,'text-anchor':'middle',fill:'#fff','font-size':15,'font-weight':700},scale);t.textContent=d}}
if(max===180){let p=xy(153,180);make('text',{x:p.x,y:p.y+4,'text-anchor':'middle',fill:'#fff','font-size':15,'font-weight':700},scale).textContent='180';}
make('line',{x1:-205,y1:0,x2:206,y2:0,stroke:'#fff','stroke-width':4,'stroke-linecap':'round'},ref);
make('circle',{cx:205,cy:0,r:5,fill:'#fff'},ref);
make('line',{x1:-193,y1:0,x2:-222,y2:0,stroke:'#55c9ff','stroke-width':3},ref);
make('circle',{id:'rotateHandle',cx:-226,cy:0,r:18,fill:'#106b94',stroke:'#d9f7ff','stroke-width':3,style:'cursor:grab;touch-action:none'},ref);
const rt=make('text',{x:-226,y:6,'text-anchor':'middle',fill:'#fff','font-size':23,'font-weight':800,'pointer-events':'none'},ref);rt.textContent='↻';
if(angle>0){make('path',{d:pathArc(65,0,angle),stroke:'#ffc05e','stroke-width':4,fill:'none'},arc)}const tip=xy(215,angle);make('line',{x1:0,y1:0,x2:tip.x,y2:tip.y,stroke:'#ffbb4e','stroke-width':5,'stroke-linecap':'round'},arm);make('circle',{id:'tip',cx:tip.x,cy:tip.y,r:12,fill:'#ffb74a',stroke:'#fff','stroke-width':3,style:'cursor:grab;touch-action:none'},arm);
$('degree').textContent=visible?`${Math.round(angle)}°`:'?';$('angleKind').textContent=angle===0?'Zero angle':angle<90?'Acute angle':angle===90?'Right angle':angle<180?'Obtuse angle':angle===180?'Straight angle':angle<360?'Reflex angle':'Full turn';$('target').max=max;$('target').value=Math.round(angle);$('rotation').value=rotation;$('rotationNum').textContent=rotation+'°';}
function pointerDegrees(ev){const s=$('dial');const r=s.getBoundingClientRect();const x=(ev.clientX-r.left)*500/r.width-250,y=229-(ev.clientY-r.top)*455/r.height;return Math.atan2(y,x)*180/Math.PI}
function angleAt(ev){let d=(pointerDegrees(ev)-rotation+360)%360;if(max===180){if(d>270)d=0;else if(d>180)d=180}return Math.max(0,Math.min(max,d))}
const wrap180=d=>((d+180)%360+360)%360-180;
$('dial').addEventListener('pointerdown',e=>{if(locked)return;if(e.target.closest('#tip'))dragging={type:'arm'};else if(e.target.closest('#rotateHandle'))dragging={type:'rotate',offset:wrap180(rotation-(pointerDegrees(e)-180))};else return;$('dial').setPointerCapture(e.pointerId);e.preventDefault()});
$('dial').addEventListener('pointermove',e=>{if(!dragging)return;if(dragging.type==='arm')angle=Math.round(angleAt(e));else rotation=Math.round(wrap180(pointerDegrees(e)-180+dragging.offset));render()});
function stop(){dragging=null}$('dial').addEventListener('pointerup',stop);$('dial').addEventListener('pointercancel',stop);
function mode(n){max=n;angle=Math.min(angle,n);$('mode180').classList.toggle('active',n===180);$('mode360').classList.toggle('active',n===360);render()}$('mode180').onclick=()=>mode(180);$('mode360').onclick=()=>mode(360);
$('rotation').oninput=e=>{rotation=+e.target.value;render()};$('apply').onclick=()=>{angle=Math.max(0,Math.min(max,Number($('target').value)||0));render()};$('target').addEventListener('keydown',e=>{if(e.key==='Enter')$('apply').click()});$('show').onclick=()=>{visible=!visible;$('show').classList.toggle('active',visible);$('show').textContent=visible?'Show angle':'Reveal angle';render()};$('lock').onclick=()=>{locked=!locked;$('lock').textContent=locked?'🔒 Locked':'🔓 Free'};$('reset').onclick=()=>{angle=60;rotation=0;locked=false;$('lock').textContent='🔓 Free';render()};
const native=!!window.__TAURI_INTERNALS__;let win=null;
(async()=>{if(native){try{const t=await import('@tauri-apps/api/window');win=t.getCurrentWindow()}catch(e){console.warn('Native window API unavailable',e)}}})();
$('close').onclick=async()=>{if(win)await win.close();else window.close()};$('min').onclick=async()=>{if(win)await win.minimize();else $('app').style.opacity=$('app').style.opacity==='0.35'?'1':'0.35'};$('top').onclick=async()=>{top=!top;if(win)await win.setAlwaysOnTop(top);$('top').style.opacity=top?'1':'.45'};
render();
})();