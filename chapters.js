// ==========================================================================
// JEE NEXUS CHAPTER ENGINE & TRACKER MANAGEMENT
// ==========================================================================

let currentFilterType = "status";
let currentFilterValue = "all";

// 1. Calculate and update the dynamic Advanced-only Tracker Card
function updateAdvancedTrackerMetric() {
  const targetText = document.getElementById("advanced-tracker-text");
  if (!targetText) return;

  const chapters = Object.values(window.appData.chapters || {});
  const totalAdvancedUnits = chapters.filter(ch => ch.isAdvancedOnly === true).length;
  const completedAdvancedUnits = chapters.filter(ch => ch.isAdvancedOnly === true && (ch.status === "strong" || ch.status === "mastered")).length;

  if (totalAdvancedUnits === 0) {
    targetText.innerHTML = "No Advanced-only core modules configured inside your active workspace profile.";
    return;
  }

  const calculationPercentage = Math.round((completedAdvancedUnits / totalAdvancedUnits) * 100);
  targetText.innerHTML = `You have completed <strong>${completedAdvancedUnits} out of ${totalAdvancedUnits}</strong> exclusive Advanced-only chapters (<strong>${calculationPercentage}%</strong> complete).`;
}

// 2. Comprehensive Chapter Grid Renderer Block
function renderChapterGrid() {
  const grid = document.getElementById("chapter-grid");
  const countLabel = document.getElementById("chapter-counts");
  if (!grid) return;

  const searchQuery = document.getElementById("chapter-search")?.value.toLowerCase().trim() || "";
  const chaptersMaster = (window.appData && window.appData.chapters) ? window.appData.chapters : {};
  const items = Object.entries(chaptersMaster);
  
  let html = "";
  let renderedCount = 0;

  items.forEach(([name, data]) => {
    if (!data) return;

    // Handle standard Text Search Matches
    if (searchQuery && !name.toLowerCase().includes(searchQuery)) return;

    // Handle Active Menu Filters
    if (currentFilterType === "exam" && currentFilterValue === "advanced-only") {
      if (!data.isAdvancedOnly) return;
    } else if (currentFilterValue !== "all") {
      if (currentFilterType === "priority") {
        if ((data.priority || "medium") !== currentFilterValue) return;
      } else if (currentFilterType === "status") {
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
      <div class="chapter-card" onclick="if(typeof showChapterEditModal === 'function') { showChapterEditModal('${name.replace(/'/g, "\\'")}') }" style="border-left: 5px solid ${statusColor}; position: relative;">
        <div class="chapter-title" style="color:#fff; font-size:0.92rem; padding-right: 18px;">${name}</div>
        ${data.isAdvancedOnly ? `<span style="position: absolute; top: 6px; right: 10px; font-size: 0.8rem;" title="JEE Advanced Topic">🚀</span>` : ""}
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; opacity:0.6; margin-top:8px;">
          <span>${data.subject || 'Physics'}</span>
          <span style="color:${priorityColor}; font-weight:900; text-transform:uppercase; letter-spacing:0.5px;">
            ${data.priority === 'high' ? '🔥' : data.priority === 'low' ? '❄️' : '⚡'} ${data.priority || 'medium'}
          </span>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html || `<div style="grid-column: span 2; text-align:center; opacity:0.4; padding:20px; font-size:0.9rem;">No matching modules found.</div>`;
  if (countLabel) countLabel.textContent = `(${renderedCount})`;
  
  // Keep live tracker card completely synced up
  updateAdvancedTrackerMetric();
}

// 3. Set up click listeners across the filter options menu bar
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".filter-row .filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-row .filter-btn").forEach(b => b.classList.remove("active-filter"));
      btn.classList.add("active-filter");

      currentFilterType = btn.dataset.filterType;
      currentFilterValue = btn.dataset.filter;
      renderChapterGrid();
    });
  });

  // Handle addition form submissions
  const addBtn = document.getElementById("add-custom-chapter-btn");
  if (addBtn) {
    addBtn.onclick = () => {
      const nameInput = document.getElementById("custom-chapter-name");
      const subjectInput = document.getElementById("custom-chapter-subject");
      const advCheckbox = document.getElementById("custom-chapter-adv-only");

      if (!nameInput || !nameInput.value.trim()) {
        alert("Please provide a valid chapter name profile.");
        return;
      }

      const cleanName = nameInput.value.trim();
      if (window.appData.chapters[cleanName]) {
        alert("This chapter entry name already exists inside your active storage.");
        return;
      }

      window.appData.chapters[cleanName] = {
        subject: subjectInput.value,
        status: "weak",
        pyq: 0,
        revision1: false,
        revision2: false,
        revision3: false,
        priority: "medium",
        lastRevised: null,
        isAdvancedOnly: advCheckbox ? advCheckbox.checked : false
      };

      window.saveData();
      nameInput.value = "";
      if (advCheckbox) advCheckbox.checked = false;
      
      renderChapterGrid();
      if (typeof window.renderStatusCounts === "function") window.renderStatusCounts();
      if (typeof window.renderPrepIndex === "function") window.renderPrepIndex();
    };
  }

  // Initial render sequence loop launch point
  renderChapterGrid();
});

// Bind methods onto window target array layers for structural protection
window.renderChapterGrid = renderChapterGrid;
window.updateAdvancedTrackerMetric = updateAdvancedTrackerMetric;
