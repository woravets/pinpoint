// ui.js
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function askDel(e,kind,id){
  if(e)e.stopPropagation();let ic,ti,ms,cb;
  if(kind==='ph'){const p=phs.find(x=>+x.id===+id);ic='🗑️';ti=t('btn_del');ms=`"${p.name}" ?`;cb=()=>{
    api('places','DELETE',null,id).then(async()=>{if(+selId===+id)selId=null;await loadAll();renderAll();toast('🗑️ Deleted','ok');});
  };}
  else if(kind==='ty'){const tp=types.find(x=>String(x.id)===String(id));ic='🏷️';ti=t('btn_del');ms=`"${tp.name}" ?`;cb=()=>{
    api('types','DELETE',null,id).then(async()=>{await loadAll();renderTypes();renderList();renderAllPins();toast('🗑️ Deleted','ok');});
  };}
  document.getElementById('cfi').textContent=ic;document.getElementById('cft').textContent=ti;document.getElementById('cfm').textContent=ms;
  cfCb=cb;document.getElementById('mo-cf').classList.add('on');
}
function closeCF(){document.getElementById('mo-cf').classList.remove('on');cfCb=null;}
function runCF(){if(cfCb)cfCb();closeCF();}

let tT;
function toast(msg,type){const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.className='toast '+(type||'');el.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>el.classList.remove('on'),3500);}

['mo-ph','mo-ty','mo-cf'].forEach(id=>{
  const el=document.getElementById(id);
  if(el) el.addEventListener('click',e=>{
    if(e.target!==e.currentTarget)return;
    if(id==='mo-ph')closePM();else if(id==='mo-ty')closeTM();else closeCF();
  });
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePM();closeTM();closeCF();closeMPM();closeDetail();}});
