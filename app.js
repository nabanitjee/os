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
  currentTheme: "theme-blue"
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
        // Safe deep merge mechanics
        window.appData.jeeMainDate = parsed.jeeMainDate || "2027-01-15";
        window.appData.jeeAdvancedDate = parsed.jeeAdvancedDate || "";
        window.appData.chapters = parsed.chapters || {};
        window.appData.journal = parsed.journal || [];
        window.appData.mocks = parsed.mocks || [];
        window.appData.clat = parsed.clat || [];
        window.appData.futureNotes = parsed.futureNotes || [];
        window.appData.currentTheme = parsed.currentTheme || "theme-blue";
        
        if (parsed.widgetVisibility) {
          window.appData.widgetVisibility.mission = parsed.widgetVisibility.mission !== false;
          window.appData.widgetVisibility.future = parsed.widgetVisibility.future !== false;
          window.appData.widgetVisibility.clat = parsed.widgetVisibility.clat !== false;
          window.appData.widgetVisibility.quest = parsed.widgetVisibility.quest !== false;
        }
      }
    } catch (e) {
      console.error("Database reading trace crash: initialization bypassed", e);
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
    if (diffMain > 0) {
      mainLabel.textContent = Math.ceil(diffMain / (1000 * 60 * 60 * 24)) + " Days";
    } else {
      mainLabel.textContent = "Released";
    }
  }

  if (advLabel && window.appData.jeeAdvancedDate) {
    const targetAdv = new Date(window.appData.jeeAdvancedDate).getTime();
    const diffAdv = targetAdv - today;
    if (diffAdv > 0) {
      advLabel.textContent = Math.ceil(diffAdv / (1000 * 60 * 60 * 24)) + " Days";
    } else {
      advLabel.textContent = "Passed/TBD";
    }
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
  Object.values(window.appData.chapters).forEach(ch => {
    if (counts[ch.status] !== undefined) counts[ch.status]++;
  });

  Object.keys(elements).forEach(key => {
    if (elements[key]) elements[key].textContent = counts[key];
  });
}

function renderPrepIndex() {
  const bar = document.getElementById("prep-progress");
  const text = document.getElementById("prep-percent");
  if (!bar || !text) return;

  const chapters = Object.values(window.appData.chapters);
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

// 5. Dynamic Controller Visibility Toggles (FIXED CRASH LEAK LOOP)
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
    
    // Explicitly hide or show card container block safely
    if (element) {
      element.style.display = show ? "block" : "none";
    }
    
    // Explicitly update checkmarks safely without crash barriers
    const checkbox = document.getElementById(`toggle-widget-${key}`);
    if (checkbox) {
      checkbox.checked = show;
    }
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

// Initialization Entry Points 
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  
  // Set values into inputs on configurations tab
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
  
  setInterval(updateCountdowns, 60000);

  // Router Engine Navigation Linker
  const navigationButtons = document.querySelectorAll(".bottom-nav button");
  navigationButtons.forEach(button => {
    button.addEventListener("click", () => {
      const targetPageId = button.getAttribute("data-page");
      if (!targetPageId) return;

      document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
        page.classList.remove("active");
      });

      const targetPageElement = document.getElementById(targetPageId);
      if (targetPageElement) {
        targetPageElement.style.display = "block";
        targetPageElement.classList.add("active");
      }

      navigationButtons.forEach(btn => btn.classList.remove("active-nav"));
      button.classList.add("active-nav");

      if (targetPageId === "chapters-page" && typeof window.renderChapterGrid === "function") {
        window.renderChapterGrid();
      }
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
