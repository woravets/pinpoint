// app.js
function isMob(){return window.innerWidth<768;}
function setSB(hide){if(!isMob())return;const sb=document.getElementById('sb');if(sb)sb.classList.toggle('hide',hide);}
function mbToggle(showMap){
  const m=document.getElementById('nb-map'),l=document.getElementById('nb-list');
  if(m)m.classList.toggle('on',showMap);
  if(l)l.classList.toggle('on',!showMap);
}
function showP(n){
  ['map','types','settings'].forEach(x=>{
    if(x==='map'){const pm=document.getElementById('pm');if(pm)pm.classList.toggle('on',n==='map');}
    else{const el=document.getElementById('pp-'+x);if(el)el.classList.toggle('on',n===x);}
    const dn=document.getElementById('nv-'+x);if(dn)dn.classList.toggle('on',n===x);
    const bn=document.getElementById('nb-'+x);if(bn)bn.classList.toggle('on',n===x);
  });
  if(n==='types')renderTypes();
  if(n==='settings')renderSettings();
  if(n==='map'){renderList();if(gMap&&typeof google!=='undefined')google.maps.event.trigger(gMap,'resize');}
  if(n!=='map')setSB(true);
}
function mbMap(){showP('map');setSB(true);mbToggle(true);}
function mbList(){showP('map');setSB(false);mbToggle(false);}
const sddEl = document.getElementById('sdd');
if (sddEl) {
  sddEl.addEventListener('click',()=>{
    const sb=document.getElementById('sb');
    const h=sb?!sb.classList.contains('hide'):false;
    setSB(h);mbToggle(h);
  });
}

function renderAll(){
  renderList();
  renderTypes();
  renderAllPins();
}
function gtype(id){return types.find(t=>String(t.id)===String(id))||{name:id||'ไม่ระบุ',color:'#888'};}
function fmtDateTH(d){if(!d)return'-';const[y,m,dy]=d.split('-');const mn=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];return`${parseInt(dy)} ${mn[parseInt(m)-1]} ${parseInt(y)+543}`;}

function renderList(){
  const si=document.getElementById('si');
  const q=(si?si.value:'').toLowerCase();
  const fil=phs.filter(p=>p.name.toLowerCase().includes(q)||p.addr.toLowerCase().includes(q));
  const bcnt=document.getElementById('bcnt');
  if(bcnt)bcnt.textContent=phs.length+' สถานที่';
  const el=document.getElementById('pl');
  if(!el)return;
  if(!fil.length){
    el.innerHTML=`<div class="es"><div class="ei">📍</div><p>${q?'ไม่พบสถานที่ที่ค้นหา':'ยังไม่มีข้อมูล<br>กด "+ เพิ่มสถานที่" ด้านบน'}</p></div>`;
    return;
  }
  el.innerHTML=fil.map(p=>{
    const t=gtype(p.tid);const bg=t.color+'22',fg=t.color;const hc=p.lat&&p.lng;
    return`<div class="pi${+p.id===+selId?' sel':''}" id="pi-${p.id}" onclick="showDetail(${+p.id})" style="cursor:pointer">
      <div class="pih"><div class="pin2">📍 ${esc(p.name)}</div><span class="ptb" style="background:${esc(bg)};color:${esc(fg)}">${esc(t.name)}</span></div>
      <div class="pm2"><span class="mr">📅 ${fmtDateTH(p.date)}</span>${hc?`<span class="mr">📍 ${(+p.lat).toFixed(4)}, ${(+p.lng).toFixed(4)}</span>`:''}</div>
      <div class="mr" style="margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🗺️ ${esc(p.addr)}</div>
      ${p.note?`<div class="mr" style="margin-top:3px;color:var(--g300);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">💬 ${esc(p.note)}</div>`:''}
    </div>`;
  }).join('');
}
function doFocus(e,id){if(e)e.stopPropagation();focusPin(id);setSB(true);mbToggle(true);}
