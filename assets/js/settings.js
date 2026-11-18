// settings.js (Offline Android Version + Emoji Picker + i18n)
const APP_EMOJIS = [
  '📍','📌','🗺️','🧭','🏥','💊','🩺','🚑',
  '🏪','🏬','🏢','🏠','🏡','🏭','🏗️','🏛️',
  '🏫','🎓','📚','⛪','🕌','🛕','⛩️','🏟️',
  '🌳','🌲','🌾','🏞️','🏖️','⛰️','🚩','🎯'
];

function renderEmojiGrid() {
  const grid = document.getElementById('emoji-grid');
  if (!grid) return;
  const cur = (document.getElementById('sapp-icon')?.value || '📍').trim();
  grid.innerHTML = APP_EMOJIS.map(em => {
    const active = em === cur;
    return `<button type="button" onclick="pickAppEmoji('${em}')" style="font-size:20px;padding:6px 0;border-radius:8px;border:2px solid ${active ? 'var(--green)' : 'transparent'};background:${active ? '#dcfce7' : 'var(--w)'};cursor:pointer;line-height:1.2;">${em}</button>`;
  }).join('');
}

function pickAppEmoji(em) {
  const inp = document.getElementById('sapp-icon');
  if (inp) inp.value = em;
  renderEmojiGrid();
}

function syncEmojiGrid() {
  renderEmojiGrid();
}

function renderSettings() {
  const sp = document.getElementById('sys-ph');
  const st = document.getElementById('sys-ty');
  if (sp) sp.textContent = phs.length;
  if (st) st.textContent = types.length;

  const k = getApiKey();
  const inp = document.getElementById('sak');
  if (inp) inp.value = k;
  updateBadge(k ? 'ok' : '');

  const iIcon = document.getElementById('sapp-icon'); if (iIcon) iIcon.value = appConfig.icon;
  const iName = document.getElementById('sapp-name'); if (iName) iName.value = appConfig.name;
  const iSub  = document.getElementById('sapp-sub');  if (iSub)  iSub.value  = appConfig.sub;
  const langSel = document.getElementById('slang');   if (langSel) langSel.value = curLang;
  renderEmojiGrid();
}

function saveBranding() {
  const icon = (document.getElementById('sapp-icon').value || '').trim() || '📍';
  const name = (document.getElementById('sapp-name').value || '').trim();
  const sub  = (document.getElementById('sapp-sub').value || '').trim();
  if (!name) { toast('⚠️ ' + t('name_lbl'), 'er'); return; }

  appConfig = { icon, name, sub };
  localStorage.setItem('pp_config', JSON.stringify(appConfig));
  applyBranding();
  toast('✅ ' + name, 'ok');
}

function updateBadge(status, msg) {
  const badge = document.getElementById('map-status-badge'), st = document.getElementById('kst');
  if (!badge) return;
  if (status === 'ok') {
    badge.className = 'msbdg ok';
    badge.textContent = t('key_ready');
    if (st) { st.className = 'kst ok'; st.textContent = msg || t('key_ready'); }
  } else {
    badge.className = 'msbdg no';
    badge.textContent = t('key_not_set');
    if (st) { st.className = 'kst er'; st.textContent = msg || ''; }
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
  if (!k) { updateBadge('', 'API Key'); return; }
  localStorage.setItem('gmApiKey', k);
  updateBadge('', 'Loading...');
  gMap = null;
  const gmEl = document.getElementById('gmap');
  if (gmEl) gmEl.innerHTML = '';
  loadGoogleMaps(k, () => { initGMap(); updateBadge('ok', t('key_ready')); });
  toast('✅ API Key Saved', 'ok');
}

function clearKey() {
  localStorage.removeItem('gmApiKey');
  const inp = document.getElementById('sak');
  if (inp) inp.value = '';
  updateBadge('');
  gMap = null;
  const gmEl = document.getElementById('gmap');
  if (gmEl) gmEl.innerHTML = '';
  if (typeof renderNoKeyBanner === 'function') renderNoKeyBanner();
  toast('🗑️ Key Removed', 'ok');
}

function exportData() {
  const blob = new Blob([JSON.stringify({ places: phs, types, config: appConfig, lang: curLang, exportDate: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pinpoint-backup-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  toast('📥 Export OK', 'ok');
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
      toast('📤 Import OK (' + ok + ')', 'ok');
    } catch {
      toast('❌ Invalid JSON', 'er');
    }
  };
  reader.readAsText(file);
  input.value = '';
}
