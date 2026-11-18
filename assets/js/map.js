// map.js
let gMap=null,gMarkers=[],gInfoWin=null,gMyLocMarker=null;
let pickMap=null,pickMarker=null,pLat=null,pLng=null,pkSat=false;

function loadGoogleMaps(key,cb){
  if(typeof google!=='undefined'&&google.maps){if(cb)cb();return;}
  const old=document.getElementById('gm-script');if(old)old.remove();
  window._gmCB=cb;
  const mapLang = (typeof curLang !== 'undefined' && curLang === 'zh') ? 'zh-CN' : (typeof curLang !== 'undefined' ? curLang : 'th');
  const s=document.createElement('script');
  s.id='gm-script';
  s.src='https://maps.googleapis.com/maps/api/js?key='+key+'&callback=_gmReady&language='+mapLang;
  s.async=true;s.defer=true;
  s.onerror=()=>{toast('❌ ไม่สามารถโหลด Google Maps — ตรวจสอบอินเทอร์เน็ตหรือ API Key','er');};
  document.head.appendChild(s);
}
window._gmReady=function(){
  if(window._gmCB){window._gmCB();window._gmCB=null;}
  updateBadge('ok','Google Maps พร้อมใช้งาน');
};
window.gm_authFailure=function(){
  updateBadge('','API Key ไม่ถูกต้อง หรือยังไม่ได้เปิดใช้งาน Maps JavaScript API');
  toast('❌ Google Maps API Key ไม่ถูกต้อง กรุณาตรวจสอบในหน้าตั้งค่า','er');
};

function initGMap(){
  const el=document.getElementById('gmap');if(!el||gMap)return;
  el.innerHTML='';
  gMap=new google.maps.Map(el,{
    center:{lat:13.7367,lng:100.5232},zoom:12,
    mapTypeControl:true,
    mapTypeControlOptions:{style:google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position:google.maps.ControlPosition.TOP_LEFT,
      mapTypeIds:['roadmap','satellite','hybrid','terrain']},
    streetViewControl:true,fullscreenControl:false,zoomControl:true,
  });
  const sv=gMap.getStreetView();
  if(sv){
    sv.setOptions({
      enableCloseButton:true,
      addressControlOptions:{position:google.maps.ControlPosition.BOTTOM_CENTER}
    });
  }
  gInfoWin=new google.maps.InfoWindow();
  renderAllPins();
  toast('✅ Google Maps โหลดสำเร็จ','ok');
}

function renderAllPins(){
  if(!gMap||typeof google==='undefined')return;
  gMarkers.forEach(m=>m.setMap(null));gMarkers=[];
  phs.filter(p=>p.lat&&p.lng).forEach(p=>{
    const t=types.find(t=>String(t.id)===String(p.tid))||{color:'#888'};
    const isSel=+p.id===+selId;
    const mk=new google.maps.Marker({
      position:{lat:+p.lat,lng:+p.lng},map:gMap,title:p.name,
      icon:mkIcon(p.pc||t.color,p.ps||'teardrop',isSel),
      zIndex:isSel?999:1,
      animation:isSel?google.maps.Animation.BOUNCE:null,
    });
    mk.addListener('click',()=>{
      selId=p.id;renderAllPins();renderList();
      const t2=types.find(t=>String(t.id)===String(p.tid))||{name:''};
      gInfoWin.setContent(`<div style="font-family:-apple-system,sans-serif;padding:4px;min-width:180px">
        <div style="font-weight:700;font-size:14px;color:#1a2744;margin-bottom:4px">${esc(p.name)}</div>
        <div style="font-size:12px;color:#718096;margin-bottom:2px">🏷️ ${esc(t2.name)}</div>
        <div style="font-size:12px;color:#718096;margin-bottom:2px">📅 ${fmtDateTH(p.date)}</div>
        <div style="font-size:12px;color:#718096">${esc(p.addr)}</div>
        ${p.note?`<div style="font-size:11px;color:#a0aec0;margin-top:4px;font-style:italic">${esc(p.note)}</div>`:''}
        <div style="margin-top:8px;display:flex;gap:8px">
          <a href="https://maps.google.com/?q=${p.lat},${p.lng}" target="_blank" style="font-size:12px;color:#2563eb;font-weight:600;text-decoration:none">${t('btn_nav')}</a>
        </div></div>`);
      gInfoWin.open(gMap,mk);
      const el=document.getElementById('pi-'+p.id);
      if(el){el.scrollIntoView({behavior:'smooth',block:'center'});setSB(false);mbToggle(false);}
    });
    gMarkers.push(mk);
  });
  renderLeg();
}

function renderLeg(){
  const used=[...new Set(phs.map(p=>String(p.tid)))];
  const items=types.filter(t=>used.includes(String(t.id)));
  const el=document.getElementById('mleg');if(!el)return;
  if(!items.length){el.style.display='none';return;}
  el.style.display='';
  el.innerHTML=`<h4>${t('stat_types')}</h4>`+items.map(t=>`<div class="mleg-i"><div class="mleg-d" style="background:${esc(t.color)}"></div><span>${esc(t.name)}</span></div>`).join('');
}

function exitStreetView(){
  if(gMap&&gMap.getStreetView&&gMap.getStreetView().getVisible()){
    gMap.getStreetView().setVisible(false);
    return true;
  }
  return false;
}

function focusPin(id){
  const p=phs.find(x=>+x.id===+id);if(!p||!p.lat)return;
  selId=id;
  if(gMap){
    exitStreetView();
    gMap.panTo({lat:+p.lat,lng:+p.lng});
    gMap.setZoom(17);
  }
  renderAllPins();renderList();
}

