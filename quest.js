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
        <button onclick="window.processQuestSubmit()" style="background:var(--accent); margin:0; font-weight:bold; flex:1; padding:12px;">Deploy Slate</button>
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
      <div onclick="window.toggleQuest(1)" style="display:flex; align-items:center; gap:12px; background:var(--card2); padding:12px; border-radius:14px; cursor:pointer; user-select:none;">
        <span style="font-size:1.1rem;">${quest.done1 ? "✅" : "⬜"}</span>
        <span style="font-size:0.95rem; text-decoration: ${quest.done1 ? 'line-through' : 'none'}; opacity: ${quest.done1 ? 0.5 : 1}; text-align:left;">${quest.task1 || "No Active Target"}</span>
      </div>
      <div onclick="window.toggleQuest(2)" style="display:flex; align-items:center; gap:12px; background:var(--card2); padding:12px; border-radius:14px; cursor:pointer; user-select:none;">
        <span style="font-size:1.1rem;">${quest.done2 ? "✅" : "⬜"}</span>
        <span style="font-size:0.95rem; text-decoration: ${quest.done2 ? 'line-through' : 'none'}; opacity: ${quest.done2 ? 0.5 : 1}; text-align:left;">${quest.task2 || "No Active Target"}</span>
      </div>
      <div onclick="window.toggleQuest(3)" style="display:flex; align-items:center; gap:12px; background:var(--card2); padding:12px; border-radius:14px; cursor:pointer; user-select:none;">
        <span style="font-size:1.1rem;">${quest.done3 ? "✅" : "⬜"}</span>
        <span style="font-size:0.95rem; text-decoration: ${quest.done3 ? 'line-through' : 'none'}; opacity: ${quest.done3 ? 0.5 : 1}; text-align:left;">${quest.task3 || "No Active Target"}</span>
      </div>
      <button onclick="window.showQuestEditForm()" style="width:100%; margin-top:4px; background:var(--accent); font-weight:bold; padding:12px; border-radius:8px;">
        ⚙️ Edit Quest List
      </button>
    </div>
  `;
}

// ==========================================================================
// UPGRADED MISSION BOARD MULTI-TRACKER MODULE LAYER
// ==========================================================================

function showMissionForm() {
  const formHTML = `
    <div class="form-container" style="padding:10px; color:#fff; font-family:sans-serif; text-align:left;">
      <h3 style="margin-top:0; color:var(--accent); font-weight:900;">🎯 INITIALIZE CORE MISSION</h3>
      <p style="font-size:0.8rem; opacity:0.6; margin-bottom:15px;">Set a hyper-focused target milestone (e.g., "Solve 50 PYQs of Rotational Motion").</p>
      <hr style="border:0; border-top:1px solid #334; margin-bottom:15px;">
      
      <div style="margin-bottom:15px;">
        <label style="display:block; margin-bottom:6px; font-size:0.85rem; color:var(--accent); font-weight:bold;">Mission Objective</label>
        <input type="text" id="m-objective" placeholder="Type your target goal here..." style="width:100%; padding:12px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box; font-size:0.95rem;">
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button onclick="if(typeof hideModal === 'function'){ hideModal(); } else { document.getElementById('modal-overlay').style.display='none'; }" style="background:#475569; margin:0; flex:1; padding:12px; border-radius:8px;">Cancel</button>
        <button onclick="window.processMissionSubmit()" style="background:var(--accent); margin:0; font-weight:bold; flex:1; padding:12px; border-radius:8px;">Deploy Mission</button>
      </div>
    </div>
  `;

  if (typeof window.showModal === "function") window.showModal(formHTML);
  else if (typeof showModal === "function") showModal(formHTML);
}

function processMissionSubmit() {
  const inputEl = document.getElementById("m-objective");
  if (!inputEl) return;

  const missionText = inputEl.value.trim();
  if (!missionText) return;

  if (!window.appData.activeMissionsList) window.appData.activeMissionsList = [];

  window.appData.activeMissionsList.push({
    id: Date.now(),
    objective: missionText,
    timestampCreated: new Date().toISOString()
  });

  if (typeof window.saveData === "function") window.saveData();
  if (typeof window.hideModal === "function") window.hideModal();
  else if (typeof hideModal === "function") hideModal();

  renderMissionBoard();
}

function showCompleteMissionForm(missionId) {
  const formHTML = `
    <div class="form-container" style="padding:10px; color:#fff; font-family:sans-serif; text-align:left;">
      <h3 style="margin-top:0; color:#10b981; font-weight:900;">✨ MISSION ACCOMPLISHED</h3>
      <p style="font-size:0.85rem; opacity:0.7; margin-bottom:15px;">Log the duration it took you to crush this objective.</p>
      
      <div style="margin-bottom:15px;">
        <label style="display:block; margin-bottom:6px; font-size:0.85rem; color:#10b981; font-weight:bold;">Duration Taken</label>
        <input type="text" id="m-duration-input" placeholder="e.g., 2.5 hours, 45 mins" style="width:100%; padding:12px; background:#1b2d57; border:none; color:#fff; border-radius:8px; box-sizing:border-box;">
      </div>

      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button onclick="if(typeof hideModal === 'function'){ hideModal(); } else { document.getElementById('modal-overlay').style.display='none'; }" style="background:#475569; margin:0; flex:1; padding:12px; border-radius:8px;">Cancel</button>
        <button onclick="window.processArchiveMission(${missionId})" style="background:#10b981; margin:0; font-weight:bold; flex:1; padding:12px; border-radius:8px; color:#fff;">Archive Log</button>
      </div>
    </div>
  `;

  if (typeof window.showModal === "function") window.showModal(formHTML);
  else if (typeof showModal === "function") showModal(formHTML);
}

function processArchiveMission(missionId) {
  const durationInp = document.getElementById("m-duration-input");
  const durationLogged = durationInp ? durationInp.value.trim() || "Untimed" : "Untimed";

  if (!window.appData.activeMissionsList) window.appData.activeMissionsList = [];
  if (!window.appData.completedMissionsLog) window.appData.completedMissionsLog = [];

  const targetMission = window.appData.activeMissionsList.find(m => m.id === missionId);
  if (targetMission) {
    window.appData.completedMissionsLog.push({
      id: targetMission.id,
      objective: targetMission.objective,
      dateCompleted: new Date().toISOString().split("T")[0],
      duration: durationLogged
    });

    window.appData.activeMissionsList = window.appData.activeMissionsList.filter(m => m.id !== missionId);

    if (typeof window.updateActivity === "function") window.updateActivity();
    else if (typeof window.saveData === "function") window.saveData();
  }

  if (typeof window.hideModal === "function") window.hideModal();
  else if (typeof hideModal === "function") hideModal();

  renderMissionBoard();
  if (typeof window.renderSettingsMissionHistory === "function") window.renderSettingsMissionHistory();
}

function deleteActiveMission(missionId) {
  if (!window.appData.activeMissionsList) return;
  window.appData.activeMissionsList = window.appData.activeMissionsList.filter(m => m.id !== missionId);
  if (typeof window.saveData === "function") window.saveData();
  renderMissionBoard();
}

function renderMissionBoard() {
  const boardElement = document.getElementById("widget-mission-container");
  if (!boardElement) return;

  const list = window.appData.activeMissionsList || [];

  let html = `
    <div class="card" style="padding:16px; background:var(--card1); border-radius:14px; text-align: left;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h3 style="margin:0; font-size:1.1rem; color:#fff; font-weight:bold;">🎯 Mission Board (${list.length})</h3>
        <button onclick="window.showMissionForm()" style="background:var(--accent); margin:0; padding:6px 12px; font-size:0.8rem; font-weight:bold; border-radius:6px; width:auto;">+ Add Mission</button>
      </div>
  `;

  if (list.length === 0) {
    html += `<p style="margin:10px 0 0 0; font-size:0.9rem; opacity:0.6; font-style:italic; text-align:center; padding:10px 0;">No active missions right now. Initialize one above!</p>`;
  } else {
    html += `<div style="display:flex; flex-direction:column; gap:10px; max-height:220px; overflow-y:auto; padding-right:2px; margin-top:8px;">`;
    list.forEach(m => {
      html += `
        <div style="background:var(--card2); padding:10px 12px; border-radius:10px; border-left:4px solid var(--accent); display:flex; flex-direction:column; gap:6px;">
          <p style="margin:0; font-size:0.92rem; color:#fff; font-weight:500; line-height:1.3; white-space:pre-wrap;">${m.objective}</p>
          <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:4px;">
            <button onclick="window.showCompleteMissionForm(${m.id})" style="background:#10b981; margin:0; padding:4px 10px; font-size:0.75rem; border-radius:6px; width:auto; font-weight:bold; color:#fff;">✔ Complete</button>
            <button onclick="window.deleteActiveMission(${m.id})" style="background:#b91c1c; margin:0; padding:4px 10px; font-size:0.75rem; border-radius:6px; width:auto;">Remove</button>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  html += `</div>`;
  boardElement.innerHTML = html;
}

