// settings.js (Offline Android Version)
function renderSettings() {
  document.getElementById('sys-ph').textContent = phs.length;
  document.getElementById('sys-ty').textContent = types.length;

  const k = getApiKey();
  const inp = document.getElementById('sak');
  if (inp) inp.value = k;
  updateBadge(k ? 'ok' : '');

  const iIcon = document.getElementById('sapp-icon'); if (iIcon) iIcon.value = appConfig.icon;
  const iName = document.getElementById('sapp-name'); if (iName) iName.value = appConfig.name;
  const iSub  = document.getElementById('sapp-sub');  if (iSub)  iSub.value  = appConfig.sub;
}

function saveBranding() {
  const icon = (document.getElementById('sapp-icon').value || '').trim() || '📍';
  const name = (document.getElementById('sapp-name').value || '').trim();
  const sub  = (document.getElementById('sapp-sub').value || '').trim();
  if (!name) { toast('กรุณาระบุชื่อแอป', 'er'); return; }

  appConfig = { icon, name, sub };
  localStorage.setItem('pp_config', JSON.stringify(appConfig));
  applyBranding();
  toast('✅ บันทึกชื่อและรายละเอียดแอปเรียบร้อย', 'ok');
}

function updateBadge(status, msg) {
  const badge = document.getElementById('map-status-badge'), st = document.getElementById('kst');
  if (!badge) return;
  if (status === 'ok') {
    badge.className = 'msbdg ok';
    badge.textContent = '✅ พร้อมใช้งาน';
    if (st) { st.className = 'kst ok'; st.textContent = '✅ ' + (msg || 'เชื่อมต่อ Google Maps สำเร็จ'); }
  } else {
    badge.className = 'msbdg no';
    badge.textContent = '⚠️ ยังไม่ได้ตั้งค่า';
    if (st) { st.className = 'kst'; st.textContent = msg || ''; }
  }
}

function togSAK() {
  const i = document.getElementById('sak'), b = document.getElementById('sak-eye');
  if (!i) return;
  i.type = i.type === 'password' ? 'text' : 'password';
  b.textContent = i.type === 'password' ? '👁️' : '🙈';
}

function saveKey() {
  const k = (document.getElementById('sak').value || '').trim();
  if (!k) { updateBadge('', 'กรุณาใส่ API Key'); return; }
  localStorage.setItem('gmApiKey', k);
  updateBadge('', 'กำลังโหลด Google Maps...');
  gMap = null;
  loadGoogleMaps(k, () => { initGMap(); updateBadge('ok', 'Google Maps พร้อมใช้งาน'); });
  toast('✅ บันทึก API Key ลงเครื่องแล้ว', 'ok');
}

function clearKey() {
  localStorage.removeItem('gmApiKey');
  const inp = document.getElementById('sak');
  if (inp) inp.value = '';
  updateBadge('');
  gMap = null;
  document.getElementById('gmap').innerHTML = '';
  toast('🗑️ ลบ API Key ออกจากเครื่องเรียบร้อย', 'ok');
}

function exportData() {
  const blob = new Blob([JSON.stringify({ places: phs, types, config: appConfig, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pinpoint-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  toast('📥 Export สำเร็จ', 'ok');
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async e => {
    try {
      const d = JSON.parse(e.target.result);
      if (Array.isArray(d.types)) {
        localStorage.setItem('pp_types', JSON.stringify(d.types));
      }
      let ok = 0;
      if (Array.isArray(d.places)) {
        for (const p of d.places) {
          await api('places', 'POST', {
            name: p.name,
            tid: p.tid || p.type_id,
            date: p.date || p.survey_date || '',
            addr: p.addr || p.address || '',
            ph: p.ph || p.phone || '',
            lat: p.lat,
            lng: p.lng,
            note: p.note || '',
            ps: p.ps || p.pin_shape || 'teardrop',
            pc: p.pc || p.pin_color || '#e05252',
            history: p.history || []
          });
          ok++;
        }
      }
      await loadAll();
      renderAll();
      toast('📤 Import สำเร็จ ' + ok + ' สถานที่', 'ok');
    } catch {
      toast('❌ ไฟล์ไม่ถูกต้อง', 'er');
    }
  };
  reader.readAsText(file);
  input.value = '';
}
