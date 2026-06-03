// =========================
// BACKUP CONFIGURATIONS V4
// =========================

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("export-btn")?.addEventListener("click", triggerDataExport);
  document.getElementById("import-btn")?.addEventListener("click", showImportFormOverlay);
});

function triggerDataExport() {
  const jsonString = JSON.stringify(window.appData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const downloadUrl = URL.createObjectURL(blob);
  
  const tempLink = document.createElement("a");
  const stamp = new Date().toISOString().split("T")[0];
  
  tempLink.href = downloadUrl;
  tempLink.download = `JEE_OS_BACKUP_${stamp}.json`;
  document.body.appendChild(tempLink);
  tempLink.click();
  
  document.body.removeChild(tempLink);
  URL.revokeObjectURL(downloadUrl);
}

function showImportFormOverlay() {
  const formHTML = `
    <div class="modal-form-container" style="font-family:sans-serif; color:#fff; padding:5px;">
      <h3 style="margin-top:0; color:var(--accent);">Import Data Archive</h3>
      <p style="font-size:0.85rem; opacity:0.7; margin-bottom:15px; color:var(--weak);">⚠️ Danger: This completely replaces your current history.</p>
      
      <div style="border: 2px dashed #334; padding: 15px; border-radius: 12px; text-align: center; background:#081224;">
        <label for="file-upload-input" style="cursor:pointer; font-weight:bold; color:var(--accent); margin:0;">📁 Select JSON Backup File</label>
        <input type="file" id="file-upload-input" accept=".json" style="display:none;" onchange="handleBackupFileSelect(event)">
        <div id="file-upload-name" style="font-size:0.8rem; margin-top:5px; opacity:0.6;">No File Chosen</div>
      </div>
      
      <div style="text-align:center; margin:12px 0; font-size:0.8rem; opacity:0.4;">- OR PASTE RAW OBJECT CODE -</div>
      
      <div>
        <textarea id="raw-json-paste" placeholder="Paste export code text string..." style="font-size:0.8rem; height:70px; background:#1b2d57; border:none; border-radius:8px; padding:10px; color:#fff; width:100%; box-sizing:border-box;"></textarea>
      </div>
      
      <div class="action-row" style="margin-top:20px;">
        <button onclick="hideModal()" style="background:#475569; margin:0;">Cancel</button>
        <button onclick="processDataImportSubmit()" style="background:#b91c1c; margin:0; font-weight:bold;">Override & Restore</button>
      </div>
    </div>
  `;
  if (typeof showModal === "function") showModal(formHTML);
}

function handleBackupFileSelect(event) {
  const file = event.target.files[0];
  const label = document.getElementById("file-upload-name");
  if (file && label) {
    label.innerText = `Selected: ${file.name}`;
    
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
      const area = document.getElementById("raw-json-paste");
      if (area) area.value = e.target.result;
    };
    fileReader.readAsText(file);
  }
}

function processDataImportSubmit() {
  const codeArea = document.getElementById("raw-json-paste");
  if (!codeArea) return;
  
  const parsedText = codeArea.value.trim();
  if (!parsedText) { alert("Please provide a valid backup string first!"); return; }

  try {
    const freshData = JSON.parse(parsedText);
    
    if (freshData.chapters && freshData.mocks && freshData.journal) {
      window.appData = freshData;
      saveData();
      hideModal();
      
      alert("Database Restored Successfully! Refreshing workspace...");
      window.location.reload();
    } else {
      alert("Invalid backup format structure components missing.");
    }
  } catch (error) {
    alert("Failed decoding backup context string parameter error.");
  }
}

window.handleBackupFileSelect = handleBackupFileSelect;
window.processDataImportSubmit = processDataImportSubmit;
