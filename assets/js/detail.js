// detail.js
function showDetail(id){
  const p=phs.find(x=>+x.id===+id);if(!p)return;
  const tp=gtype(p.tid);
  const hc=p.lat&&p.lng;

  document.getElementById('d-name').textContent='📍 '+p.name;
  const badge=document.getElementById('d-typebadge');
  badge.textContent=tp.name;
  badge.style.background=tp.color;
  badge.style.color=getContrastText(tp.color);

  let body='';
  body+=`<div class="drow"><div class="drow-icon">🏷️</div><div><div class="drow-label">${t('f_type')}</div><div class="drow-val">${esc(tp.name)}</div></div></div>`;
  body+=`<div class="drow"><div class="drow-icon">📅</div><div><div class="drow-label">${t('f_date')}</div><div class="drow-val">${fmtDateTH(p.date)}</div></div></div>`;
  if(p.ph) body+=`<div class="drow"><div class="drow-icon">📞</div><div><div class="drow-label">${t('f_phone')}</div><div class="drow-val"><a href="tel:${esc(p.ph)}">${esc(p.ph)}</a></div></div></div>`;
  body+=`<div class="drow"><div class="drow-icon">🗺️</div><div><div class="drow-label">${t('f_addr')}</div><div class="drow-val">${esc(p.addr)||'-'}</div></div></div>`;
  if(hc) body+=`<div class="drow"><div class="drow-icon">📍</div><div><div class="drow-label">${t('f_gps')}</div><div class="drow-val">${(+p.lat).toFixed(6)}, ${(+p.lng).toFixed(6)}</div></div></div>`;
  if(p.note) body+=`<div class="drow"><div class="drow-icon">💬</div><div><div class="drow-label">${t('f_note')}</div><div class="drow-val">${esc(p.note)}</div></div></div>`;

  const hist=p.history||[];
  if(hist.length){
    body+=`<div style="font-size:13px;font-weight:700;color:var(--navy);margin:16px 0 8px">${t('history_title',{n:hist.length})}</div>`;
    body+=hist.map((h,i)=>{
      const d=h.date||h.survey_date||'';
      const n=h.note||'';
      const by=h.by||h.surveyor||'';
      return `<div class="hist-item ${i===0?'new':'old'}" id="hist-item-${i}">
        <div class="hist-dot">${i===0?'🕐':'📋'}</div>
        <div style="flex:1;min-width:0">
          <div class="hist-date" id="hist-date-${i}">${fmtDateTH(d)}</div>
          ${n?`<div class="hist-note" id="hist-note-${i}">💬 ${esc(n)}</div>`:`<div class="hist-note" id="hist-note-${i}" style="color:var(--g300)">-</div>`}
          ${by?`<div class="hist-by">👤 ${esc(by)}</div>`:''}
          <div class="hist-acts">
            <button type="button" class="hist-btn" style="background:#e8f5ff;color:var(--blue)" onclick="editHistItem(${+p.id},${i},'${esc(d)}',\`${esc(n)}\`)">${t('btn_edit')}</button>
            <button type="button" class="hist-btn hist-btn-del" onclick="delHistItem(${+p.id},${i})">${t('btn_del')}</button>
          </div>
          <div id="hist-edit-${i}" style="display:none"></div>
        </div>
      </div>`;
    }).join('');
  } else {
    body+=`<div style="font-size:12px;color:var(--g300);margin-top:12px;text-align:center;padding:10px">${t('no_history')}</div>`;
  }

  document.getElementById('d-body').innerHTML=body;

  let acts='';
  if(hc){
    acts+=`<button type="button" class="d-btn d-btn-focus" onclick="closeDetail();doFocus(event,${+p.id})">${t('btn_focus')}</button>`;
    acts+=`<button type="button" class="d-btn d-btn-nav" onclick="openInMaps(${+p.id})">${t('btn_nav')}</button>`;
  }
  acts+=`<button type="button" class="d-btn d-btn-edit" onclick="closeDetail();openPM(null,${+p.id})">${t('btn_edit')}</button>`;
  acts+=`<button type="button" class="d-btn d-btn-del" onclick="closeDetail();askDel(null,'ph',${+p.id})">${t('btn_del')}</button>`;
  document.getElementById('d-actions').innerHTML=acts;

  selId=+id;renderAllPins();
  document.querySelectorAll('.pi').forEach(el=>el.classList.toggle('sel',el.id==='pi-'+id));
  document.getElementById('detail-panel').classList.add('on');
}

function editHistItem(pid,idx,date,note){
  const editDiv=document.getElementById('hist-edit-'+idx);
  if(!editDiv)return;
  const showing=editDiv.style.display!=='none';
  if(showing){editDiv.style.display='none';return;}
  editDiv.innerHTML=`
    <div class="hist-edit-row" style="margin-top:8px">
      <input type="date" id="he-date-${idx}" value="${esc(date)}">
      <input type="text" id="he-note-${idx}" placeholder="" value="${esc(note)}">
    </div>
    <div class="hist-acts">
      <button type="button" class="hist-btn hist-btn-save" onclick="saveHistItem(${pid},${idx})">${t('btn_save')}</button>
      <button type="button" class="hist-btn hist-btn-cancel" onclick="document.getElementById('hist-edit-${idx}').style.display='none'">${t('btn_cancel')}</button>
    </div>`;
  editDiv.style.display='';
}

function saveHistItem(pid,idx){
  const p=phs.find(x=>+x.id===+pid);if(!p)return;
  const newDate=document.getElementById('he-date-'+idx)?.value||'';
  const newNote=document.getElementById('he-note-'+idx)?.value||'';
  if(!newDate){toast('Date required','er');return;}

  p.history=p.history||[];
  if(idx>=p.history.length)return;

  p.history[idx]={...p.history[idx], date:newDate, survey_date:newDate, note:newNote};

  savePlaceHistory(pid, p.history, ()=>{
    toast('✅ OK','ok');
    showDetail(pid);
  });
}

function delHistItem(pid,idx){
  const p=phs.find(x=>+x.id===+pid);if(!p)return;
  p.history=p.history||[];
  if(idx>=p.history.length)return;
  const item=p.history[idx];
  if(!confirm(`Delete ${fmtDateTH(item.date||item.survey_date)} ?`))return;
  p.history.splice(idx,1);
  savePlaceHistory(pid, p.history, ()=>{
    toast('🗑️ Deleted','ok');
    showDetail(pid);
  });
}

function savePlaceHistory(pid, history, cb){
  const p=phs.find(x=>+x.id===+pid);if(!p)return;
  api('places','PUT',{
    name:p.name, tid:p.tid, date:p.date, addr:p.addr, ph:p.ph||'',
    lat:p.lat, lng:p.lng, note:p.note||'', ps:p.ps||'teardrop', pc:p.pc||'#e05252',
    surveyor:'Admin',
    history:history
  },pid).then(async()=>{
    await loadAll();
    if(cb)cb();
  }).catch(()=>toast('❌ Error','er'));
}
function closeDetail(){
  document.getElementById('detail-panel').classList.remove('on');
}
