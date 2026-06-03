// =========================
// QUEST SYSTEM V4
// =========================

document.addEventListener("DOMContentLoaded", () => {
  if (!window.appData.dailyQuest) {
    window.appData.dailyQuest = {
      task1: "", task2: "", task3: "",
      done1: false, done2: false, done3: false
    };
    saveData();
  }
  renderQuest();
});

function showQuestEditForm() {
  const quest = window.appData.dailyQuest;
  
  const formHTML = `
    <div class="modal-form-container" style="color:#fff; font-family:sans-serif; padding:5px;">
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
      
      <div class="action-row" style="margin-top:20px;">
        <button onclick="hideModal()" style="background:#475569; margin:0;">Cancel</button>
        <button onclick="processQuestSubmit()" style="background:var(--accent); margin:0; font-weight:bold;">Deploy Slate</button>
      </div>
    </div>
  `;
  
  if (typeof showModal === "function") showModal(formHTML);
}

function processQuestSubmit() {
  window.appData.dailyQuest = {
    task1: document.getElementById("q-t1").value.trim(),
    task2: document.getElementById("q-t2").value.trim(),
    task3: document.getElementById("q-t3").value.trim(),
    done1: false, done2: false, done3: false
  };

  saveData();
  if (typeof hideModal === "function") hideModal();
  renderQuest();
}

function toggleQuest(taskNo) {
  const key = "done" + taskNo;
  window.appData.dailyQuest[key] = !window.appData.dailyQuest[key];
  saveData();
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
        <span style="font-size:0.95rem; text-decoration: ${quest.done1 ? 'line-through' : 'none'}; opacity: ${quest.done1 ? 0.5 : 1};">${quest.task1 || "No Active Target"}</span>
      </div>
      <div onclick="toggleQuest(2)" style="display:flex; align-items:center; gap:12px; background:var(--card2); padding:12px; border-radius:14px; cursor:pointer; user-select:none;">
        <span style="font-size:1.1rem;">${quest.done2 ? "✅" : "⬜"}</span>
        <span style="font-size:0.95rem; text-decoration: ${quest.done2 ? 'line-through' : 'none'}; opacity: ${quest.done2 ? 0.5 : 1};">${quest.task2 || "No Active Target"}</span>
      </div>
      <div onclick="toggleQuest(3)" style="display:flex; align-items:center; gap:12px; background:var(--card2); padding:12px; border-radius:14px; cursor:pointer; user-select:none;">
        <span style="font-size:1.1rem;">${quest.done3 ? "✅" : "⬜"}</span>
        <span style="font-size:0.95rem; text-decoration: ${quest.done3 ? 'line-through' : 'none'}; opacity: ${quest.done3 ? 0.5 : 1};">${quest.task3 || "No Active Target"}</span>
      </div>
      <button onclick="showQuestEditForm()" style="width:100%; margin-top:4px; background:var(--accent);">
        ⚙️ Edit Quest List
      </button>
    </div>
  `;
}

window.toggleQuest = toggleQuest;
