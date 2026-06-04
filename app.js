// ==========================================================================
// JEE NEXUS CORE ENGINE V4 (ANALYTICS, CRASH-PROOF & TOTAL CONTROL CENTER)
// ==========================================================================

const STORAGE_KEY = "jee_nexus_master_db";
const APP_NAME = "JEE Nexus";

// ==========================================================================
// STORAGE INITIALIZATION
// ==========================================================================

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
  lastActivity: null,
  activeThemeSkin: "theme-blue",
  widgetVisibilityStates: { future: true, clat: true, quest: true }
};

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// ==========================================================================
// NAVIGATION PLATFORM SYSTEM
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

  // Re-trigger updates safely when entering screens
  if (pageId === "revision-directory-page") {
    safeRun(renderFullMasterDirectory, "renderFullMasterDirectory");
  }
  if (pageId === "settings-page") {
    safeRun(calculateSettingsSyllabusDistribution, "calculateSettingsSyllabusDistribution");
  }
}

document.querySelectorAll(".bottom-nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetPage = btn.dataset.page;
    openPage(targetPage);
    sessionStorage.setItem("active_page_v3", targetPage);
  });
});

// ==========================================================================
// TIMELINE CALCULATORS
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

// ==========================================================================
// PROGRESS LOGIC GRIDS & COUNTS
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
    if ((ch.status === "strong" || ch.status === "mastered") && (ch.pyq || 0) < 15) {
      ch.status = "average"; 
    }

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
// BACKGROUND AUTOMATED PERFORMANCE RED FLAGS
// ==========================================================================

function evaluatePerformanceRedFlags() {
  const container = document.getElementById("red-flag-alert-zone");
  if (!container) return;
  container.innerHTML = "";

  if (!appData.mocks || appData.mocks.length < 3) return;

  const targeted = [...appData.mocks].sort((a,b) => a.id - b.id).slice(-3);
  const subjects = ["physics", "chemistry", "maths"];

  let flagHTML = "";

  subjects.forEach(sub => {
    const s1 = targeted[0][sub] || 0;
    const s2 = targeted[1][sub] || 0;
    const s3 = targeted[2][sub] || 0;

    if (s2 < s1 && s3 < s2) {
      flagHTML += `
        <div class="performance-red-flag-card">
          🚨 <strong>SUBJECT RED FLAG ALERT:</strong> Your <strong>${sub.toUpperCase()}</strong> performance sequence has dropped continuously over your last 3 tests (${s1} → ${s2} → ${s3}). Prioritize core syllabus problem solving immediately!
        </div>
      `;
    }
  });

  container.innerHTML = flagHTML;
}

// ==========================================================================
// MISTAKE REPOSITORY CONCENTRATED SUMMARY AGGREGATOR
// ==========================================================================

function compileMistakeRepository() {
  if (!appData.mocks || appData.mocks.length === 0) {
    alert("No mock logs found yet to compile.");
    return;
  }

  let logHtml = `<div style="text-align:left; color:#fff; max-height:350px; overflow-y:auto; padding:5px;">
    <h3 style="color:var(--accent); font-weight:900; margin-top:0;">CONCENTRATED MISTAKE REPOSITORY</h3>
    <p style="font-size:0.8rem; opacity:0.6; margin-bottom:12px;">Review this complete index before entering exam environments.</p><hr style="border-color:rgba(255,255,255,0.08);">`;

  let cleanMatch = false;
  [...appData.mocks].sort((a,b) => b.id - a.id).forEach(mock => {
    if (mock.errorLog && mock.errorLog.trim()) {
      cleanMatch = true;
      logHtml += `
        <div style="margin: 12px 0; padding:10px; background:var(--card2); border-radius:10px;">
          <strong style="color:var(--average); font-size:0.9rem;">🎯 ${mock.examName} (${mock.date})</strong>
          <p style="font-size:0.88rem; margin-top:4px; color:#e2e8f0; line-height:1.4;">${mock.errorLog}</p>
        </div>
      `;
    }
  });

  if (!cleanMatch) logHtml += `<p style="opacity:0.5; padding:15px; text-align:center;">No error tracking notes logged inside your mocks yet.</p>`;
  logHtml += `<button onclick="hideModal()" style="width:100%; margin-top:10px; background:#475569;">Dismiss Window</button></div>`;

  showModal(logHtml);
}

