// ==========================================================================
// JEE NEXUS SYLLABUS INTERACTIVE GRID MODULE - V4 COMPLETE WITH SECURE DELETE
// ==========================================================================

let currentFilterValue = "all";
let currentFilterType = "status"; // status OR priority

document.addEventListener("DOMContentLoaded", () => {
  initChapterGridSystem();
});

function initChapterGridSystem() {
  const searchInput = document.getElementById("chapter-search");
  const addBtn = document.getElementById("add-custom-chapter-btn");

  if (searchInput) {
    searchInput.addEventListener("input", () => renderChapterGrid());
  }

  if (addBtn) {
    addBtn.onclick = handleAddCustomChapter;
  }

  // ULTRA-SAFE EVENT SELECTION BINDING
  document.querySelectorAll(".filter-row .filter-btn").forEach(btn => {
    btn.onclick = function(e) {
      document.querySelectorAll(".filter-row .filter-btn").forEach(b => b.classList.remove("active-filter"));
      
      e.target.classList.add("active-filter");
      
      currentFilterValue = e.target.getAttribute("data-filter");
      
      let detectedType = e.target.getAttribute("data-filter-type");
      if (!detectedType) {
        if (currentFilterValue === "high" || currentFilterValue === "medium" || currentFilterValue === "low") {
          detectedType = "priority";
        } else {
          detectedType = "status";
        }
      }
      
      currentFilterType = detectedType;
      renderChapterGrid();
    };
  });

  renderChapterGrid();
}

function renderChapterGrid() {
  const grid = document.getElementById("chapter-grid");
  const countLabel = document.getElementById("chapter-counts");
  if (!grid) return;

  const searchQuery = document.getElementById("chapter-search")?.value.toLowerCase().trim() || "";
  const items = Object.entries(window.appData.chapters || {});
  
  let html = "";
  let renderedCount = 0;

  items.forEach(([name, data]) => {
    if (searchQuery && !name.toLowerCase().includes(searchQuery)) return;

    if (currentFilterValue !== "all") {
      if (currentFilterType === "priority") {
        const itemPriority = data.priority || "medium";
        if (itemPriority !== currentFilterValue) return;
      } else {
        if (data.status !== currentFilterValue) return;
      }
    }

    renderedCount++;

    let statusColor = "var(--weak)";
    if (data.status === "average") statusColor = "var(--average)";
    if (data.status === "strong") statusColor = "var(--strong)";
    if (data.status === "mastered") statusColor = "var(--mastered)";

    const priorityColor = data.priority === "high" ? "var(--weak)" : data.priority === "low" ? "var(--mastered)" : "var(--average)";

    html += `
      <div class="chapter-card" onclick="showChapterEditModal('${name.replace(/'/g, "\\'")}')" style="border-left: 5px solid ${statusColor};">
        <div class="chapter-title" style="color:#fff; font-size:0.95rem;">${name}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; opacity:0.6; margin-top:8px;">
          <span>${data.subject}</span>
          <span style="color:${priorityColor}; font-weight:900; text-transform:uppercase; letter-spacing:0.5px;">
            ${data.priority === 'high' ? '🔥' : data.priority === 'low' ? '❄️' : '⚡'} ${data.priority || 'medium'}
          </span>
        </div>
      </div>
    `;
  });

  if (items.length === 0) {
    grid.innerHTML = `<div style="grid-column: span 2; text-align:center; opacity:0.4; padding:20px; font-size:0.9rem;">No entries found. Add a custom chapter above to start.</div>`;
    if (countLabel) countLabel.textContent = "(0)";
    return;
  }

  grid.innerHTML = html || `<div style="grid-column: span 2; text-align:center; opacity:0.4; padding:20px; font-size:0.9rem;">No items match this active filter option.</div>`;
  if (countLabel) countLabel.textContent = `(${renderedCount})`;
}

