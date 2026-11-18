// place.js
// ══ PLACE MODAL ══
function openPM(e,id){
  if(e)e.stopPropagation();
  if(!id && types.length === 0){
    toast('⚠️ กรุณาสร้าง "ประเภทสถานที่" ก่อนเพิ่มหมุด', 'er');
    showP('types');
    return;
  }
  ePid=id||null;
  document.getElementById('ph-title').textContent=id?'✏️ แก้ไขข้อมูลสถานที่':'📍 เพิ่มสถานที่';
  const sel=document.getElementById('ft');
  sel.innerHTML='<option value="">-- เลือกประเภท --</option>'+types.map(t=>`<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
  if(id){
    const p=phs.find(x=>+x.id===+id);
    document.getElementById('fn').value=p.name;sel.value=p.tid;
    document.getElementById('fd').value=p.date;document.getElementById('fph').value=p.ph||'';
    document.getElementById('fa').value=p.addr;
    document.getElementById('flat').value=p.lat||'';document.getElementById('flng').value=p.lng||'';
    document.getElementById('fno').value=p.note||'';
    selPS=p.ps||'teardrop';selPC=p.pc||'#e05252';
    renderSurveyHistory(p.history||[],p.date);
  } else {
    ['fn','fph','fa','flat','flng','fno'].forEach(x=>document.getElementById(x).value='');
    sel.value='';document.getElementById('fd').value=new Date().toISOString().split('T')[0];
    selPS='teardrop';selPC='#e05252';
    renderSurveyHistory([],null);
  }
  document.getElementById('cst').textContent='';document.getElementById('gb').textContent='📡 หาตำแหน่งปัจจุบัน';document.getElementById('gb').disabled=false;
  document.getElementById('mo-ph').classList.add('on');setTimeout(initPicker,60);
}
function closePM(){document.getElementById('mo-ph').classList.remove('on');ePid=null;}
function savePh(){
  const name=document.getElementById('fn').value.trim(),tid=document.getElementById('ft').value;
  const date=document.getElementById('fd').value,addr=document.getElementById('fa').value.trim();
  if(!name||!tid||!date||!addr){toast('กรุณากรอกข้อมูลที่จำเป็น (*)','er');return;}
  const lat=parseFloat(document.getElementById('flat').value)||null;
  const lng=parseFloat(document.getElementById('flng').value)||null;
  if((lat&&!lng)||(!lat&&lng)){toast('กรุณากรอกพิกัดให้ครบ','er');return;}
  const d={name,tid,date,addr,lat,lng,ph:document.getElementById('fph').value.trim(),note:document.getElementById('fno').value.trim(),ps:selPS,pc:selPC};
  const saving = ePid
    ? api('places','PUT',{...d, surveyor:cu?cu.fn+' '+cu.ln:''},ePid)
    : api('places','POST',d);
  saving.then(async res=>{
    toast(ePid?'✅ แก้ไขสถานที่เรียบร้อย':'✅ เพิ่มสถานที่เรียบร้อย','ok');
    await loadAll();
    closePM();renderAll();
    const newId=ePid||(res&&res.id?+res.id:null);
    if(d.lat&&newId){selId=+newId;setTimeout(()=>focusPin(+newId),300);}
    setSB(false);mbToggle(false);
  });
}
