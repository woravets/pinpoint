// picker.js
// ══ PIN ══
const PS=[{id:'teardrop',lb:'💧'},{id:'circle',lb:'⬤'},{id:'star',lb:'★'},{id:'square',lb:'■'},{id:'diamond',lb:'◆'},{id:'heart',lb:'♥'},{id:'flag',lb:'🚩'},{id:'cross',lb:'✚'}];
const PC=['#e05252','#2d9e6b','#2563eb','#f5a623','#7c3aed','#be185d','#0891b2','#1a2744','#d97706','#059669'];
let selPS='teardrop',selPC='#e05252';

function pinSVG(color,shape,size){
  const s=size||40;const h=Math.round(s*1.4);
  let body='';
  if(shape==='circle'){body='<circle cx="20" cy="20" r="17" fill="'+color+'" stroke="white" stroke-width="3"/><circle cx="20" cy="20" r="6" fill="white" opacity=".9"/>';}
  else if(shape==='star'){body='<polygon points="20,3 24.5,14 37,14 27,22 31,35 20,27 9,35 13,22 3,14 15.5,14" fill="'+color+'" stroke="white" stroke-width="2"/>';}
  else if(shape==='square'){body='<rect x="2" y="2" width="36" height="36" rx="6" fill="'+color+'" stroke="white" stroke-width="2.5"/><polygon points="14,37 26,37 20,52" fill="'+color+'"/><circle cx="20" cy="20" r="7" fill="white" opacity=".9"/>';}
  else if(shape==='diamond'){body='<polygon points="20,2 38,20 20,38 2,20" fill="'+color+'" stroke="white" stroke-width="2.5"/>';}
  else if(shape==='heart'){body='<path d="M20,36 C20,36 4,25 4,14 C4,8 8,4 13,4 C16,4 18,6 20,8 C22,6 24,4 27,4 C32,4 36,8 36,14 C36,25 20,36 20,36Z" fill="'+color+'" stroke="white" stroke-width="2"/>';}
  else if(shape==='flag'){body='<line x1="8" y1="3" x2="8" y2="40" stroke="'+color+'" stroke-width="3.5" stroke-linecap="round"/><polygon points="8,4 34,12 8,20" fill="'+color+'" stroke="white" stroke-width="1.5"/>';}
  else if(shape==='cross'){body='<rect x="15" y="3" width="10" height="34" rx="4" fill="'+color+'" stroke="white" stroke-width="1.5"/><rect x="3" y="15" width="34" height="10" rx="4" fill="'+color+'" stroke="white" stroke-width="1.5"/>';}
  else{
    body='<circle cx="20" cy="18" r="16" fill="'+color+'" stroke="white" stroke-width="3"/><polygon points="11,28 29,28 20,54" fill="'+color+'"/><circle cx="20" cy="18" r="6" fill="white" opacity=".9"/>';}
  const vb=shape==='circle'?'0 0 40 40':shape==='star'?'0 0 40 40':shape==='diamond'?'0 0 40 40':shape==='cross'?'0 0 40 40':shape==='heart'?'0 0 40 40':shape==='flag'?'0 0 40 40':'0 0 40 56';
  const svg='<svg width="'+s+'" height="'+h+'" viewBox="'+vb+'" xmlns="http://www.w3.org/2000/svg">'+body+'</svg>';
  return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
}

function mkIcon(color,shape,sel){
  const sz=sel?48:36;
  const isCenter=['circle','star','diamond','cross','heart','flag'].includes(shape);
  const anchorY=isCenter?sz*0.7:sz*1.4;
  const anchorX=sz/2;
  return{
    url:pinSVG(color,shape,sz),
    scaledSize:new google.maps.Size(sz,Math.round(sz*1.4)),
    anchor:new google.maps.Point(anchorX,anchorY)
  };
}

