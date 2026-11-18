// app.js (High-contrast badges + i18n)
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

function renderFilterOptions(){
  const sel=document.getElementById('ft-filter');
  if(!sel)return;
  const curVal=sel.value;
  const allLabel=typeof t==='function'?t('filter_all'):'ทุกประเภท';
  sel.innerHTML=`<option value="">${allLabel}</option>`+
    types.map(tp=>`<option value="${esc(tp.id)}">${esc(tp.name)}</option>`).join('');
  if(curVal&&types.some(tp=>String(tp.id)===String(curVal))){
    sel.value=curVal;
  }
}

function renderAll(){
  renderFilterOptions();
  renderList();
  renderTypes();
  renderAllPins();
}
function gtype(id){return types.find(t=>String(t.id)===String(id))||{name:id||'-',color:'#64748b'};}
function fmtDateTH(d){
  if(!d)return'-';
  const[y,m,dy]=d.split('-');
  if (typeof curLang !== 'undefined' && curLang !== 'th') {
    return `${y}-${m}-${dy}`;
  }
  const mn=['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  return`${parseInt(dy)} ${mn[parseInt(m)-1]} ${parseInt(y)+543}`;
}

// คำนวณสีตัวอักษรให้ตัดกับสีพื้นหลังป้ายอัตโนมัติ (ขาวหรือเข้ม)
function getContrastText(hex) {
  if (!hex || hex.charAt(0) !== '#') return '#ffffff';
  const c = hex.length === 4
    ? '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
    : hex;
  const r = parseInt(c.substr(1, 2), 16);
  const g = parseInt(c.substr(3, 2), 16);
  const b = parseInt(c.substr(5, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 155 ? '#1a2744' : '#ffffff';
}

function renderList(){
  const si=document.getElementById('si');
  const q=(si?si.value:'').toLowerCase();
  const ftSel=document.getElementById('ft-filter');
  const ftVal=ftSel?ftSel.value:'';
  const fil=phs.filter(p=>{
    const matchText=p.name.toLowerCase().includes(q)||p.addr.toLowerCase().includes(q);
    const matchType=!ftVal||String(p.tid)===String(ftVal);
    return matchText&&matchType;
  });
  const bcnt=document.getElementById('bcnt');
  if(bcnt)bcnt.textContent=t('place_count',{n:phs.length});
  const el=document.getElementById('pl');
  if(!el)return;
  if(!fil.length){
    el.innerHTML=`<div class="es"><div class="ei">📍</div><p>${(q||ftVal)?t('empty_search'):t('empty_list')}</p></div>`;
    return;
  }
  el.innerHTML=fil.map(p=>{
    const tp=gtype(p.tid);
    const bg=tp.color || '#64748b';
    const fg=getContrastText(bg);
    const hc=p.lat&&p.lng;
    return`<div class="pi${+p.id===+selId?' sel':''}" id="pi-${p.id}" onclick="showDetail(${+p.id})" style="cursor:pointer">
      <div class="pih"><div class="pin2">📍 ${esc(p.name)}</div><span class="ptb" style="background:${esc(bg)};color:${fg};border:1px solid rgba(0,0,0,.1)">${esc(tp.name)}</span></div>
      <div class="pm2"><span class="mr">📅 ${fmtDateTH(p.date)}</span>${hc?`<span class="mr">📍 ${(+p.lat).toFixed(4)}, ${(+p.lng).toFixed(4)}</span>`:''}</div>
      <div class="mr" style="margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">🗺️ ${esc(p.addr)}</div>
      ${p.note?`<div class="mr" style="margin-top:3px;color:var(--g300);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">💬 ${esc(p.note)}</div>`:''}
    </div>`;
  }).join('');
}
function doFocus(e,id){if(e)e.stopPropagation();focusPin(id);setSB(true);mbToggle(true);}
