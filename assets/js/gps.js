// gps.js
function getGPS(){
  const btn=document.getElementById('gb'),st=document.getElementById('cst');
  if(btn){btn.textContent='📡 ...';btn.disabled=true;}
  if(st){st.textContent='GPS...';st.style.color='var(--g500)';}
  if(!navigator.geolocation){
    if(btn){btn.textContent=t('btn_gps');btn.disabled=false;}
    if(st){st.textContent='⚠️ No GPS';st.style.color='var(--red)';}
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos=>{
      const la=pos.coords.latitude.toFixed(6),ln=pos.coords.longitude.toFixed(6);
      document.getElementById('flat').value=la;document.getElementById('flng').value=ln;
      if(btn){btn.textContent='✅ OK';btn.disabled=false;}
      if(st){st.textContent='📍 '+la+', '+ln+' (±'+Math.round(pos.coords.accuracy)+'m)';st.style.color='var(--green)';}
      if(gMap)gMap.panTo({lat:+la,lng:+ln});
      updPrev();toast('📍 GPS OK','ok');
      setTimeout(()=>{if(btn)btn.textContent=t('btn_gps');},3000);
    },
    err=>{
      if(btn){btn.textContent=t('btn_gps');btn.disabled=false;}
      if(st){st.textContent='⚠️ GPS Error ('+err.code+')';st.style.color='var(--red)';}
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
    updPrev();toast('📍 OK','ok');
  } else toast('⚠️ 13.7563, 100.5018','er');
}
const gmlInput = document.getElementById('gml');
if (gmlInput) gmlInput.addEventListener('keydown',e=>{if(e.key==='Enter')parseGML();});
