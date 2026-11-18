// ui.js
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function askDel(e,kind,id){
  if(e)e.stopPropagation();let ic,ti,ms,cb;
  if(kind==='ph'){const p=phs.find(x=>+x.id===+id);ic='🗑️';ti='ลบสถานที่';ms=`ลบ "${p.name}" ? ข้อมูลถูกลบถาวร`;cb=()=>{
    api('places','DELETE',null,id).then(async()=>{if(+selId===+id)selId=null;await loadAll();renderAll();toast('ลบสถานที่เรียบร้อย','ok');});
  };}
  else if(kind==='ty'){const t=types.find(x=>String(x.id)===String(id));ic='🏷️';ti='ลบประเภทสถานที่';ms=`ลบประเภท "${t.name}" ?`;cb=()=>{
    api('types','DELETE',null,id).then(async()=>{await loadAll();renderTypes();renderList();renderAllPins();toast('ลบประเภทเรียบร้อย','ok');});
  };}
  document.getElementById('cfi').textContent=ic;document.getElementById('cft').textContent=ti;document.getElementById('cfm').textContent=ms;
  cfCb=cb;document.getElementById('mo-cf').classList.add('on');
}
function closeCF(){document.getElementById('mo-cf').classList.remove('on');cfCb=null;}
function runCF(){if(cfCb)cfCb();closeCF();}

let tT;
function toast(msg,type){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.className='toast '+(type||'');t.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('on'),3500);}

['mo-ph','mo-ty','mo-cf'].forEach(id=>{
  const el=document.getElementById(id);
  if(el) el.addEventListener('click',e=>{
    if(e.target!==e.currentTarget)return;
    if(id==='mo-ph')closePM();else if(id==='mo-ty')closeTM();else closeCF();
  });
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closePM();closeTM();closeCF();closeMPM();closeDetail();}});