function goMyLocation(){
  const btn=document.getElementById('myloc-btn');
  if(btn)btn.textContent='⏳';
  if(!gMap){if(btn)btn.textContent='📍';toast('กรุณาตั้งค่า API Key ก่อน (⚙️)','er');return;}
  if(!navigator.geolocation){if(btn)btn.textContent='📍';toast('GPS not supported','er');return;}
  navigator.geolocation.getCurrentPosition(
    pos=>{
      exitStreetView();
      const la=pos.coords.latitude,ln=pos.coords.longitude;
      gMap.panTo({lat:la,lng:ln});gMap.setZoom(16);
      if(gMyLocMarker)gMyLocMarker.setMap(null);
      gMyLocMarker=new google.maps.Marker({
        position:{lat:la,lng:ln},map:gMap,title:'My Location',zIndex:9999,
        icon:{path:google.maps.SymbolPath.CIRCLE,scale:10,fillColor:'#2563eb',fillOpacity:1,strokeColor:'white',strokeWeight:3}
      });
      if(btn)btn.textContent='📍';
      toast('📍 GPS OK','ok');
    },
    err=>{
      if(btn)btn.textContent='📍';
      toast('⚠️ GPS Error (' + err.code + ')','er');
    },
    {enableHighAccuracy:true,timeout:10000,maximumAge:0}
  );
}

function openInMaps(id){
  let la,ln,lb;
  if(id!==null){const p=phs.find(x=>+x.id===+id);if(!p)return;la=p.lat;ln=p.lng;lb=p.name;}
  else if(gMap){const c=gMap.getCenter();la=c.lat();ln=c.lng();}
  else{la=13.7367;ln=100.5232;}
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent);
  window.open(isIOS?`maps://maps.apple.com/?q=${encodeURIComponent(lb||'')}&&ll=${la},${ln}&z=16`:`https://maps.google.com/maps?q=${la},${ln}&z=16`,'_blank');
}

function openMapPick(){
  pLat=parseFloat(document.getElementById('flat').value)||null;
  pLng=parseFloat(document.getElementById('flng').value)||null;
  document.getElementById('mpm').classList.add('on');
  updMPD();
  const k=getApiKey();
  if(!k){toast('กรุณาตั้งค่า API Key ก่อน (⚙️)','er');return;}
  function buildPick(){
    const el=document.getElementById('pick-gmap');if(!el)return;
    const la=pLat||13.7367,ln=pLng||100.5232;
    if(!pickMap){
      pickMap=new google.maps.Map(el,{
        center:{lat:la,lng:ln},zoom:16,
        mapTypeControl:true,
        mapTypeControlOptions:{style:google.maps.MapTypeControlStyle.HORIZONTAL_BAR,position:google.maps.ControlPosition.TOP_LEFT},
        streetViewControl:false,fullscreenControl:false,
      });
      pickMap.addListener('click',e=>{
        pLat=e.latLng.lat();pLng=e.latLng.lng();
        if(pickMarker){pickMarker.setPosition(e.latLng);pickMarker.setMap(pickMap);}
        else{pickMarker=new google.maps.Marker({position:e.latLng,map:pickMap,draggable:true,icon:mkIcon(selPC,selPS,true)});
          pickMarker.addListener('dragend',ev=>{pLat=ev.latLng.lat();pLng=ev.latLng.lng();updMPD();});}
        updMPD();
      });
    } else {
      pickMap.setCenter({lat:la,lng:ln});pickMap.setZoom(16);
      google.maps.event.trigger(pickMap,'resize');
    }
    if(pLat&&pLng){
      if(!pickMarker){
        pickMarker=new google.maps.Marker({position:{lat:pLat,lng:pLng},map:pickMap,draggable:true,icon:mkIcon(selPC,selPS,true)});
        pickMarker.addListener('dragend',e=>{pLat=e.latLng.lat();pLng=e.latLng.lng();updMPD();});
      } else {pickMarker.setPosition({lat:pLat,lng:pLng});pickMarker.setMap(pickMap);pickMarker.setIcon(mkIcon(selPC,selPS,true));}
    }
  }
  if(typeof google!=='undefined'&&google.maps){setTimeout(buildPick,80);}
  else{loadGoogleMaps(k,()=>setTimeout(buildPick,80));}
}
function updatePickMarkerIcon(){if(pickMarker&&typeof google!=='undefined')pickMarker.setIcon(mkIcon(selPC,selPS,true));}
function togSat(){
  pkSat=!pkSat;
  const btn=document.getElementById('bsat');
  if(btn){btn.classList.toggle('on',pkSat);btn.textContent=pkSat?t('nav_map'):t('btn_sat');}
  if(pickMap)pickMap.setMapTypeId(pkSat?'hybrid':'roadmap');
}
function updMPD(){
  const el=document.getElementById('mpcd');if(!el)return;
  if(pLat===null)el.textContent=t('pick_hint');
  else el.innerHTML='📍 Lat: <b>'+pLat.toFixed(6)+'</b> &nbsp; Lng: <b>'+pLng.toFixed(6)+'</b>';
}
function confirmPick(){
  if(pLat===null){toast(t('pick_hint'),'er');return;}
  document.getElementById('flat').value=pLat.toFixed(6);
  document.getElementById('flng').value=pLng.toFixed(6);
  document.getElementById('cst').textContent='📍 '+pLat.toFixed(5)+', '+pLng.toFixed(5);
  document.getElementById('cst').style.color='var(--green)';
  closeMPM();updPrev();toast('📍 OK','ok');
}
function closeMPM(){document.getElementById('mpm').classList.remove('on');}
