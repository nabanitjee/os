// ==========================================================================
// JEE NEXUS CENTRAL APPLICATION CORE ENGINE
// ==========================================================================

window.appData = {
  jeeMainDate: "2027-01-01",
  jeeAdvancedDate: "",
  chapters: {},
  journal: [],
  mocks: [],
  clat: [],
  futureNotes: [],
  streak: 0,
  lastActivityDate: "",
  dailyQuest: { task1: "", task2: "", task3: "", done1: false, done2: false, done3: false }, 
  activeMissionsList: [],      
  completedMissionsLog: [],    
  widgetVisibility: {
    mission: true,
    future: true,
    clat: true,
    quest: true
  },
  currentTheme: "theme-blue",
  lastActiveTab: "dashboard-page"
};

// 1. Storage Drivers
function saveData() {
  localStorage.setItem("jee_nexus_master_db", JSON.stringify(window.appData));
}

function loadData() {
  const raw = localStorage.getItem("jee_nexus_master_db");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed) {
        window.appData.jeeMainDate = parsed.jeeMainDate || "2027-01-15";
        window.appData.jeeAdvancedDate = parsed.jeeAdvancedDate || "";
        window.appData.chapters = parsed.chapters || {};
        window.appData.journal = parsed.journal || [];
        window.appData.mocks = parsed.mocks || [];
        window.appData.clat = parsed.clat || [];
        window.appData.futureNotes = parsed.futureNotes || [];
        window.appData.streak = parsed.streak !== undefined ? parsed.streak : 0;
        window.appData.lastActivityDate = parsed.lastActivityDate || "";
        window.appData.dailyQuest = parsed.dailyQuest || { task1: "", task2: "", task3: "", done1: false, done2: false, done3: false }; 
        window.appData.activeMissionsList = parsed.activeMissionsList || []; 
        window.appData.completedMissionsLog = parsed.completedMissionsLog || []; 
        window.appData.currentTheme = parsed.currentTheme || "theme-blue";
        window.appData.lastActiveTab = parsed.lastActiveTab || "dashboard-page";

        if (parsed.widgetVisibility) {
          window.appData.widgetVisibility.mission = parsed.widgetVisibility.mission !== false;
          window.appData.widgetVisibility.future = parsed.widgetVisibility.future !== false;
          window.appData.widgetVisibility.clat = parsed.widgetVisibility.clat !== false;
          window.appData.widgetVisibility.quest = parsed.widgetVisibility.quest !== false;
        }
      }
    } catch (e) {
      console.error("Database reading trace crash", e);
    }
  }
}

// 2. Countdown Matrix Calculations Engine
function updateCountdowns() {
  const mainLabel = document.getElementById("jee-main-countdown");
  const advLabel = document.getElementById("jee-advanced-countdown");
  const today = new Date().getTime();

  if (mainLabel && window.appData.jeeMainDate) {
    const targetMain = new Date(window.appData.jeeMainDate).getTime();
    const diffMain = targetMain - today;
    mainLabel.textContent = diffMain > 0 ? Math.ceil(diffMain / (1000 * 60 * 60 * 24)) + " Days" : "Released";
  }

  if (advLabel && window.appData.jeeAdvancedDate) {
    const targetAdv = new Date(window.appData.jeeAdvancedDate).getTime();
    const diffAdv = targetAdv - today;
    advLabel.textContent = diffAdv > 0 ? Math.ceil(diffAdv / (1000 * 60 * 60 * 24)) + " Days" : "Passed/TBD";
  }
}

// 3. Drop Day Counter Logic
function renderDropDay() {
  const el = document.getElementById("drop-day");
  if (!el) return;
  const start = new Date("2026-06-05"); 
  const today = new Date();
  const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  el.textContent = diff >= 0 ? diff + 1 : 0;
}

// 4. Core System Global Metrics Calculation Engines
function renderStatusCounts() {
  const elements = {
    weak: document.getElementById("weak-count"),
    average: document.getElementById("average-count"),
    strong: document.getElementById("strong-count"),
    mastered: document.getElementById("mastered-count")
  };

  const counts = { weak: 0, average: 0, strong: 0, mastered: 0 };
  Object.values(window.appData.chapters || {}).forEach(ch => {
    if (ch && counts[ch.status] !== undefined) counts[ch.status]++;
  });

  Object.keys(elements).forEach(key => {
    if (elements[key]) elements[key].textContent = counts[key];
  });
}