// ── Pin preview canvas ──
function drawPinPreview(ctx,x,y,shape,color,size){
  const c=color;
  ctx.save();
  ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=8;ctx.shadowOffsetY=3;
  ctx.fillStyle=c;ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=1.5;
  const s=size;
  if(shape==='circle'){ctx.beginPath();ctx.arc(x,y-s,s,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();ctx.beginPath();ctx.arc(x,y-s,s*.38,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.85)';ctx.fill();}
  else if(shape==='star'){ctx.beginPath();for(let i=0;i<5;i++){const a1=Math.PI/2-i*Math.PI*2/5,a2=a1-Math.PI/5;i===0?ctx.moveTo(x+Math.cos(a1)*s,y-.5*s+Math.sin(a1)*s):ctx.lineTo(x+Math.cos(a1)*s,y-.5*s+Math.sin(a1)*s);ctx.lineTo(x+Math.cos(a2)*s*.4,y-.5*s+Math.sin(a2)*s*.4);}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  else if(shape==='diamond'){ctx.beginPath();ctx.moveTo(x,y-s*2);ctx.lineTo(x+s,y-s);ctx.lineTo(x,y);ctx.lineTo(x-s,y-s);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  else if(shape==='heart'){const hy=y-s*.5;ctx.beginPath();ctx.moveTo(x,hy+s*.5);ctx.bezierCurveTo(x+s*1.2,hy+s*.5,x+s*1.2,hy-s*.8,x,hy-s*.3);ctx.bezierCurveTo(x-s*1.2,hy-s*.8,x-s*1.2,hy+s*.5,x,hy+s*.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  else if(shape==='cross'){ctx.beginPath();ctx.roundRect(x-s*.35,y-s*2,s*.7,s*2+s*.35,2);ctx.fill();ctx.beginPath();ctx.roundRect(x-s,y-s*1.35-s*.35,s*2,s*.7,2);ctx.fill();ctx.restore();}
  else if(shape==='flag'){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-s*2.2);ctx.strokeStyle=c;ctx.lineWidth=2.5;ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-s*2.2);ctx.lineTo(x+s*1.4,y-s*1.7);ctx.lineTo(x,y-s*1.2);ctx.closePath();ctx.fill();ctx.restore();}
  else if(shape==='square'){ctx.beginPath();ctx.roundRect(x-s,y-s*2,s*2,s*2,s*.25);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x-s*.4,y);ctx.lineTo(x+s*.4,y);ctx.lineTo(x,y+s*.7);ctx.closePath();ctx.fillStyle=c;ctx.fill();ctx.restore();}
  else{ctx.beginPath();ctx.arc(x,y-s,s,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(x-s*.55,y-s*.3);ctx.lineTo(x+s*.55,y-s*.3);ctx.lineTo(x,y+s*.7);ctx.closePath();ctx.fill();ctx.restore();ctx.beginPath();ctx.arc(x,y-s,s*.38,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.85)';ctx.fill();}
}

function updPrev(){
  const cv=document.getElementById('ppv');if(!cv)return;
  const ctx=cv.getContext('2d');ctx.clearRect(0,0,60,70);
  ctx.fillStyle='#f0f4f8';ctx.fillRect(0,0,60,70);
  drawPinPreview(ctx,30,56,selPS,selPC,12);
}

function initPicker(){
  const sp=document.getElementById('psp');if(!sp)return;
  sp.innerHTML=PS.map(s=>`<div class="po${s.id===selPS?' on':''}" onclick="setPinShape('${s.id}')"><canvas width="32" height="36" id="ps-${s.id}"></canvas></div>`).join('');
  PS.forEach(s=>{const cv=document.getElementById('ps-'+s.id);if(!cv)return;const ctx=cv.getContext('2d');drawPinPreview(ctx,16,30,s.id,selPC,9);});
  const cr=document.getElementById('pcr');if(!cr)return;
  cr.innerHTML=PC.map(c=>`<div class="pc${c===selPC?' on':''}" style="background:${c}" onclick="setPinColor('${c}')"></div>`).join('');
  document.getElementById('pcc').value=selPC;
  updPrev();
}
function setPinShape(id){selPS=id;initPicker();updatePickMarkerIcon();}
function setPinColor(c){selPC=c;document.getElementById('pcc').value=c;initPicker();updatePickMarkerIcon();}
