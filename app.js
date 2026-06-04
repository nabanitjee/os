// =========================
// JEE NEXUS CORE V4
// =========================

const STORAGE_KEY = "jee_nexus_master_db"; // 👈 CRITICAL FIXED UNIFIED KEY

// =========================
// STORAGE INITIALIZATION
// =========================


let appData = JSON.parse(
  localStorage.getItem(STORAGE_KEY)
) || {
  jeeMainDate: "2027-01-15",
  jeeAdvancedDate: "",
  chapters: {},
  journal: [],
  mocks: [],
  clat: [],
  futureNotes: [],
  dailyQuest: {
    task1: "", task2: "", task3: "",
    done1: false, done2: false, done3: false
  },
  streak: 0,
  lastActivity: null
};

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// ==========================================================================
// NAVIGATION SYSTEM
// ==========================================================================

function openPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.style.display = "none";
    page.classList.remove("active");
  });

  const target = document.getElementById(pageId);
  if (target) {
    target.style.display = "block";
    target.classList.add("active");
  }

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.classList.remove("active-nav");
  });

  document.querySelector(`[data-page="${pageId}"]`)?.classList.add("active-nav");
}

document.querySelectorAll(".bottom-nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetPage = btn.dataset.page;
    openPage(targetPage);
    sessionStorage.setItem("active_page_v3", targetPage);
  });
});

// ==========================================================================
// COUNTDOWNS & TIMELINES
// ==========================================================================