function handleAddCustomChapter() {
  const nameInput = document.getElementById("custom-chapter-name");
  const subjectSelect = document.getElementById("custom-chapter-subject");
  
  if (!nameInput || !nameInput.value.trim()) {
    alert("Please enter a valid chapter name first.");
    return;
  }

  const name = nameInput.value.trim();
  const subject = subjectSelect.value;

  if (window.appData.chapters[name]) {
    alert("A chapter entry with this exact name already exists.");
    return;
  }

  window.appData.chapters[name] = {
    subject: subject,
    status: "weak",
    priority: "medium",
    pyq: 0,
    revision1: false,
    revision2: false,
    revision3: false,
    lastRevised: null
  };

  if (typeof window.saveData === "function") window.saveData();
  if (typeof window.renderStatusCounts === "function") window.renderStatusCounts();
  if (typeof window.renderPrepIndex === "function") window.renderPrepIndex();

  nameInput.value = "";
  renderChapterGrid();
}

function showChapterEditModal(chName) {
  const ch = window.appData.chapters[chName];
  if (!ch) return;

  const modalHTML = `
    <div style="text-align:left; color:#fff;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
        <h3 style="margin-top:0; color:var(--accent); font-weight:900; line-height:1.2; max-width:80%;">${chName}</h3>
        <!-- Premium Custom Bin Button -->
        <button onclick="confirmChapterDelete('${chName.replace(/'/g, "\\'")}')" style="background:#ef4444; margin:0; padding:6px 10px; font-size:0.9rem; border-radius:8px; box-shadow:none;">🗑️</button>
      </div>
      <p style="font-size:0.8rem; opacity:0.5; margin-bottom:15px;">Submodule tracking panel configuration</p>
      
      <label style="font-size:0.85rem; font-weight:bold; color:#94a3b8;">PREPARATION STATUS</label>
      <select id="edit-ch-status" style="margin-bottom:12px;">
        <option value="weak" ${ch.status === 'weak' ? 'selected' : ''}>Weak (Needs Core Fix)</option>
        <option value="average" ${ch.status === 'average' ? 'selected' : ''}>Average (Formula Ready)</option>
        <option value="strong" ${ch.status === 'strong' ? 'selected' : ''}>Strong (PYQ Confident)</option>
        <option value="mastered" ${ch.status === 'mastered' ? 'selected' : ''}>Mastered (Exam Ready)</option>
      </select>

      <label style="font-size:0.85rem; font-weight:bold; color:#94a3b8;">EXAM WEIGHTAGE PRIORITY</label>
      <select id="edit-ch-priority" style="margin-bottom:12px;">
        <option value="high" ${ch.priority === 'high' ? 'selected' : ''}>High Priority (High-Yield Tracker)</option>
        <option value="medium" ${(ch.priority || 'medium') === 'medium' ? 'selected' : ''}>Medium Priority (Balanced Run)</option>
        <option value="low" ${ch.priority === 'low' ? 'selected' : ''}>Low Priority (Low Weightage)</option>
      </select>

      <label style="font-size:0.85rem; font-weight:bold; color:#94a3b8;">PYQs SOLVED COUNT</label>
      <input type="number" id="edit-ch-pyq" value="${ch.pyq || 0}" min="0" style="margin-bottom:15px;">

      <div style="background:var(--card2); padding:12px; border-radius:12px; margin-bottom:15px;">
        <div class="checkbox-row">
          <input type="checkbox" id="edit-ch-r1" ${ch.revision1 ? 'checked' : ''}>
          <span>Revision Stage 1 (Short Notes Complete)</span>
        </div>
        <div class="checkbox-row" style="margin-top:10px;">
          <input type="checkbox" id="edit-ch-r2" ${ch.revision2 ? 'checked' : ''}>
          <span>Revision Stage 2 (Timed Drilling Done)</span>
        </div>
        <div class="checkbox-row" style="margin-top:10px;">
          <input type="checkbox" id="edit-ch-r3" ${ch.revision3 ? 'checked' : ''}>
          <span>Revision Stage 3 (Crucial PYQ Review)</span>
        </div>
      </div>

      <div class="action-row">
        <button onclick="hideModal()" style="background:#475569; margin:0;">Dismiss</button>
        <button onclick="saveChapterEdits('${chName.replace(/'/g, "\\'")}')" style="background:var(--accent); font-weight:bold; margin:0;">Update Parameters</button>
      </div>
    </div>
  `;

  if (typeof window.showModal === "function") window.showModal(modalHTML);
}

