/**
 * Bootloader สำหรับ Android App (เข้าใช้งานแบบ Admin ทันที)
 */
(async function bootApp() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  await loadAll();
  showP('map');
  renderAll();

  const k = getApiKey();
  if (k) {
    loadGoogleMaps(k, () => { initGMap(); });
  } else {
    toast('กรุณาใส่ Google Maps API Key และสร้างประเภทสถานที่เพื่อเริ่มใช้งาน', 'er');
    setTimeout(() => showP('settings'), 1000);
  }

  if (isMob()) {
    setSB(false);
    mbToggle(false);
  }
})();
