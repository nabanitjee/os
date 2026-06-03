// =========================
// CLAT TRACKER SYSTEM V4
// =========================

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-clat-btn")?.addEventListener("click", () => showClatForm());
  refreshClatUI();
});

function refreshClatUI() {
  renderClat();
  renderWeeklyClat();
}

function showClatForm(entryId = null) {
  const isEdit = entryId !== null;
  let entry = { english: "", legal: "", gk: "", logical: "", qt: "" };

  if (isEdit) {
    const found = appData.clat.find(e => e.id === Number(entryId));
    if (found) entry = found;
  }

  const formHTML = `
    <div class="form-container" style="padding:10px; color:#fff; font-family:sans-serif;">
      <h3 style="margin-top:0; color:var(--accent);">${isEdit ? "Modify CLAT Hours Log" : "Log Daily CLAT Section Hours"}</h3>
      <hr style="border:0; border-top:1px solid #334; margin-bottom:15px;">
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:var(--accent);">English (hrs)</label>
          <input type="number" id="c-english" step="0.5" min="0" value="${entry.english}" placeholder="0" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:var(--average);">Legal Reasoning</label>
          <input type="number" id="c-legal" step="0.5" min="0" value="${entry.legal}" placeholder="0" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:var(--strong);">General Knowledge</label>
          <input type="number" id="c-gk" step="0.5" min="0" value="${entry.gk}" placeholder="0" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:var(--mastered);">Logical Reasoning</label>
          <input type="number" id="c-logical" step="0.5" min="0" value="${entry.logical}" placeholder="0" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
      </div>

      <div style="margin-bottom:18px; max-width:50%;">
        <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:var(--weak);">Quantitative Tech</label>
        <input type="number" id="c-qt" step="0.5" min="0" value="${entry.qt}" placeholder="0" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button onclick="hideModal()" style="background:#475569; margin:0;">Cancel</button>
        <button onclick="processClatSubmit(${isEdit ? entry.id : null})" style="background:var(--accent); margin:0; font-weight:bold;">Save Log</button>
      </div>
    </div>
  `;
  
  if (typeof showModal === "function") showModal(formHTML);
}

function processClatSubmit(existingId = null) {
  const eng = parseFloat(document.getElementById("c-english").value) || 0;
  const leg = parseFloat(document.getElementById("c-legal").value) || 0;
  const gk = parseFloat(document.getElementById("c-gk").value) || 0;
  const log = parseFloat(document.getElementById("c-logical").value) || 0;
  const qt = parseFloat(document.getElementById("c-qt").value) || 0;
  const calcTotal = eng + leg + gk + log + qt;

  if (calcTotal === 0) { hideModal(); return; }

  if (existingId) {
    const item = appData.clat.find(e => e.id === existingId);
    if (item) {
      item.english = eng; item.legal = leg; item.gk = gk;
      item.logical = log; item.qt = qt; item.total = calcTotal;
    }
  } else {
    appData.clat.push({
      id: Date.now(), date: new Date().toISOString().split("T")[0],
      english: eng, legal: leg, gk: gk, logical: log, qt: qt, total: calcTotal
    });
    if (typeof updateActivity === "function") updateActivity();
  }

  saveData();
  hideModal();
  refreshClatUI();
}

function deleteClat(id) {
  appData.clat = appData.clat.filter(entry => entry.id !== id);
  saveData();
  refreshClatUI();
}

function editClat(id) { showClatForm(id); }

function getWeeklyClatHours() {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  return appData.clat
    .filter(entry => new Date(entry.date) >= weekAgo)
    .reduce((sum, entry) => sum + entry.total, 0);
}

function getMonthlyClatHours() {
  const today = new Date();
  return appData.clat
    .filter(entry => {
      const d = new Date(entry.date);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    })
    .reduce((sum, entry) => sum + entry.total, 0);
}

function getBestClatDay() {
  if (!appData.clat || appData.clat.length === 0) return null;
  return appData.clat.reduce((best, current) => current.total > best.total ? current : best);
}

function renderWeeklyClat() {
  const box = document.getElementById("clat-week-hours");
  const bestDayBox = document.getElementById("best-clat-day");

  if (box) {
    box.innerHTML = `
      <strong>${getWeeklyClatHours().toFixed(1)} Hours</strong><br>
      <span style="font-size:0.85em; opacity:0.7;">This Week</span><br><br>
      <strong>${getMonthlyClatHours().toFixed(1)} Hours</strong><br>
      <span style="font-size:0.85em; opacity:0.7;">This Month</span>
    `;
  }

  if (bestDayBox) {
    const bestRecord = getBestClatDay();
    bestDayBox.innerHTML = bestRecord 
      ? `<strong style="color:var(--strong); font-size:1.1rem;">${bestRecord.total.toFixed(1)} Hours</strong><br><small style="opacity:0.6;">On: ${bestRecord.date}</small>`
      : "No Data Yet";
  }
}

function renderClat() {
  const container = document.getElementById("clat-list");
  if (!container) return;

  let html = "";
  const sorted = [...appData.clat].sort((a, b) => b.id - a.id);

  sorted.forEach(entry => {
    html += `
      <div class="clat-card">
        <h3 style="color:var(--accent); margin-bottom:6px;">📅 ${entry.date}</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:0.9rem; opacity:0.8;">
          <span>Eng: ${entry.english}h</span><span>Legal: ${entry.legal}h</span>
          <span>GK: ${entry.gk}h</span><span>Log: ${entry.logical}h</span>
          <span>Quant: ${entry.qt}h</span>
        </div>
        <p style="margin-top:6px; font-weight:bold; border-top:1px solid rgba(255,255,255,0.05); padding-top:4px;">
          Total: <span style="color:var(--strong);">${entry.total} hrs</span>
        </p>
        <div class="action-row" style="margin-top:10px;">
          <button onclick="editClat(${entry.id})" style="background:var(--card2);">Edit</button>
          <button onclick="deleteClat(${entry.id})" style="background:#b91c1c;">Delete</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html || `<div class="card">No CLAT Entries Yet</div>`;
}

window.editClat = editClat;
window.deleteClat = deleteClat;
