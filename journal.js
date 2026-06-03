// =========================
// JOURNAL MODULE V4
// =========================

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-journal-entry")?.addEventListener("click", () => showJournalForm());
  renderJournal();
});

function showJournalForm(entryId = null) {
  const isEdit = entryId !== null;
  let entry = { hours: "", mood: "7", work: "", notes: "" };

  if (isEdit) {
    const found = appData.journal.find(e => e.id === Number(entryId));
    if (found) entry = found;
  }

  const formHTML = `
    <div class="form-container" style="padding:10px; color:#fff; font-family:sans-serif;">
      <h3 style="margin-top:0; color:var(--accent);">${isEdit ? "Edit Daily Log Record" : "Create Daily Journal Entry"}</h3>
      <hr style="border:0; border-top:1px solid #334; margin-bottom:15px;">
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:#4dadff;">Study Duration (Hours)</label>
          <input type="number" id="j-hours" step="0.5" min="0" value="${entry.hours}" placeholder="e.g. 6.5" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
        <div>
          <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:#ffb347;">Daily Focus Mood (1-10)</label>
          <input type="number" id="j-mood" min="1" max="10" value="${entry.mood}" placeholder="5" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
        </div>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:#39d98a;">Core Syllabus Work Done</label>
        <input type="text" id="j-work" value="${entry.work}" placeholder="e.g. Completed KTG & Mole Concept Module" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:18px;">
        <label style="display:block; margin-bottom:5px; font-size:0.85rem; color:#6b8cff;">Critical Notes / Self Reflection</label>
        <textarea id="j-notes" placeholder="Formulas to revise, mistakes flagged..." style="width:100%; height:80px; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box; resize:vertical;">${entry.notes}</textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button onclick="hideModal()" style="background:#475569; margin:0;">Cancel</button>
        <button onclick="processJournalSubmit(${isEdit ? entry.id : null})" style="background:var(--accent); margin:0; font-weight:bold;">Save Journal</button>
      </div>
    </div>
  `;
  
  if (typeof showModal === "function") showModal(formHTML);
}

function processJournalSubmit(existingId = null) {
  const hrVal = document.getElementById("j-hours").value || "0";
  const mdVal = document.getElementById("j-mood").value || "5";
  const wkVal = document.getElementById("j-work").value.trim() || "General Self-Study";
  const ntVal = document.getElementById("j-notes").value.trim() || "";

  if (existingId) {
    const log = appData.journal.find(e => e.id === existingId);
    if (log) {
      log.hours = hrVal;
      log.mood = mdVal;
      log.work = wkVal;
      log.notes = ntVal;
    }
  } else {
    appData.journal.push({
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      hours: hrVal,
      mood: mdVal,
      work: wkVal,
      notes: ntVal
    });
    if (typeof updateActivity === "function") updateActivity();
  }

  saveData();
  hideModal();
  renderJournal();
}

function deleteJournalEntry(id) {
  appData.journal = appData.journal.filter(entry => entry.id !== id);
  saveData();
  renderJournal();
}

function editJournalEntry(id) {
  showJournalForm(id);
}

function filterJournal() {
  const q = document.getElementById("journal-search")?.value.toLowerCase() || "";
  return appData.journal.filter(entry => entry.date.toLowerCase().includes(q));
}

function renderJournal() {
  const container = document.getElementById("journal-list");
  if (!container) return;

  const entries = filterJournal();
  entries.sort((a, b) => b.id - a.id);

  let html = "";

  entries.forEach(entry => {
    html += `
      <div class="journal-card">
        <h3 style="color:var(--accent); margin-bottom:6px;">📅 Day Log: ${entry.date}</h3>
        <p style="margin:4px 0;">⏱ Hours: <strong>${entry.hours} hours</strong></p>
        <p style="margin:4px 0;">😊 Mood: <strong>${entry.mood}/10</strong></p>
        <p style="margin:6px 0; font-size:0.95rem; color:#e2e8f0;">📚 Work: ${entry.work}</p>
        ${entry.notes ? `<p style="margin:6px 0; font-size:0.9rem; color:#94a3b8; background:rgba(0,0,0,0.15); padding:8px; border-radius:8px;">📝 Notes: ${entry.notes}</p>` : ""}
        <div class="action-row" style="margin-top:12px;">
          <button onclick="editJournalEntry(${entry.id})" style="background:var(--card2);">Edit</button>
          <button onclick="deleteJournalEntry(${entry.id})" style="background:#b91c1c;">Delete</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html || `<div class="card">No Journal Entries Found</div>`;
}

function getTotalStudyHours() {
  return appData.journal.reduce((sum, entry) => sum + Number(entry.hours || 0), 0);
}

window.showJournalForm = showJournalForm;
window.processJournalSubmit = processJournalSubmit;
window.editJournalEntry = editJournalEntry;
window.deleteJournalEntry = deleteJournalEntry;
window.renderJournal = renderJournal;
