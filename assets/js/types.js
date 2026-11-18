// types.js (Standalone Android Version + i18n)
function renderTypes() {
  const st1 = document.getElementById('st1');
  const st2 = document.getElementById('st2');
  const st3 = document.getElementById('st3');
  if (st1) st1.textContent = types.length;
  if (st2) st2.textContent = phs.length;
  if (st3) st3.textContent = new Set(phs.map(p => String(p.tid))).size;

  const tbody = document.getElementById('ttb');
  if (!tbody) return;

  if (!types || types.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#94a3b8;">${t('empty_types')}</td></tr>`;
    return;
  }

  tbody.innerHTML = types.map((tp, i) => {
    const cnt = phs.filter(p => String(p.tid) === String(tp.id)).length;
    return `<tr>
      <td style="color:#94a3b8;font-size:12px">${i + 1}</td>
      <td><b>${esc(tp.name)}</b></td>
      <td><div style="display:flex;align-items:center;gap:7px"><span class="cs" style="background:${esc(tp.color)}"></span><span style="font-size:12px;color:#64748b">${esc(tp.color)}</span></div></td>
      <td style="font-weight:700;color:${cnt > 0 ? '#16a34a' : '#94a3b8'}">${t('unit_count',{n:cnt})}</td>
      <td><div style="display:flex;gap:5px">
        <button type="button" class="bs bs-e" onclick="openTM('${esc(tp.id)}')">${t('btn_edit')}</button>
        ${cnt === 0 ? `<button type="button" class="bs bs-d" onclick="askDel(null,'ty','${esc(tp.id)}')">${t('btn_del')}</button>` : `<button type="button" class="bs" style="background:#f1f5f9;color:#94a3b8" disabled>🔒</button>`}
      </div></td>
    </tr>`;
  }).join('');
}

async function addType() {
  const inp = document.getElementById('ntn');
  const colInp = document.getElementById('ntc');
  const name = (inp ? inp.value : '').trim();
  const color = colInp ? colInp.value : '#2563eb';

  if (!name) {
    alert('⚠️ ' + t('new_type_lbl'));
    return;
  }

  const id = 'ty_' + Date.now();
  await api('types', 'POST', { id, name, color });
  if (inp) inp.value = '';
  await loadAll();
  renderTypes();
  renderAllPins();
  toast('✅ ' + name, 'ok');
}

function openTM(id) {
  eTid2 = id;
  const tp = types.find(x => String(x.id) === String(id));
  if (!tp) return;
  document.getElementById('etn').value = tp.name;
  document.getElementById('etc').value = tp.color;
  document.getElementById('etcv').textContent = tp.color;
  document.getElementById('mo-ty').classList.add('on');
}

function closeTM() {
  document.getElementById('mo-ty').classList.remove('on');
  eTid2 = null;
}

async function saveTM() {
  const name = document.getElementById('etn').value.trim();
  const color = document.getElementById('etc').value;
  if (!name) { alert('⚠️ ' + t('th_name')); return; }
  await api('types', 'PUT', { name, color }, eTid2);
  closeTM();
  await loadAll();
  renderTypes();
  renderList();
  renderAllPins();
  toast('✅ OK', 'ok');
}

const etcEl = document.getElementById('etc');
if (etcEl) {
  etcEl.addEventListener('input', function () {
    document.getElementById('etcv').textContent = this.value;
  });
}
