// types.js
// ══ TYPES ══
function renderTypes(){
  document.getElementById('st1').textContent=types.length;
  document.getElementById('st2').textContent=phs.length;
  document.getElementById('st3').textContent=new Set(phs.map(p=>p.tid)).size;
  document.getElementById('ttb').innerHTML=types.map((t,i)=>{
    const cnt=phs.filter(p=>p.tid===t.id).length;
    return`<tr><td style="color:var(--g300);font-size:12px">${i+1}</td><td><b>${esc(t.name)}</b></td>
    <td><div style="display:flex;align-items:center;gap:7px"><span class="cs" style="background:${esc(t.color)}"></span><span style="font-size:12px;color:var(--g500)">${esc(t.color)}</span></div></td>
    <td style="font-weight:700;color:${cnt>0?'var(--green)':'var(--g300)'}">${cnt} แห่ง</td>
    <td><div style="display:flex;gap:5px">
      <button class="bs bs-e" onclick="openTM('${esc(t.id)}')">✏️ แก้ไข</button>
      ${cnt===0?`<button class="bs bs-d" onclick="askDel(null,'ty','${esc(t.id)}')">🗑️ ลบ</button>`:`<button class="bs" style="background:var(--g50);color:var(--g300);cursor:not-allowed" disabled>🔒</button>`}
    </div></td></tr>`;
  }).join('');
}
function addType(){
  const name=document.getElementById('ntn').value.trim(),color=document.getElementById('ntc').value;
  if(!name){toast('กรุณาระบุชื่อประเภท','er');return;}
  const id='ty_'+Date.now();
  api('types','POST',{id,name,color}).then(async()=>{
    document.getElementById('ntn').value='';
    await loadAll();renderTypes();renderAllPins();toast('✅ เพิ่มประเภทสถานที่เรียบร้อย','ok');
  });
}
function openTM(id){eTid2=id;const t=types.find(x=>x.id===id);document.getElementById('etn').value=t.name;document.getElementById('etc').value=t.color;document.getElementById('etcv').textContent=t.color;document.getElementById('mo-ty').classList.add('on');}
function closeTM(){document.getElementById('mo-ty').classList.remove('on');eTid2=null;}
function saveTM(){
  const name=document.getElementById('etn').value.trim(),color=document.getElementById('etc').value;
  if(!name){toast('กรุณาระบุชื่อประเภท','er');return;}
  api('types','PUT',{name,color},eTid2).then(async()=>{
    closeTM();await loadAll();renderTypes();renderList();renderAllPins();toast('✅ แก้ไขประเภทสถานที่เรียบร้อย','ok');
  });
}
document.getElementById('etc').addEventListener('input',function(){document.getElementById('etcv').textContent=this.value;});