// ==========================================================================
// STRATEGIC REVISION DIRECTORY ENGINE (BALANCED DATE DECAY SORT)
// ==========================================================================

function getTimelineLabelAndColor(lastRevisedString) {
  if (!lastRevisedString) {
    return { text: "Never Revised", color: "var(--critical-red)" };
  }

  const elapsedDays = Math.floor((new Date() - new Date(lastRevisedString)) / (1000 * 60 * 60 * 24));

  if (elapsedDays <= 7) return { text: `${elapsedDays}d ago (Safe)`, color: "var(--safe-green)" };
  if (elapsedDays <= 21) return { text: `${elapsedDays}d ago (Review)`, color: "var(--warning-orange)" };
  return { text: `${elapsedDays}d ago (Critical)`, color: "var(--critical-red)" };
}

function renderBacklogRevision() {
  const container = document.getElementById("backlog-revision-list");
  if (!container) return;

  const items = Object.entries(appData.chapters);
  if (items.length === 0) {
    container.innerHTML = `<div style="text-align:center; opacity:0.5; padding:10px;">Initialising metrics...</div>`;
    return;
  }

  const sortedBacklog = items
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => {
      if (!a.lastRevised && b.lastRevised) return -1;
      if (a.lastRevised && !b.lastRevised) return 1;
      
      if (!a.lastRevised && !b.lastRevised) {
        const weight = { high: 3, medium: 2, low: 1 };
        return weight[b.priority || "medium"] - weight[a.priority || "medium"];
      }
      
      return new Date(a.lastRevised) - new Date(b.lastRevised);
    })
    .slice(0, 5);

  let html = "";
  sortedBacklog.forEach(ch => {
    const priorityClass = ch.priority === "high" ? "high-priority" : ch.priority === "low" ? "low-priority" : "";
    const badgeColor = ch.priority === "high" ? "var(--weak)" : ch.priority === "low" ? "var(--mastered)" : "var(--average)";
    const timeline = getTimelineLabelAndColor(ch.lastRevised);

    html += `
      <div class="backlog-item ${priorityClass}" onclick="if(typeof showChapterEditModal === 'function') showChapterEditModal('${ch.name.replace(/'/g, "\\'")}')" style="cursor:pointer;">
        <div>
          <strong style="color:#fff; font-size:0.95rem;">${ch.name}</strong><br>
          <small style="opacity:0.6;">${ch.subject} • <span style="color:${timeline.color}; font-weight:bold;">${timeline.text}</span></small>
        </div>
        <span style="background:${badgeColor}; color:#081224; font-size:0.72rem; padding:3px 8px; border-radius:6px; font-weight:bold; text-transform:uppercase;">
          ${ch.priority || "medium"}
        </span>
      </div>
    `;
  });
  container.innerHTML = html;
}

function renderFullMasterDirectory() {
  const scrollContainer = document.getElementById("master-directory-scroll-list");
  const statsBox = document.getElementById("directory-recency-stats");
  if (!scrollContainer) return;

  const items = Object.entries(appData.chapters);
  if (items.length === 0) {
    scrollContainer.innerHTML = `<div style="text-align:center; padding:30px; opacity:0.5;">No system syllabus data populated.</div>`;
    return;
  }

  const fullDirectorySorted = items
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => {
      if (!a.lastRevised && b.lastRevised) return -1;
      if (a.lastRevised && !b.lastRevised) return 1;
      
      if (!a.lastRevised && !b.lastRevised) {
        const weight = { high: 3, medium: 2, low: 1 };
        return weight[b.priority || "medium"] - weight[a.priority || "medium"];
      }
      
      return new Date(a.lastRevised) - new Date(b.lastRevised);
    });

  let totalDecayedCount = 0;
  let html = "";

  fullDirectorySorted.forEach(ch => {
    const timeline = getTimelineLabelAndColor(ch.lastRevised);
    if (!ch.lastRevised || Math.floor((new Date() - new Date(ch.lastRevised)) / (1000 * 60 * 60 * 24)) > 21) {
      totalDecayedCount++;
    }

    let statusColor = "var(--weak)";
    if (ch.status === "average") statusColor = "var(--average)";
    if (ch.status === "strong") statusColor = "var(--strong)";
    if (ch.status === "mastered") statusColor = "var(--mastered)";

    const priorityBadgeColor = ch.priority === "high" ? "var(--weak)" : ch.priority === "low" ? "var(--mastered)" : "var(--average)";

    html += `
      <div class="directory-row-item" onclick="if(typeof showChapterEditModal === 'function') showChapterEditModal('${ch.name.replace(/'/g, "\\'")}')" style="cursor:pointer; border-left:4px solid ${statusColor};">
        <div style="max-width:60%;">
          <h4 style="margin:0; color:#fff; font-size:0.95rem; line-height:1.3;">${ch.name}</h4>
          <span style="font-size:0.75rem; opacity:0.5;">${ch.subject}</span>
        </div>
        <div class="directory-meta-side">
          <span class="timeline-deadline-tag" style="background:${timeline.color}; color:#081224;">${timeline.text}</span>
          <span style="font-size:0.7rem; color:${priorityBadgeColor}; font-weight:bold; text-transform:uppercase; letter-spacing:0.5px;">🔥 ${ch.priority || "medium"}</span>
        </div>
      </div>
    `;
  });

  scrollContainer.innerHTML = html;

  if (statsBox) {
    statsBox.innerHTML = `
      🚨 Total Critical/Decayed Chapters: <strong style="color:var(--weak); font-size:1rem;">${totalDecayedCount}</strong> / ${items.length}<br>
      <span style="font-size:0.8rem; opacity:0.7;">Chapters labeled "Critical" have elapsed past a strict 21-day retention window.</span>
    `;
  }
}

