// app.js
// ══ PANELS ══
function isMob(){return window.innerWidth<768;}
function setSB(hide){if(!isMob())return;document.getElementById('sb').classList.toggle('hide',hide);}
function mbToggle(showMap){document.getElementById('nb-map').classList.toggle('on',showMap);document.getElementById('nb-list').classList.toggle('on',!showMap);}
function showP(n){
  const isAdmin = cu && cu.role === 'admin';
  const isStaff = cu && (cu.role === 'admin' || cu.role === 'manager');
  if (n === 'users' && !isAdmin) n = 'map';
  if ((n === 'types' || n === 'settings') && !isStaff) n = 'map';

  ['map','types','users','settings'].forEach(x=>{
    if(x==='map')document.getElementById('pm').classList.toggle('on',n==='map');
    else{const el=document.getElementById('pp-'+x);if(el)el.classList.toggle('on',n===x);}
    const dn=document.getElementById('nv-'+x);if(dn)dn.classList.toggle('on',n===x);
    const bn=document.getElementById('nb-'+x);if(bn)bn.classList.toggle('on',n===x);
  });
  if(n==='types')renderTypes();
  if(n==='users'&&isAdmin)renderUsers();
  if(n==='settings'&&isStaff)renderSettings();
  if(n==='map'){renderList();if(gMap)google.maps.event.trigger(gMap,'resize');}
  if(n!=='map')setSB(true);
}
function mbMap(){showP('map');setSB(true);mbToggle(true);}
function mbList(){showP('map');setSB(false);mbToggle(false);}
document.getElementById('sdd').addEventListener('click',()=>{const h=!document.getElementById('sb').classList.contains('hide');setSB(h);mbToggle(h);});

// ══ RENDER ══
function renderAll(){
  renderList();
  renderTypes();
  if(cu && cu.role === 'admin') renderUsers();
  renderAllPins();
}
function gtype(id){return types.find(t=>t.id===id)||{name:id||'ไม่ระบุ',color:'#888'};}
function fmtDateTH(d){if(!d)return'-';const[y,m,dy]=d.split('-');const mn=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];return`${parseInt(dy)} ${mn[parseInt(m)-1]} ${parseInt(y)+543}`;}

function renderList(){
  const q=(document.getElementById('si').value||'').toLowerCase();
  const fil=phs.filter(p=>p.name.toLowerCase().includes(q)||p.addr.toLowerCase().includes(q));
  document.getElementById('bcnt').textContent=phs.length+' สถานที่';
  const el=document.getElementById('pl');
  const isStaff = cu && (cu.role === 'admin' || cu.role === 'manager');
  if(!fil.length){
    el.innerHTML=`<div class="es"><div class="ei">📍</div><p>${q?'ไม่พบสถานที่ที่ค้นหา':(isStaff?'ยังไม่มีข้อมูล<br>กด "+ เพิ่มสถานที่"':'ยังไม่มีข้อมูลสถานที่')}</p></div>`;
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
function doFocus(e,id){e.stopPropagation();focusPin(id);setSB(true);mbToggle(true);}
