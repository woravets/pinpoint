// place.js (Fixed for Android Standalone)
function openPM(e, id) {
  if (e) e.stopPropagation();

  types = JSON.parse(localStorage.getItem('pp_types') || '[]');

  if (!id && types.length === 0) {
    alert('⚠️ ยังไม่มีประเภทสถานที่\n\nกรุณาสร้าง "ประเภทสถานที่" อย่างน้อย 1 รายการก่อนเพิ่มสถานที่');
    showP('types');
    return;
  }

  ePid = id || null;
  const titleEl = document.getElementById('ph-title');
  if (titleEl) titleEl.textContent = id ? '✏️ แก้ไขข้อมูลสถานที่' : '📍 เพิ่มสถานที่';

  const sel = document.getElementById('ft');
  if (sel) {
    sel.innerHTML = types.map(t => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
  }

  if (id) {
    const p = phs.find(x => Number(x.id) === Number(id));
    if (!p) return;
    document.getElementById('fn').value = p.name || '';
    if (sel) sel.value = p.tid || (types[0] ? types[0].id : '');
    document.getElementById('fd').value = p.date || '';
    document.getElementById('fph').value = p.ph || '';
    document.getElementById('fa').value = p.addr || '';
    document.getElementById('flat').value = p.lat || '';
    document.getElementById('flng').value = p.lng || '';
    document.getElementById('fno').value = p.note || '';
    selPS = p.ps || 'teardrop';
    selPC = p.pc || '#e05252';
    if (typeof renderSurveyHistory === 'function') renderSurveyHistory(p.history || [], p.date);
  } else {
    ['fn', 'fph', 'fa', 'flat', 'flng', 'fno'].forEach(x => {
      const el = document.getElementById(x);
      if (el) el.value = '';
    });
    if (sel) sel.value = types[0] ? types[0].id : '';
    document.getElementById('fd').value = new Date().toISOString().split('T')[0];
    selPS = 'teardrop';
    selPC = types[0] ? types[0].color : '#e05252';
    const gml = document.getElementById('gml');
    if (gml) gml.value = '';
    if (typeof renderSurveyHistory === 'function') renderSurveyHistory([], null);
  }

  const cst = document.getElementById('cst');
  if (cst) cst.textContent = '';
  const gb = document.getElementById('gb');
  if (gb) {
    gb.textContent = '📡 หาตำแหน่งปัจจุบัน';
    gb.disabled = false;
  }

  const modal = document.getElementById('mo-ph');
  if (modal) {
    modal.classList.add('on');
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'all';
  }
  if (typeof initPicker === 'function') setTimeout(initPicker, 60);
}

function closePM() {
  const modal = document.getElementById('mo-ph');
  if (modal) {
    modal.classList.remove('on');
    modal.style.opacity = '';
    modal.style.pointerEvents = '';
  }
  ePid = null;
}

async function savePh() {
  const name = document.getElementById('fn').value.trim();
  const tid = document.getElementById('ft').value;
  const date = document.getElementById('fd').value;
  const addr = document.getElementById('fa').value.trim();

  if (!name || !tid || !date || !addr) {
    alert('⚠️ กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบ (ชื่อสถานที่, ประเภท, วันที่, ที่อยู่)');
    return;
  }

  const lat = parseFloat(document.getElementById('flat').value) || null;
  const lng = parseFloat(document.getElementById('flng').value) || null;
  if ((lat && !lng) || (!lat && lng)) {
    alert('⚠️ กรุณากรอกพิกัดละติจูดและลองจิจูดให้ครบทั้ง 2 ช่อง');
    return;
  }

  const d = {
    name,
    tid,
    date,
    addr,
    lat,
    lng,
    ph: document.getElementById('fph').value.trim(),
    note: document.getElementById('fno').value.trim(),
    ps: typeof selPS !== 'undefined' ? selPS : 'teardrop',
    pc: typeof selPC !== 'undefined' ? selPC : '#e05252'
  };

  const res = ePid
    ? await api('places', 'PUT', { ...d, surveyor: 'Admin' }, ePid)
    : await api('places', 'POST', d);

  toast(ePid ? '✅ แก้ไขสถานที่เรียบร้อย' : '✅ เพิ่มสถานที่เรียบร้อย', 'ok');
  await loadAll();
  closePM();
  renderAll();

  const newId = ePid || (res && res.id ? +res.id : null);
  if (d.lat && newId && typeof focusPin === 'function') {
    selId = +newId;
    setTimeout(() => focusPin(+newId), 300);
  }
  setSB(false);
  mbToggle(false);
}
