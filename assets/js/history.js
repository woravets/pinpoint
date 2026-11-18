// history.js
function renderSurveyHistory(history,currentDate){
  const box=document.getElementById('survey-history-box');if(!box)return;
  if(!history||!history.length){box.style.display='none';return;}
  box.style.display='';
  box.innerHTML=`<div class="gbt">${t('history_title',{n:history.length})}</div>`+
    history.map((h,i)=>`<div style="display:flex;align-items:flex-start;gap:10px;padding:8px 10px;background:${i===0?'#f0fbf5':'var(--g50)'};border-radius:8px;border-left:3px solid ${i===0?'var(--green)':'var(--g200)'};margin-bottom:6px">
      <div style="flex-shrink:0;font-size:16px">${i===0?'🕐':'📋'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:var(--navy)">${fmtDateTH(h.date)}</div>
        ${h.note?`<div style="font-size:12px;color:var(--g500);margin-top:2px">${esc(h.note)}</div>`:''}
        ${h.by?`<div style="font-size:11px;color:var(--g300)">${esc(h.by)}</div>`:''}
      </div>
      <button type="button" onclick="delHistory(${i})" style="background:none;border:none;cursor:pointer;color:var(--g300);font-size:13px">✕</button>
    </div>`).join('');
}
function delHistory(idx){
  if(!ePid)return;const p=phs.find(x=>+x.id===+ePid);if(!p)return;
  toast('🗑️ Deleted','ok');
  p.history.splice(idx,1);
  renderSurveyHistory(p.history,p.date);
}