function saveChapterEdits(chName) {
  const ch = window.appData.chapters[chName];
  if (!ch) return;

  const newStatus = document.getElementById("edit-ch-status").value;
  const newPriority = document.getElementById("edit-ch-priority").value;
  const newPyq = parseInt(document.getElementById("edit-ch-pyq").value) || 0;
  
  const r1 = document.getElementById("edit-ch-r1").checked;
  const r2 = document.getElementById("edit-ch-r2").checked;
  const r3 = document.getElementById("edit-ch-r3").checked;

  if (r1 !== ch.revision1 || r2 !== ch.revision2 || r3 !== ch.revision3 || newStatus !== ch.status) {
    ch.lastRevised = new Date().toISOString().split("T")[0];
  }

  ch.status = newStatus;
  ch.priority = newPriority;
  ch.pyq = newPyq;
  ch.revision1 = r1;
  ch.revision2 = r2;
  ch.revision3 = r3;

  finalizeSyllabusUpdates();
  if (typeof window.hideModal === "function") window.hideModal();
  renderChapterGrid();
}

// ==========================================================================
// SECURE IN-BUILD TWO-STEP DELETE CONFIRMATION INTERFACE
// ==========================================================================

function confirmChapterDelete(chName) {
  const modalHTML = `
    <div style="text-align:center; color:#fff; padding: 10px 5px;">
      <span style="font-size:3rem;">⚠️</span>
      <h3 style="margin:10px 0 6px 0; color:#ff5b5b; font-weight:900;">Delete Chapter?</h3>
      <p style="font-size:0.9rem; opacity:0.8; line-height:1.4; margin-bottom:20px;">
        Are you sure you want to completely erase <strong style="color:var(--accent);">${chName}</strong>?<br>
        This will wipe out all logged PYQ counts and revision data permanently.
      </p>
      
      <div class="action-row" style="gap:12px;">
        <button onclick="showChapterEditModal('${chName.replace(/'/g, "\\'")}')" style="background:#475569; margin:0;">No, Go Back</button>
        <button onclick="executeChapterDelete('${chName.replace(/'/g, "\\'")}')" style="background:#ef4444; font-weight:bold; margin:0; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);">Yes, Delete</button>
      </div>
    </div>
  `;
  
  if (typeof window.showModal === "function") window.showModal(modalHTML);
}

function executeChapterDelete(chName) {
  if (window.appData.chapters[chName]) {
    delete window.appData.chapters[chName]; // Drops record from primary database array
    
    finalizeSyllabusUpdates();
    if (typeof window.hideModal === "function") window.hideModal();
    renderChapterGrid();
  }
}

function finalizeSyllabusUpdates() {
  if (typeof window.saveData === "function") window.saveData();
  if (typeof window.renderStatusCounts === "function") window.renderStatusCounts === "function" && window.renderStatusCounts();
  if (typeof window.renderPrepIndex === "function") window.renderPrepIndex();
  if (typeof window.renderBacklogRevision === "function") window.renderBacklogRevision();
  if (typeof window.renderFullMasterDirectory === "function") window.renderFullMasterDirectory();
}

// Global Scope Window Exports
window.initChapterGridSystem = initChapterGridSystem;
window.renderChapterGrid = renderChapterGrid;
window.showChapterEditModal = showChapterEditModal;
window.saveChapterEdits = saveChapterEdits;
window.confirmChapterDelete = confirmChapterDelete;
window.executeChapterDelete = executeChapterDelete;
