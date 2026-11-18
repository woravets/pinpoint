/**
 * Bootloader สำหรับ Android App (รองรับ 3 ภาษา + แจ้งเตือนตั้งค่า API Key)
 */
function renderNoKeyBanner() {
  const gmapEl = document.getElementById('gmap');
  if (!gmapEl) return;
  gmapEl.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:24px;text-align:center;background:#f8fafc;">
      <div style="font-size:48px;margin-bottom:12px;">🔑</div>
      <h3 style="margin:0 0 8px;color:#1e293b;font-size:18px;">${t('banner_no_key_t')}</h3>
      <p style="margin:0 0 18px;color:#64748b;font-size:14px;max-width:300px;">${t('banner_no_key_d')}</p>
      <button type="button" onclick="showP('settings')" style="padding:12px 24px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">${t('banner_no_key_b')}</button>
    </div>
  `;
}

(async function bootApp() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  await loadAll();
  applyLanguage();
  showP('map');
  renderAll();

  const k = getApiKey();
  if (k) {
    loadGoogleMaps(k, () => { initGMap(); });
  } else {
    renderNoKeyBanner();
    setTimeout(() => {
      alert('⚠️ ' + t('banner_no_key_t') + '\n\n' + t('banner_no_key_d'));
      showP('settings');
    }, 400);
  }

  if (isMob()) {
    setSB(false);
    mbToggle(false);
  }
})();