// ==========================================================================
// POPUP WINDOW SYSTEM OVERLAYS
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
// PREMIUM CONTROL CENTER UTILITIES & SKIN THEME ENGINE
// ==========================================================================

function switchNexusTheme(themeClass) {
  document.body.classList.remove('theme-blue', 'theme-green', 'theme-violet', 'theme-crimson');
  
  if (themeClass !== 'theme-blue') {
    document.body.classList.add(themeClass);
  }
  
  appData.activeThemeSkin = themeClass;
  saveData();
  
  document.querySelectorAll('.theme-orb').forEach(orb => {
    orb.classList.remove('active-orb');
  });
  
  if (themeClass === 'theme-blue') document.querySelector('.orb-blue')?.classList.add('active-orb');
  if (themeClass === 'theme-green') document.querySelector('.orb-green')?.classList.add('active-orb');
  if (themeClass === 'theme-violet') document.querySelector('.orb-violet')?.classList.add('active-orb');
  if (themeClass === 'theme-crimson') document.querySelector('.orb-crimson')?.classList.add('active-orb');
}

function toggleWidgetVisibility(widgetKey, isVisible) {
  if (!appData.widgetVisibilityStates) {
    appData.widgetVisibilityStates = { future: true, clat: true, quest: true };
  }
  
  appData.widgetVisibilityStates[widgetKey] = isVisible;
  saveData();
  
  let targetNode = null;
  if (widgetKey === 'future') targetNode = document.getElementById('motivation-card')?.closest('.card');
  if (widgetKey === 'clat') targetNode = document.getElementById('clat-week-hours')?.closest('.card');
  if (widgetKey === 'quest') targetNode = document.getElementById('quest-list')?.closest('.card');
  
  if (targetNode) {
    if (isVisible) targetNode.classList.remove('widget-hidden');
    else targetNode.classList.add('widget-hidden');
  }
}

function calculateSettingsSyllabusDistribution() {
  const container = document.getElementById('settings-distribution-analyzer');
  if (!container) return;
  
  const chapters = Object.values(appData.chapters || {});
  if (chapters.length === 0) {
    container.innerHTML = `<p style="opacity:0.5; text-align:center; margin:0;">Populate custom chapters inside your syllabus grids to review distribution metrics.</p>`;
    return;
  }
  
  let subjects = { Physics: { high: 0, med: 0, low: 0 }, Chemistry: { high: 0, med: 0, low: 0 }, Mathematics: { high: 0, med: 0, low: 0 } };
  
  chapters.forEach(ch => {
    const sub = ch.subject;
    const prio = ch.priority || 'medium';
    if (subjects[sub]) {
      if (prio === 'high') subjects[sub].high++;
      if (prio === 'medium') subjects[sub].med++;
      if (prio === 'low') subjects[sub].low++;
    }
  });
  
  container.innerHTML = `
    <div style="margin-bottom:8px;">⚛️ <strong>Physics:</strong> <span style="color:var(--weak);">${subjects.Physics.high} High</span> • <span style="color:var(--average);">${subjects.Physics.med} Med</span> • <span style="color:var(--mastered);">${subjects.Physics.low} Low</span></div>
    <div style="margin-bottom:8px;">🧪 <strong>Chemistry:</strong> <span style="color:var(--weak);">${subjects.Chemistry.high} High</span> • <span style="color:var(--average);">${subjects.Chemistry.med} Med</span> • <span style="color:var(--mastered);">${subjects.Chemistry.low} Low</span></div>
    <div>🧮 <strong>Mathematics:</strong> <span style="color:var(--weak);">${subjects.Mathematics.high} High</span> • <span style="color:var(--average);">${subjects.Mathematics.med} Med</span> • <span style="color:var(--mastered);">${subjects.Mathematics.low} Low</span></div>
  `;
}

