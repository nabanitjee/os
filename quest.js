// ==========================================================================
// QUEST & MISSION SYSTEM MODULE V4 (WITH AUTOMATED 3:00 AM TIMESHIFT RESET)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  if (!window.appData.dailyQuest) {
    window.appData.dailyQuest = {
      task1: "", task2: "", task3: "",
      done1: false, done2: false, done3: false
    };
    if (typeof window.saveData === "function") window.saveData();
  }

  // Trigger automated chron validation loop before executing layout updates
  validateAndResetDailyQuests();
  renderQuest();
});

function validateAndResetDailyQuests() {
  if (!window.appData || !window.appData.dailyQuest) return;

  // 1. Grab current device system time metrics
  const now = new Date();
  
  // 2. SHIFT CUSTOM CUTOFF BOUNDARY: Subtract 3 hours from current time.
  // This safely pushes late-night study sessions (12:00 AM - 2:59 AM) into yesterday's bucket.
  now.setHours(now.getHours() - 3);

  // 3. Generate the shifted comparison date string (YYYY-MM-DD)
  const todayStr = now.toISOString().split("T")[0];

  // 4. Compare with last recorded timestamp node to trigger reset safely
  if (window.appData.lastActivityDate && window.appData.lastActivityDate !== todayStr) {
    // Past 3:00 AM on a new calendar tracking day: clear checkmarks smoothly!
    window.appData.dailyQuest.done1 = false;
    window.appData.dailyQuest.done2 = false;
    window.appData.dailyQuest.done3 = false;

    if (typeof window.saveData === "function") window.saveData();
  }
}

function showQuestEditForm() {
  const quest = window.appData.dailyQuest;

  const formHTML = `
    <div class="modal-form-container" style="color:#fff; font-family:sans-serif; padding:5px; text-align: left;">
      <h3 style="margin-top:0; color:var(--accent);">Configure Today's Quests</h3>
      <p style="font-size:0.8rem; opacity:0.6; margin:-5px 0 15px 0;">Updating clears completion checkmarks for the new track.</p>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:0.85rem; opacity:0.8;">Primary Quest Milestone 1</label>
        <input type="text" id="q-t1" value="${quest.task1}" placeholder="e.g. Solve 25 PYQs Physics" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box; margin-top:4px;">
      </div>
      
      <div style="margin-bottom:12px;">
        <label style="font-size:0.85rem; opacity:0.8;">Secondary Quest Milestone 2</label>
        <input type="text" id="q-t2" value="${quest.task2}" placeholder="e.g. Revise Organic Mechanism" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box; margin-top:4px;">
      </div>
      
      <div style="margin-bottom:16px;">
        <label style="font-size:0.85rem; opacity:0.8;">Tertiary Quest Milestone 3</label>
        <input type="text" id="q-t3" value="${quest.task3}" placeholder="e.g. Attempt Maths Sectional" style="width:100%; padding:10px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box; margin-top:4px;">
      </div>
      
      <div class="action-row" style="margin-top:20px; display:flex; gap:10px;">
        <button onclick="if(typeof hideModal === 'function'){ hideModal(); } else { document.getElementById('modal-overlay').style.display='none'; }" style="background:#475569; margin:0; flex:1; padding:12px;">Cancel</button>
        <button onclick="processQuestSubmit()" style="background:var(--accent); margin:0; font-weight:bold; flex:1; padding:12px;">Deploy Slate</button>
      </div>
    </div>
  `;

  if (typeof window.showModal === "function") window.showModal(formHTML);
  else if (typeof showModal === "function") showModal(formHTML);
}

function processQuestSubmit() {
  window.appData.dailyQuest = {
    task1: document.getElementById("q-t1").value.trim(),
    task2: document.getElementById("q-t2").value.trim(),
    task3: document.getElementById("q-t3").value.trim(),
    done1: false, done2: false, done3: false
  };

  if (typeof window.saveData === "function") window.saveData();
  if (typeof window.hideModal === "function") window.hideModal();
  else if (typeof hideModal === "function") hideModal();

  renderQuest();
}

function toggleQuest(taskNo) {
  const key = "done" + taskNo;
  window.appData.dailyQuest[key] = !window.appData.dailyQuest[key];

  // Increment streak matrix safely if you complete a target milestone
  if (window.appData.dailyQuest[key] && typeof window.updateActivity === "function") {
    window.updateActivity();
  } else {
    if (typeof window.saveData === "function") window.saveData();
  }

  renderQuest();
}

