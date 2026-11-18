// gps.js
function getGPS(){
  const btn=document.getElementById('gb'),st=document.getElementById('cst');
  if(btn){btn.textContent='📡 กำลังหา...';btn.disabled=true;}
  if(st){st.textContent='กำลังขอสิทธิ์ GPS...';st.style.color='var(--g500)';}
  if(!navigator.geolocation){
    if(btn){btn.textContent='📡 หาตำแหน่งปัจจุบัน';btn.disabled=false;}
    if(st){st.textContent='⚠️ อุปกรณ์ไม่รองรับ GPS';st.style.color='var(--red)';}
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      const la=pos.coords.latitude.toFixed(6),ln=pos.coords.longitude.toFixed(6);
      document.getElementById('flat').value=la;document.getElementById('flng').value=ln;
      if(btn){btn.textContent='✅ พบตำแหน่งแล้ว';btn.disabled=false;}
      if(st){st.textContent='📍 '+la+', '+ln+' (±'+Math.round(pos.coords.accuracy)+'ม.)';st.style.color='var(--green)';}
      if(gMap)gMap.panTo({lat:+la,lng:+ln});
      updPrev();toast('📍 ดึงพิกัดสำเร็จ','ok');
      setTimeout(()=>{if(btn)btn.textContent='📡 หาตำแหน่งปัจจุบัน';},3000);
    },
    err=>{
      if(btn){btn.textContent='📡 หาตำแหน่งปัจจุบัน';btn.disabled=false;}
      const m={1:'⚠️ ถูกปฏิเสธสิทธิ์ — อนุญาต Location ในตั้งค่าแอป',2:'⚠️ ไม่พบสัญญาณ GPS',3:'⚠️ หมดเวลา — ลองใหม่'};
      if(st){st.textContent=m[err.code]||'⚠️ GPS error';st.style.color='var(--red)';}
    },
    {enableHighAccuracy:true,timeout:10000,maximumAge:0}
  );
}
function parseGML(){
  const gmlEl=document.getElementById('gml');
  const raw=(gmlEl?gmlEl.value:'').trim();if(!raw)return;
  let lat=null,lng=null,m;
  m=raw.match(/(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)/);if(m){lat=+m[1];lng=+m[2];}
  if(!lat){m=raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);if(m){lat=+m[1];lng=+m[2];}}
  if(!lat){m=raw.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);if(m){lat=+m[1];lng=+m[2];}}
  if(lat&&lng&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180){
    document.getElementById('flat').value=lat.toFixed(6);document.getElementById('flng').value=lng.toFixed(6);
    const cst=document.getElementById('cst');
    if(cst){cst.textContent='📍 '+lat.toFixed(5)+', '+lng.toFixed(5);cst.style.color='var(--green)';}
    if(gmlEl)gmlEl.value='';
    updPrev();toast('📍 ใส่พิกัดเรียบร้อย','ok');
  } else toast('ไม่พบพิกัด — ลองพิมพ์ตรงๆ เช่น 13.7563, 100.5018','er');
}
const gmlInput = document.getElementById('gml');
if (gmlInput) gmlInput.addEventListener('keydown',e=>{if(e.key==='Enter')parseGML();});