function getDaysLeft(dateString) {
  if (!dateString) return "--";
  const today = new Date();
  const target = new Date(dateString);
  const diff = target - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function updateCountdowns() {
  const main = document.getElementById("jee-main-countdown");
  const adv = document.getElementById("jee-advanced-countdown");

  if (main) main.textContent = getDaysLeft(appData.jeeMainDate) + "d";
  if (adv) {
    adv.textContent = appData.jeeAdvancedDate
      ? getDaysLeft(appData.jeeAdvancedDate) + "d"
      : "Not Set";
  }
}

const mainDateInput = document.getElementById("jee-main-date");
const advDateInput = document.getElementById("jee-advanced-date");

if (mainDateInput) {
  mainDateInput.value = appData.jeeMainDate;
  mainDateInput.addEventListener("change", e => {
    appData.jeeMainDate = e.target.value;
    saveData();
    updateCountdowns();
  });
}

if (advDateInput) {
  advDateInput.value = appData.jeeAdvancedDate;
  advDateInput.addEventListener("change", e => {
    appData.jeeAdvancedDate = e.target.value;
    saveData();
    updateCountdowns();
  });
}

// ==========================================================================
// PROGRESS LOGIC AGGREGATIONS
// ==========================================================================

function renderDropDay() {
  const el = document.getElementById("drop-day");
  if (!el) return;
  const start = new Date("2026-06-03");
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  el.textContent = diff + 1;
}

function updateActivity() {
  const today = new Date().toISOString().split("T")[0];
  if (appData.lastActivity !== today) {
    appData.lastActivity = today;
    appData.streak++;
    saveData();
  }
}

function renderStreak() {
  const el = document.getElementById("study-streak");
  if (el) el.textContent = appData.streak;
}

function calculatePrepIndex() {
  const chapters = Object.values(appData.chapters);
  if (chapters.length === 0) return 0;

  let total = 0;
  chapters.forEach(ch => {
    let status = 0;
    switch (ch.status) {
      case "weak": status = 25; break;
      case "average": status = 50; break;
      case "strong": status = 75; break;
      case "mastered": status = 100; break;
    }
    const pyq = ch.pyq || 0;
    const revision = ((ch.revision1 ? 1 : 0) + (ch.revision2 ? 1 : 0) + (ch.revision3 ? 1 : 0)) / 3 * 100;
    total += status * 0.4 + pyq * 0.4 + revision * 0.2;
  });

  return Math.round(total / chapters.length);
}

function renderPrepIndex() {
  const percent = calculatePrepIndex();
  const bar = document.getElementById("prep-progress");
  const label = document.getElementById("prep-percent");
  if (bar) bar.style.width = percent + "%";
  if (label) label.textContent = percent + "%";
}

function renderStatusCounts() {
  let weak = 0, average = 0, strong = 0, mastered = 0;

  Object.values(appData.chapters).forEach(ch => {
    switch (ch.status) {
      case "weak": weak++; break; 
      case "average": average++; break;
      case "strong": strong++; break;
      case "mastered": mastered++; break;
    }
  });

  if (document.getElementById("weak-count")) document.getElementById("weak-count").textContent = weak;
  if (document.getElementById("average-count")) document.getElementById("average-count").textContent = average;
  if (document.getElementById("strong-count")) document.getElementById("strong-count").textContent = strong;
  if (document.getElementById("mastered-count")) document.getElementById("mastered-count").textContent = mastered;
}

function renderMissionBoard() {
  const box = document.getElementById("mission-board");
  if (!box) return;

  const weakest = Object.entries(appData.chapters).sort((a, b) => (a[1].pyq || 0) - (b[1].pyq || 0))[0];
  if (!weakest) {
    box.textContent = "No Mission Yet";
    return;
  }
  box.innerHTML = `Target Chapter<br><br><strong>${weakest[0]}</strong><br>PYQs Solved: ${weakest[1].pyq}`;
}

// ==========================================================================
// REVISION BACKLOG WIDGET
// ==========================================================================

function renderBacklogRevision() {
  const container = document.getElementById("backlog-revision-list");
  if (!container) return;

  const items = Object.entries(appData.chapters);
  if (items.length === 0) {
    container.innerHTML = `<div style="text-align:center; opacity:0.5; padding:10px;">Initialising modules...</div>`;
    return;
  }

  const sortedBacklog = items
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => {
      const weight = { high: 3, medium: 2, low: 1 };
      const priorityA = weight[a.priority || "medium"];
      const priorityB = weight[b.priority || "medium"];
      
      if (priorityB !== priorityA) return priorityB - priorityA;
      if (!a.lastRevised) return -1;
      if (!b.lastRevised) return 1;
      return new Date(a.lastRevised) - new Date(b.lastRevised);
    })
    .slice(0, 5);

  let html = "";
  sortedBacklog.forEach(ch => {
    const priorityClass = ch.priority === "high" ? "high-priority" : ch.priority === "low" ? "low-priority" : "";
    const badgeColor = ch.priority === "high" ? "var(--weak)" : ch.priority === "low" ? "var(--mastered)" : "var(--average)";
    const dateLabel = ch.lastRevised ? `Last: ${ch.lastRevised}` : "⚠️ Never Revised";

    html += `
      <div class="backlog-item ${priorityClass}" onclick="if(typeof showChapterEditModal === 'function') showChapterEditModal('${ch.name.replace(/'/g, "\\'")}')" style="cursor:pointer;">
        <div>
          <strong style="color:#fff; font-size:0.95rem;">${ch.name}</strong><br>
          <small style="opacity:0.6;">${ch.subject} • ${dateLabel}</small>
        </div>
        <span style="background:${badgeColor}; color:#081224; font-size:0.72rem; padding:3px 8px; border-radius:6px; font-weight:bold; text-transform:uppercase;">
          ${ch.priority || "medium"}
        </span>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ==========================================================================
// SYSTEM MODAL DISPLAY WINDOW HOOKS
// ==========================================================================

function showModal(htmlContent) {
  const overlay = document.getElementById("modal-overlay");
  const contentBox = document.getElementById("modal-content");
  if (!overlay || !contentBox) return;
  contentBox.innerHTML = htmlContent;
  overlay.style.display = "flex";
}

function hideModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) overlay.style.display = "none";
}

// ==========================================================================
// RUNTIME SETUP PIPELINE BOOTSTRAP
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("nexus-app-title");
  if (titleEl) titleEl.textContent = APP_NAME;

  updateActivity();
  updateCountdowns();
  renderDropDay();
  renderStreak();
  renderPrepIndex();
  renderStatusCounts();
  renderMissionBoard();
  renderBacklogRevision();

  const savedPage = sessionStorage.getItem("active_page_v3") || "dashboard-page";
  openPage(savedPage);
});

setTimeout(() => {
  if (typeof renderSubjectProgress === "function") renderSubjectProgress();
  if (typeof renderLowestPYQList === "function") renderLowestPYQList();
  if (typeof renderMotivationCard === "function") renderMotivationCard();
  if (typeof renderBacklogRevision === "function") renderBacklogRevision();
}, 200);

window.appData = appData;
window.saveData = saveData;
window.updateActivity = updateActivity;
window.renderStatusCounts = renderStatusCounts;
window.renderPrepIndex = renderPrepIndex;
window.renderBacklogRevision = renderBacklogRevision;
window.showModal = showModal;
window.hideModal = hideModal;