function renderPrepIndex() {
  const bar = document.getElementById("prep-progress");
  const text = document.getElementById("prep-percent");
  if (!bar || !text) return;

  const chapters = Object.values(window.appData.chapters || {});
  if (chapters.length === 0) return;

  let totalScore = 0;
  chapters.forEach(ch => {
    if (ch.status === "weak") totalScore += 25;
    if (ch.status === "average") totalScore += 50;
    if (ch.status === "strong") totalScore += 75;
    if (ch.status === "mastered") totalScore += 100;
  });

  const percent = Math.round(totalScore / chapters.length);
  bar.style.width = percent + "%";
  text.textContent = percent + "%";
}

// 🔥 AUTOMATED SELF-REPAIRING PYQ TRACKER (POSITIONED EXACTLY UNDER THE HERO HEADER)
function renderTotalPYQsAndMilestones() {
  const heroSection = document.querySelector(".hero");
  if (!heroSection) return;

  // 1. Double-key database scan matching ch.pyq strictly
  let totalPYQs = 0;
  Object.values(window.appData.chapters || {}).forEach(ch => {
    if (ch) {
      const rawVal = ch.pyq !== undefined ? ch.pyq : ch.pyqs;
      if (rawVal !== undefined && rawVal !== null) {
        const parsedCount = parseInt(rawVal, 10);
        if (!isNaN(parsedCount)) totalPYQs += parsedCount;
      }
    }
  });

  // 2. Compute milestone increments (50, 100, 150...)
  const targetStep = 50;
  const currentLevel = Math.floor(totalPYQs / targetStep);
  const nextMilestoneTarget = (currentLevel + 1) * targetStep;
  const progressToNext = totalPYQs % targetStep;
  const percentageToNext = Math.min(100, Math.round((progressToNext / targetStep) * 100));

  // 3. Find container or safely append exactly below the hero section
  let pyqWidget = document.getElementById("nexus-pyq-achievement-widget");
  if (!pyqWidget) {
    pyqWidget = document.createElement("div");
    pyqWidget.id = "nexus-pyq-achievement-widget";
    pyqWidget.className = "card";
    pyqWidget.style.margin = "14px 16px"; 
    pyqWidget.style.padding = "16px";
    pyqWidget.style.borderRadius = "14px";
    pyqWidget.style.background = "var(--card1, #101c3d)";
    pyqWidget.style.textAlign = "left";
    
    heroSection.parentNode.insertBefore(pyqWidget, heroSection.nextSibling);
  }

  // 4. Render Layout
  let badgesHTML = "";
  if (currentLevel > 0) {
    badgesHTML = `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">`;
    for (let i = 1; i <= currentLevel; i++) {
      badgesHTML += `
        <span style="background: linear-gradient(135deg, #ffd700, #ffa500); color: #000; font-size: 0.72rem; font-weight: 900; padding: 4px 8px; border-radius: 6px; box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3); display: inline-flex; align-items: center; gap: 3px;">
          🏆 CRUSHED ${i * targetStep} PYQs
        </span>`;
    }
    badgesHTML += `</div>`;
  } else {
    badgesHTML = `
      <div style="font-size:0.75rem; opacity:0.5; font-style:italic; margin-top:8px; color:#fff;">
        Solve ${targetStep} PYQs to unlock your first major achievement badge!
      </div>`;
  }

  pyqWidget.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h3 style="margin:0; font-size:1.1rem; color:#fff; font-weight:bold; display:flex; align-items:center; gap:8px;">
          📊 Total PYQs Crushed
        </h3>
        <p style="margin:2px 0 0 0; font-size:1.8rem; font-weight:900; color:var(--accent, #a855f7);">${totalPYQs}</p>
      </div>
      <div style="text-align:right; min-width:40%;">
        <span style="font-size:0.8rem; font-weight:bold; color: #fff; opacity:0.8;">Next Goal: ${nextMilestoneTarget}</span>
        <div style="width:100%; height:8px; background:rgba(255,255,255,0.08); border-radius:10px; margin-top:6px; overflow:hidden;">
          <div style="width:${percentageToNext}%; height:100%; background:linear-gradient(90deg, var(--accent, #a855f7), #10b981); border-radius:10px; transition: width 0.4s ease;"></div>
        </div>
        <span style="font-size:0.7rem; opacity:0.5; display:block; margin-top:2px; color:#fff;">${progressToNext}/${targetStep} items cleared</span>
      </div>
    </div>
    <hr style="border:0; border-top:1px solid rgba(255,255,255,0.06); margin:12px 0 8px 0;">
    <div style="font-size:0.82rem; font-weight:bold; opacity:0.9; color:var(--accent, #a855f7);">UNLOCK LOGICAL ACHIEVEMENTS</div>
    ${badgesHTML}
  `;
}

// STREAK SUBSYSTEM ENGINE (UI PIPELINE MOUNTED)
function renderStreak() {
  const el = document.getElementById("study-streak");
  if (!el) return;
  el.textContent = window.appData.streak !== undefined ? window.appData.streak : 0;
}

function updateActivity() {
  if (!window.appData) return;

  const todayStr = new Date().toISOString().split("T")[0];
  if (window.appData.streak === undefined) window.appData.streak = 0;

  if (window.appData.lastActivityDate === todayStr) {
    renderStreak();
    return;
  }

  if (window.appData.lastActivityDate) {
    const lastDate = new Date(window.appData.lastActivityDate);
    const todayDate = new Date(todayStr);

    lastDate.setHours(0,0,0,0);
    todayDate.setHours(0,0,0,0);

    const diffTime = Math.abs(todayDate - lastDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      window.appData.streak++; 
    } else if (diffDays > 1) {
      window.appData.streak = 1; 
    }
  } else {
    window.appData.streak = 1; 
  }

  window.appData.lastActivityDate = todayStr;
  saveData();
  renderStreak();
  window.renderTotalPYQsAndMilestones(); 
}

// 5. Dynamic Controller Visibility Toggles
function toggleWidgetVisibility(widgetKey, isVisible) {
  if (window.appData.widgetVisibility[widgetKey] !== undefined) {
    window.appData.widgetVisibility[widgetKey] = isVisible;
    saveData();
    applyWidgetVisibilityLayouts();
  }
}

function applyWidgetVisibilityLayouts() {
  const targets = {
    mission: document.getElementById("widget-mission-container"),
    future: document.getElementById("widget-future-container"),
    clat: document.getElementById("widget-clat-container"),
    quest: document.getElementById("widget-quest-container")
  };

  Object.entries(targets).forEach(([key, element]) => {
    const show = window.appData.widgetVisibility[key] !== false;
    if (element) element.style.display = show ? "block" : "none";
    const checkbox = document.getElementById(`toggle-widget-${key}`);
    if (checkbox) checkbox.checked = show;
  });
}

// 6. Theme Engine Accent Switcher
function switchNexusTheme(themeClassName) {
  document.body.className = themeClassName;
  window.appData.currentTheme = themeClassName;
  saveData();

  document.querySelectorAll(".theme-orb").forEach(orb => orb.classList.remove("active-orb"));
  const activeOrb = document.querySelector(`.orb-${themeClassName.replace("theme-", "")}`);
  if (activeOrb) activeOrb.classList.add("active-orb");
}

// Tab Swapping Controller Function
function switchNavigationTab(targetPageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.style.display = "none";
    page.classList.remove("active");
  });

  const targetPageElement = document.getElementById(targetPageId);
  if (targetPageElement) {
    targetPageElement.style.display = "block";
    targetPageElement.classList.add("active");
  }

  const navigationButtons = document.querySelectorAll(".bottom-nav button");
  navigationButtons.forEach(btn => {
    btn.classList.remove("active-nav");
    if (btn.getAttribute("data-page") === targetPageId) {
      btn.classList.add("active-nav");
    }
  });

  window.appData.lastActiveTab = targetPageId;
  saveData();

  try {
    if (targetPageId === "chapters-page" && typeof window.renderChapterGrid === "function") window.renderChapterGrid();
    if (targetPageId === "revision-directory-page" && typeof window.renderMasterDirectory === "function") window.renderMasterDirectory();
    if (targetPageId === "journal-page" && typeof window.renderJournal === "function") window.renderJournal();
    if (targetPageId === "mock-page" && typeof window.renderMocks === "function") window.renderMocks();
    if (targetPageId === "clat-page" && typeof window.renderClat === "function") window.renderClat();
    if (targetPageId === "future-page" && typeof window.renderFutureNotes === "function") window.renderFutureNotes();
  } catch(e) { console.error("Tab Render Exception: ", e); }
}

function fullyTriggerUIRefresh() {
  try { if (typeof window.renderChapterGrid === "function") window.renderChapterGrid(); } catch(e){}
  try { if (typeof window.renderStatusCounts === "function") window.renderStatusCounts(); } catch(e){}
  try { if (typeof window.renderPrepIndex === "function") window.renderPrepIndex(); } catch(e){}
  try { if (typeof window.renderSubjectProgress === "function") window.renderSubjectProgress(); } catch(e){}
  try { if (typeof window.renderLowestPYQList === "function") window.renderLowestPYQList(); } catch(e){}
  try { if (typeof window.renderMasterDirectory === "function") window.renderMasterDirectory(); } catch(e){}
  try { if (typeof window.renderBacklogRevision === "function") window.renderBacklogRevision(); } catch(e){}
  try { if (typeof window.renderSyllabusDistributionBalance === "function") window.renderSyllabusDistributionBalance(); } catch(e){}
  try { if (typeof window.renderMissionBoard === "function") window.renderMissionBoard(); } catch(e){} 
  try { if (typeof window.renderQuest === "function") window.renderQuest(); } catch(e){} 
  try { if (typeof window.renderSettingsMissionHistory === "function") window.renderSettingsMissionHistory(); } catch(e){} 
  try { renderStreak(); } catch(e){}
  try { window.renderTotalPYQsAndMilestones(); } catch(e){} 
}

// Initialization Entry Points 
document.addEventListener("DOMContentLoaded", () => {
  loadData();

  const mainInp = document.getElementById("jee-main-date");
  const advInp = document.getElementById("jee-advanced-date");
  if (mainInp) mainInp.value = window.appData.jeeMainDate || "";
  if (advInp) advInp.value = window.appData.jeeAdvancedDate || "";

  document.body.className = window.appData.currentTheme || "theme-blue";
  switchNexusTheme(window.appData.currentTheme || "theme-blue");

  renderDropDay();
  updateCountdowns();
  renderStatusCounts();
  renderPrepIndex();
  renderStreak();
  
  // 🔥 CHRONO-METRIC DELAY: Wait 300ms for syllabus.js database parameters to populate safely before counting
  setTimeout(() => {
    try { window.renderTotalPYQsAndMilestones(); } catch(e){}
  }, 300);

  if (typeof window.renderMissionBoard === "function") window.renderMissionBoard(); 
  if (typeof window.renderQuest === "function") window.renderQuest(); 
  if (typeof window.renderSettingsMissionHistory === "function") window.renderSettingsMissionHistory(); 
  applyWidgetVisibilityLayouts();

  switchNavigationTab(window.appData.lastActiveTab || "dashboard-page");

  setTimeout(fullyTriggerUIRefresh, 150);
  setInterval(updateCountdowns, 60000);

  document.querySelectorAll(".bottom-nav button").forEach(button => {
    button.addEventListener("click", () => {
      const targetPageId = button.getAttribute("data-page");
      if (targetPageId) switchNavigationTab(targetPageId);
    });
  });
});

window.saveData = saveData;
window.toggleWidgetVisibility = toggleWidgetVisibility;
window.applyWidgetVisibilityLayouts = applyWidgetVisibilityLayouts;
window.switchNexusTheme = switchNexusTheme;
window.updateCountdowns = updateCountdowns;
window.renderStatusCounts = renderStatusCounts;
window.renderPrepIndex = renderPrepIndex;
window.fullyTriggerUIRefresh = fullyTriggerUIRefresh;
window.switchNavigationTab = switchNavigationTab;
window.renderStreak = renderStreak;
window.updateActivity = updateActivity;
window.renderTotalPYQsAndMilestones = renderTotalPYQsAndMilestones;