function renderSettingsMissionHistory() {
  const historyBox = document.getElementById("settings-mission-history-log");
  if (!historyBox) return;

  const completedList = window.appData.completedMissionsLog || [];
  
  let html = `<h4 style="color:var(--accent); margin-top:15px; margin-bottom:8px; font-size:0.95rem; text-align:left;">🏆 ARCHIVED MISSIONS LOG (${completedList.length})</h4>`;
  
  if (completedList.length === 0) {
    html += `<div style="opacity:0.5; font-size:0.8rem; font-style:italic; padding:10px; background:var(--card2); border-radius:8px; text-align:center;">No completed milestones recorded in this session profile yet.</div>`;
    historyBox.innerHTML = html;
    return;
  }

  html += `<div style="display:flex; flex-direction:column; gap:6px; max-height:180px; overflow-y:auto; padding-right:2px;">`;
  
  const sortedHistory = [...completedList].sort((a,b) => b.id - a.id);
  sortedHistory.forEach(h => {
    html += `
      <div style="background:var(--card2); padding:8px 12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; border-right: 4px solid #10b981; text-align:left;">
        <div style="max-width:70%;">
          <div style="color:#fff; font-weight:bold; line-height:1.2;">${h.objective}</div>
          <div style="opacity:0.5; font-size:0.72rem; margin-top:2px;">Completed: ${h.dateCompleted}</div>
        </div>
        <div style="text-align:right; min-width:25%;">
          <span style="background:rgba(16,185,129,0.1); color:#10b981; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:0.75rem; display:inline-block;">⏱ ${h.duration}</span>
        </div>
      </div>
    `;
  });
  
  html += `</div>`;
  historyBox.innerHTML = html;
}

// Global exposure registration routing hooks
window.toggleQuest = toggleQuest;
window.showQuestEditForm = showQuestEditForm;
window.processQuestSubmit = processQuestSubmit;
window.renderQuest = renderQuest;
window.validateAndResetDailyQuests = validateAndResetDailyQuests;

window.showMissionForm = showMissionForm;
window.processMissionSubmit = processMissionSubmit;
window.showCompleteMissionForm = showCompleteMissionForm;
window.processArchiveMission = processArchiveMission;
window.deleteActiveMission = deleteActiveMission;
window.renderMissionBoard = renderMissionBoard;
window.renderSettingsMissionHistory = renderSettingsMissionHistory;
