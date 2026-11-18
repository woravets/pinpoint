/**
 * Local Database Engine (Standalone Android Offline-First - Final)
 * - ล้างข้อมูลตัวอย่างทั้งหมด 100% (สถานที่ = [], ประเภท = [])
 * - ไม่มี API Key ฝังอยู่ (gmApiKey = '')
 * - เปิดใช้งานด้วยสิทธิ์ Admin ทันที
 */
let types = [];
let users = [];
let phs = [];
let cu = { id: 1, username: 'admin', fn: 'ผู้ดูแลระบบ', ln: '', role: 'admin', on: true };
let ePid = null, eUid2 = null, eTid2 = null, cfCb = null, selId = null;
let appConfig = { icon: '📍', name: 'PinPoint', sub: 'ระบบปักหมุดส่วนบุคคล' };

const DEFAULT_TYPES = [];

function initLocalDB() {
  if (!localStorage.getItem('pp_types')) {
    localStorage.setItem('pp_types', JSON.stringify(DEFAULT_TYPES));
  }
  if (!localStorage.getItem('pp_places')) {
    localStorage.setItem('pp_places', JSON.stringify([]));
  }
  const savedCfg = localStorage.getItem('pp_config');
  if (savedCfg) {
    try { appConfig = JSON.parse(savedCfg); } catch (e) {}
  }
  applyBranding();
}

function applyBranding() {
  document.title = appConfig.name;
  const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setTxt('top-icon', appConfig.icon);
  setTxt('top-title', appConfig.name);
  setTxt('top-sub', appConfig.sub);
}

async function api(resource, method = 'GET', body = null, id = null) {
  if (resource === 'places') {
    let list = JSON.parse(localStorage.getItem('pp_places') || '[]');
    if (method === 'GET') return list;

    if (method === 'POST') {
      const newId = list.length ? Math.max(...list.map(x => Number(x.id))) + 1 : 1;
      const newItem = {
        id: newId,
        name: body.name,
        type_id: body.tid,
        survey_date: body.date,
        address: body.addr,
        phone: body.ph || '',
        lat: body.lat ? parseFloat(body.lat) : null,
        lng: body.lng ? parseFloat(body.lng) : null,
        note: body.note || '',
        pin_shape: body.ps || 'teardrop',
        pin_color: body.pc || '#e05252',
        history: body.history || []
      };
      list.push(newItem);
      localStorage.setItem('pp_places', JSON.stringify(list));
      return { id: newId };
    }

    if (method === 'PUT' && id) {
      const idx = list.findIndex(x => Number(x.id) === Number(id));
      if (idx > -1) {
        const old = list[idx];
        let hist = old.history || [];
        if (body.history) {
          hist = body.history;
        } else if (old.survey_date && old.survey_date !== body.date) {
          hist.unshift({ date: old.survey_date, note: old.note || '', by: 'Admin' });
        }
        list[idx] = {
          ...old,
          name: body.name,
          type_id: body.tid,
          survey_date: body.date,
          address: body.addr,
          phone: body.ph || '',
          lat: body.lat ? parseFloat(body.lat) : null,
          lng: body.lng ? parseFloat(body.lng) : null,
          note: body.note || '',
          pin_shape: body.ps || 'teardrop',
          pin_color: body.pc || '#e05252',
          history: hist
        };
        localStorage.setItem('pp_places', JSON.stringify(list));
      }
      return { updated: true };
    }

    if (method === 'DELETE' && id) {
      list = list.filter(x => Number(x.id) !== Number(id));
      localStorage.setItem('pp_places', JSON.stringify(list));
      return { deleted: true };
    }
  }

  if (resource === 'types') {
    let tList = JSON.parse(localStorage.getItem('pp_types') || '[]');
    if (method === 'GET') return tList;

    if (method === 'POST') {
      const newTid = body.id || ('ty_' + Date.now());
      tList.push({ id: newTid, name: body.name, color: body.color || '#2563eb', sort_order: tList.length + 1 });
      localStorage.setItem('pp_types', JSON.stringify(tList));
      return { created: true, id: newTid };
    }

    if (method === 'PUT' && id) {
      const idx = tList.findIndex(x => String(x.id) === String(id));
      if (idx > -1) {
        tList[idx].name = body.name;
        tList[idx].color = body.color;
      }
      localStorage.setItem('pp_types', JSON.stringify(tList));
      return { updated: true };
    }

    if (method === 'DELETE' && id) {
      tList = tList.filter(x => String(x.id) !== String(id));
      localStorage.setItem('pp_types', JSON.stringify(tList));
      return { deleted: true };
    }
  }
}

async function loadAll() {
  initLocalDB();
  types = await api('types');
  const placesRes = await api('places');
  phs = placesRes.map(r => ({
    ...r,
    id: parseInt(r.id),
    tid: r.type_id,
    addr: r.address,
    ph: r.phone || '',
    ps: r.pin_shape || 'teardrop',
    pc: r.pin_color || '#e05252',
    lat: r.lat ? parseFloat(r.lat) : null,
    lng: r.lng ? parseFloat(r.lng) : null,
    date: r.survey_date || '',
    note: r.note || '',
    history: r.history || []
  }));
}

function getApiKey() {
  return localStorage.getItem('gmApiKey') || '';
}

function sv() {}