// ==========================================================================
// CRASH-PROOF SYSTEM INITIALIZATION BOOT ENGINE
// ==========================================================================

function safeRun(func, name) {
  try {
    if (typeof func === "function") {
      func();
    } else if (typeof window[name] === "function") {
      window[name]();
    }
  } catch (error) {
    console.warn(`[Safe-Shield Mode Override] Dynamic skip triggered on: ${name}. Context:`, error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("nexus-app-title");
  if (titleEl) titleEl.textContent = APP_NAME;

  // Run timing blocks
  safeRun(updateActivity, "updateActivity");
  safeRun(updateCountdowns, "updateCountdowns");
  safeRun(renderDropDay, "renderDropDay");
  safeRun(renderStreak, "renderStreak");
  
  // Run core data analytics structures
  safeRun(renderPrepIndex, "renderPrepIndex");
  safeRun(renderStatusCounts, "renderStatusCounts");
  safeRun(renderMissionBoard, "renderMissionBoard");
  safeRun(renderBacklogRevision, "renderBacklogRevision");
  safeRun(evaluatePerformanceRedFlags, "evaluatePerformanceRedFlags");

  // Load active theme preference setting configurations
  if (appData.activeThemeSkin) {
    switchNexusTheme(appData.activeThemeSkin);
  }

  // Restore and display visibility checkboxes
  const states = appData.widgetVisibilityStates || { future: true, clat: true, quest: true };
  const chkFuture = document.getElementById('toggle-widget-future');
  const chkClat = document.getElementById('toggle-widget-clat');
  const chkQuest = document.getElementById('toggle-widget-quest');
  
  if (chkFuture) chkFuture.checked = states.future !== false;
  if (chkClat) chkClat.checked = states.clat !== false;
  if (chkQuest) chkQuest.checked = states.quest !== false;
  
  toggleWidgetVisibility('future', states.future !== false);
  toggleWidgetVisibility('clat', states.clat !== false);
  toggleWidgetVisibility('quest', states.quest !== false);

  // Core execution launch sequence
  const savedPage = sessionStorage.getItem("active_page_v3") || "dashboard-page";
  openPage(savedPage);
});

// Secondary sequence to let async child scripts bind smoothly
setTimeout(() => {
  safeRun(window.renderSubjectProgress, "renderSubjectProgress");
  safeRun(window.renderLowestPYQList, "renderLowestPYQList");
  safeRun(window.renderMotivationCard, "renderMotivationCard");
  safeRun(window.renderChapterGrid, "renderChapterGrid");
  safeRun(window.renderJournal, "renderJournal");
  safeRun(window.renderMocks, "renderMocks");
  safeRun(window.renderClat, "renderClat");
  safeRun(window.renderQuestList, "renderQuestList");
}, 250);

// Global Workspace Core Export Hooks
window.appData = appData;
window.saveData = saveData;
window.updateActivity = updateActivity;
window.renderStatusCounts = renderStatusCounts;
window.renderPrepIndex = renderPrepIndex;
window.renderBacklogRevision = renderBacklogRevision;
window.renderFullMasterDirectory = renderFullMasterDirectory;
window.compileMistakeRepository = compileMistakeRepository;
window.showModal = showModal;
window.hideModal = hideModal;
window.safeRun = safeRun;
window.switchNexusTheme = switchNexusTheme;
window.toggleWidgetVisibility = toggleWidgetVisibility;
window.calculateSettingsSyllabusDistribution = calculateSettingsSyllabusDistribution;