function renderQuest() {
  const box = document.getElementById("quest-list");
  if (!box) return;

  const quest = window.appData.dailyQuest;

  box.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div onclick="toggleQuest(1)" style="display:flex; align-items:center; gap:12px; background:var(--card2); padding:12px; border-radius:14px; cursor:pointer; user-select:none;">
        <span style="font-size:1.1rem;">${quest.done1 ? "✅" : "⬜"}</span>
        <span style="font-size:0.95rem; text-decoration: ${quest.done1 ? 'line-through' : 'none'}; opacity: ${quest.done1 ? 0.5 : 1}; text-align:left;">${quest.task1 || "No Active Target"}</span>
      </div>
      <div onclick="toggleQuest(2)" style="display:flex; align-items:center; gap:12px; background:var(--card2); padding:12px; border-radius:14px; cursor:pointer; user-select:none;">
        <span style="font-size:1.1rem;">${quest.done2 ? "✅" : "⬜"}</span>
        <span style="font-size:0.95rem; text-decoration: ${quest.done2 ? 'line-through' : 'none'}; opacity: ${quest.done2 ? 0.5 : 1}; text-align:left;">${quest.task2 || "No Active Target"}</span>
      </div>
      <div onclick="toggleQuest(3)" style="display:flex; align-items:center; gap:12px; background:var(--card2); padding:12px; border-radius:14px; cursor:pointer; user-select:none;">
        <span style="font-size:1.1rem;">${quest.done3 ? "✅" : "⬜"}</span>
        <span style="font-size:0.95rem; text-decoration: ${quest.done3 ? 'line-through' : 'none'}; opacity: ${quest.done3 ? 0.5 : 1}; text-align:left;">${quest.task3 || "No Active Target"}</span>
      </div>
      <button onclick="showQuestEditForm()" style="width:100%; margin-top:4px; background:var(--accent); font-weight:bold; padding:12px; border-radius:8px;">
        ⚙️ Edit Quest List
      </button>
    </div>
  `;
}

// ==========================================================================
// MISSION BOARD CONTROLLER MODULE LAYER
// ==========================================================================

function showMissionForm() {
  const currentMission = window.appData.activeMission || "";

  const formHTML = `
    <div class="form-container" style="padding:10px; color:#fff; font-family:sans-serif; text-align:left;">
      <h3 style="margin-top:0; color:var(--accent); font-weight:900;">🎯 INITIALIZE CORE MISSION</h3>
      <p style="font-size:0.8rem; opacity:0.6; margin-bottom:15px; color:#fff;">Set your absolute highest priority goal for the next 24-48 hours (e.g., "Complete 50 PYQs of Rotational Motion").</p>
      <hr style="border:0; border-top:1px solid #334; margin-bottom:15px;">
      
      <div style="margin-bottom:15px;">
        <label style="display:block; margin-bottom:6px; font-size:0.85rem; color:var(--accent); font-weight:bold;">Mission Objective</label>
        <input type="text" id="m-objective" value="${currentMission}" placeholder="Type your core target goal here..." style="width:100%; padding:12px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box; font-size:0.95rem;">
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button onclick="if(typeof hideModal === 'function'){ hideModal(); } else { document.getElementById('modal-overlay').style.display='none'; }" style="background:#475569; margin:0; flex:1; padding:12px;">Cancel</button>
        <button onclick="processMissionSubmit()" style="background:var(--accent); margin:0; font-weight:bold; flex:1; padding:12px;">Set Mission</button>
      </div>
    </div>
  `;

  if (typeof window.showModal === "function") window.showModal(formHTML);
  else if (typeof showModal === "function") showModal(formHTML);
}

function processMissionSubmit() {
  const objectiveInput = document.getElementById("m-objective");
  if (!objectiveInput) return;

  window.appData.activeMission = objectiveInput.value.trim();

  if (typeof window.saveData === "function") window.saveData();
  if (typeof window.hideModal === "function") window.hideModal();
  else if (typeof hideModal === "function") hideModal();

  renderMissionBoard();
}

function clearActiveMission() {
  window.appData.activeMission = "";
  if (typeof window.saveData === "function") window.saveData();
  if (typeof window.updateActivity === "function") window.updateActivity();

  renderMissionBoard();
}

function renderMissionBoard() {
  const boardElement = document.getElementById("widget-mission-container");
  if (!boardElement) return;

  const activeGoal = window.appData.activeMission || "";

  if (!activeGoal) {
    boardElement.innerHTML = `
      <div class="card" style="padding:16px; background:var(--card1); border-radius:14px; position:relative; text-align: left;">
        <h3 style="margin:0 0 6px 0; font-size:1.1rem; color:#fff; font-weight:bold;">🎯 Mission Board</h3>
        <p style="margin:0 0 12px 0; font-size:0.9rem; opacity:0.6; font-style:italic;">No active mission.</p>
        <button onclick="window.showMissionForm()" style="background:var(--accent); margin:0; width:100%; padding:12px; font-weight:bold; border-radius:8px;">+ Initialize New Mission</button>
      </div>
    `;
  } else {
    boardElement.innerHTML = `
      <div class="card" style="padding:16px; background:var(--card1); border-radius:14px; border-left: 5px solid var(--accent); position:relative; text-align: left;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h3 style="margin:0; font-size:1.1rem; color:var(--accent); font-weight:bold; letter-spacing:0.5px;">⚡ ACTIVE MISSION</h3>
          <span style="font-size:0.7rem; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; opacity:0.7; font-weight:bold;">IN PROGRESS</span>
        </div>
        <p style="margin:0 0 15px 0; font-size:1rem; color:#fff; font-weight:500; line-height:1.4; white-space:pre-wrap;">${activeGoal}</p>
        <div style="display:flex; gap:8px;">
          <button onclick="window.clearActiveMission()" style="background:#10b981; margin:0; flex:2; font-weight:bold; padding:12px; border-radius:8px; color:#fff;">✨ Mark Completed</button>
          <button onclick="window.showMissionForm()" style="background:var(--card2); margin:0; flex:1; padding:12px; border-radius:8px;">Edit</button>
        </div>
      </div>
    `;
  }
}

// Global script namespace register map hooks
window.toggleQuest = toggleQuest;
window.showQuestEditForm = showQuestEditForm;
window.processQuestSubmit = processQuestSubmit;
window.renderQuest = renderQuest;
window.validateAndResetDailyQuests = validateAndResetDailyQuests;

window.showMissionForm = showMissionForm;
window.processMissionSubmit = processMissionSubmit;
window.clearActiveMission = clearActiveMission;
window.renderMissionBoard = renderMissionBoard;
