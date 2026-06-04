// ==========================================================================
// JEE NEXUS CENTRAL APPLICATION CORE ENGINE
// ==========================================================================

window.appData = {
  jeeMainDate: "2027-01-15",
  jeeAdvancedDate: "",
  chapters: {},
  journal: [],
  mocks: [],
  clat: [],
  futureNotes: [],
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
  const start = new Date("2026-06-03"); 
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

  // Route specific triggers safely with fallback protection loops
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
  applyWidgetVisibilityLayouts();
  
  // Restore page view history
  switchNavigationTab(window.appData.lastActiveTab || "dashboard-page");
  
  setTimeout(fullyTriggerUIRefresh, 150);
  setInterval(updateCountdowns, 60000);

  // Bind Bottom Nav Bar click elements safely
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
