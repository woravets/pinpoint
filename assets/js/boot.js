/**
 * Bootloader สำหรับ Android App (แจ้งเตือนตั้งค่า API Key ชัดเจน)
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
    const gmapEl = document.getElementById('gmap');
    if (gmapEl) {
      gmapEl.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:24px;text-align:center;background:#f8fafc;">
          <div style="font-size:48px;margin-bottom:12px;">🔑</div>
          <h3 style="margin:0 0 8px;color:#1e293b;font-size:18px;">ยังไม่ได้ตั้งค่า Google Maps API Key</h3>
          <p style="margin:0 0 18px;color:#64748b;font-size:14px;max-width:300px;">กรุณานำ Google Maps API Key ของคุณมากรอกในหน้าตั้งค่าเพื่อเริ่มใช้งานแผนที่</p>
          <button type="button" onclick="showP('settings')" style="padding:12px 24px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">⚙️ ไปที่หน้าตั้งค่า API Key</button>
        </div>
      `;
    }
    setTimeout(() => {
      alert('⚠️ ยินดีต้อนรับสู่ PinPoint\n\nกรุณากรอก Google Maps API Key ในหน้าตั้งค่าก่อนเริ่มใช้งานแผนที่');
      showP('settings');
    }, 400);
  }

  if (isMob()) {
    setSB(false);
    mbToggle(false);
  }
})();
