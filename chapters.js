// =========================
// CHAPTERS ENGINE V4
// =========================

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-custom-chapter-btn")?.addEventListener("click", handleCustomChapterSubmit);
  
  document.getElementById("chapter-search")?.addEventListener("input", (e) => {
    renderChaptersList(e.target.value);
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active-filter"));
      btn.classList.add("active-filter");
      renderChaptersList("", btn.dataset.filter);
    });
  });

  renderChaptersList();
});

function showChapterEditModal(chapterName) {
  const ch = appData.chapters[chapterName];
  if (!ch) return;

  const modalHTML = `
    <div style="padding:5px; color:#fff; font-family:sans-serif;">
      <h3 style="margin-top:0; color:var(--accent);">Configure: ${chapterName}</h3>
      <p style="font-size:0.85em; opacity:0.6; margin:-10px 0 15px 0;">Subject: ${ch.subject}</p>
      <hr style="border:0; border-top:1px solid #334; margin-bottom:15px;">

      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:5px; font-size:0.9em;">Preparation Status</label>
        <select id="edit-ch-status" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px;">
          <option value="weak" ${ch.status === 'weak' ? 'selected' : ''}>🔴 Weak (25%)</option>
          <option value="average" ${ch.status === 'average' ? 'selected' : ''}>🟡 Average (50%)</option>
          <option value="strong" ${ch.status === 'strong' ? 'selected' : ''}>🟢 Strong (75%)</option>
          <option value="mastered" ${ch.status === 'mastered' ? 'selected' : ''}>🔵 Mastered (100%)</option>
        </select>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:5px; font-size:0.9em;">PYQs Solved Count</label>
        <input type="number" id="edit-ch-pyq" value="${ch.pyq || 0}" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; margin-bottom:5px; font-size:0.9em;">Priority Flag</label>
        <select id="edit-ch-priority" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px;">
          <option value="low" ${ch.priority === 'low' ? 'selected' : ''}>Low Priority</option>
          <option value="medium" ${ch.priority === 'medium' ? 'selected' : ''}>Medium Priority</option>
          <option value="high" ${ch.priority === 'high' ? 'selected' : ''}>High Priority</option>
        </select>
      </div>

      <div style="margin-bottom:15px; display:flex; flex-direction:column; gap:6px;">
        <label style="font-size:0.9em; margin-bottom:2px;">Revision Checkpoints</label>
        <label style="font-size:0.85em; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="edit-ch-r1" ${ch.revision1 ? 'checked' : ''}> Revision Slot 1
        </label>
        <label style="font-size:0.85em; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="edit-ch-r2" ${ch.revision2 ? 'checked' : ''}> Revision Slot 2
        </label>
        <label style="font-size:0.85em; display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="edit-ch-r3" ${ch.revision3 ? 'checked' : ''}> Revision Slot 3
        </label>
      </div>

      <div style="margin-bottom:15px;">
        <label style="display:block; margin-bottom:5px; font-size:0.9em;">Chapter Revision Notes</label>
        <textarea id="edit-ch-notes" placeholder="Key formulas, conditions, main equations..." style="width:100%; height:60px; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box; resize:vertical;">${ch.notes || ""}</textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px;">
        <button onclick="hideModal()" style="background:#475569; margin:0;">Close</button>
        <button onclick="processChapterSave('${chapterName.replace(/'/g, "\\'")}')" style="background:var(--accent); margin:0; font-weight:bold;">Save Changes</button>
      </div>
    </div>
  `;
  
  if (typeof showModal === "function") showModal(modalHTML);
}

function processChapterSave(chapterName) {
  const ch = appData.chapters[chapterName];
  if (!ch) return;

  ch.status = document.getElementById("edit-ch-status").value;
  ch.pyq = Number(document.getElementById("edit-ch-pyq").value) || 0;
  ch.priority = document.getElementById("edit-ch-priority").value;
  ch.revision1 = document.getElementById("edit-ch-r1").checked;
  ch.revision2 = document.getElementById("edit-ch-r2").checked;
  ch.revision3 = document.getElementById("edit-ch-r3").checked;
  ch.notes = document.getElementById("edit-ch-notes").value.trim();
  ch.lastRevised = new Date().toISOString().split("T")[0];

  saveData();
  if (typeof hideModal === "function") hideModal();
  
  renderChaptersList();
  if (typeof renderStatusCounts === "function") renderStatusCounts();
  if (typeof renderPrepIndex === "function") renderPrepIndex();
  if (typeof renderSubjectProgress === "function") renderSubjectProgress();
  if (typeof renderLowestPYQList === "function") renderLowestPYQList();
}

function handleCustomChapterSubmit() {
  const nameInput = document.getElementById("custom-chapter-name");
  const subjectInput = document.getElementById("custom-chapter-subject");
  if (!nameInput || !subjectInput) return;

  const name = nameInput.value.trim();
  const subject = subjectInput.value;

  if (!name) return;

  appData.chapters[name] = {
    subject: subject,
    status: "weak",
    pyq: 0,
    revision1: false,
    revision2: false,
    revision3: false,
    priority: "medium",
    notes: "",
    lastRevised: null,
    custom: true
  };

  saveData();
  nameInput.value = ""; 
  renderChaptersList();
  if (typeof renderStatusCounts === "function") renderStatusCounts();
}

function renderChaptersList(query = "", filter = "all") {
  const grid = document.getElementById("chapter-grid");
  if (!grid) return;

  let html = "";
  let matchCount = 0;

  Object.entries(appData.chapters).forEach(([name, data]) => {
    if (query && !name.toLowerCase().includes(query.toLowerCase())) return;
    if (filter !== "all" && data.status !== filter) return;

    matchCount++;
    
    let statusBadgeColor = "var(--weak)";
    if (data.status === "average") statusBadgeColor = "var(--average)";
    if (data.status === "strong") statusBadgeColor = "var(--strong)";
    if (data.status === "mastered") statusBadgeColor = "var(--mastered)";

    html += `
      <div class="chapter-card" onclick="showChapterEditModal('${name.replace(/'/g, "\\'")}')" style="cursor:pointer; display:flex; flex-direction:column; justify-content:space-between; border-left: 4px solid ${statusBadgeColor};">
        <div>
          <div class="chapter-title" style="font-size:0.95rem; line-height:1.3; color:#fff;">${name}</div>
          <small style="opacity:0.6; font-size:0.8rem;">${data.subject}</small>
        </div>
        <div style="margin-top:10px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; background:var(--card2); padding:2px 6px; border-radius:6px; color:#38bdf8;">⚡ P: ${data.pyq || 0}</span>
          <span style="font-size:0.7rem; font-weight:bold; color:${statusBadgeColor}; text-transform:uppercase;">${data.status}</span>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html || `<div style="grid-column:1/-1; text-align:center; padding:20px; opacity:0.5;">No Chapters Found</div>`;
  
  const counterEl = document.getElementById("chapter-counts");
  if (counterEl) counterEl.innerText = `(${matchCount})`;
}

window.showChapterEditModal = showChapterEditModal;
window.processChapterSave = processChapterSave;
window.renderChaptersList = renderChaptersList;
