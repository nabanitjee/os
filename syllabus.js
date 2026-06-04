// ==========================================================================
// JEE MASTER SYLLABUS DATA & SYNCHRONIZATION ENGINE
// ==========================================================================

const FULL_SYLLABUS = {
  Physics: [
    "Units & Dimensions", "Errors & Measurements", "Vectors", "Kinematics",
    "Projectile Motion", "Laws of Motion", "Friction", "Work Power Energy",
    "Circular Motion", "Center of Mass", "Collision", "Rotational Motion",
    "Gravitation", "Fluid Mechanics", "Properties of Matter", "Thermal Expansion",
    "Calorimetry", "KTG", "Thermodynamics", "Simple Harmonic Motion", "Waves",
    "Electrostatics", "Capacitance", "Current Electricity", "Magnetic Effects of Current",
    "Magnetism", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves",
    "Ray Optics", "Wave Optics", "Dual Nature", "Atoms", "Nuclei", "Semiconductors",
    "Communication Systems"
  ],
  Chemistry: [
    "Mole Concept", "Atomic Structure", "Periodic Table", "Chemical Bonding",
    "States of Matter", "Thermodynamics", "Thermochemistry", "Chemical Equilibrium",
    "Ionic Equilibrium", "Redox Reactions", "Hydrogen", "s Block", "p Block",
    "d Block", "f Block", "Coordination Compounds", "Metallurgy", "Environmental Chemistry",
    "Salt Analysis", "Purification of Organic Compounds", "Practical Organic Chemistry",
    "General Organic Chemistry", "Isomerism", "Hydrocarbons", "Haloalkanes & Haloarenes",
    "Alcohols Phenols Ethers", "Aldehydes Ketones", "Carboxylic Acids", "Amines",
    "Biomolecules", "Polymers", "Chemistry in Everyday Life", "Solid State",
    "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry"
  ],
  Mathematics: [
    "Sets", "Relations & Functions", "Trigonometric Ratios", "Inverse Trigonometric Functions",
    "Complex Numbers", "Quadratic Equations", "Sequence & Series", "Binomial Theorem",
    "Permutations & Combinations", "Probability", "Matrices", "Determinants",
    "Statistics", "Mathematical Reasoning", "Limits", "Continuity", "Differentiability",
    "Differentiation", "Application of Derivatives", "Indefinite Integration",
    "Definite Integration", "Area Under Curve", "Differential Equations", "Vector Algebra",
    "3D Geometry", "Straight Line", "Circle", "Parabola", "Ellipse", "Hyperbola"
  ]
};

const ADVANCED_ONLY_CHAPTERS = [
  "Rotational Motion", "Thermal Expansion", "Calorimetry", "Waves",
  "Ionic Equilibrium", "Salt Analysis", "Electrochemistry",
  "3D Geometry", "Parabola", "Ellipse", "Hyperbola"
];

const HIGH_PRIORITY_CHAPTERS = [
  "Center of Mass", "Collision", "Rotational Motion", "Thermodynamics", "Electrostatics",
  "Current Electricity", "Magnetic Effects of Current", "Electromagnetic Induction", "Ray Optics",
  "Chemical Bonding", "Ionic Equilibrium", "Coordination Compounds", "General Organic Chemistry",
  "Aldehydes Ketones", "Electrochemistry", "Complex Numbers", "Matrices", "Determinants",
  "Permutations & Combinations", "Probability", "Application of Derivatives", "Definite Integration",
  "3D Geometry", "Circle"
];

const LOW_PRIORITY_CHAPTERS = [
  "Units & Dimensions", "Errors & Measurements", "Electromagnetic Waves", "Communication Systems",
  "Hydrogen", "Environmental Chemistry", "Polymers", "Chemistry in Everyday Life", "Mathematical Reasoning", "Statistics"
];

function initializeSyllabus() {
  if (!window.appData) window.appData = { chapters: {} };
  if (!window.appData.chapters) window.appData.chapters = {};

  // Safely check if database is already populated from app.js loadData()
  const existingKeys = Object.keys(window.appData.chapters);

  if (existingKeys.length > 0) {
    Object.entries(window.appData.chapters).forEach(([chapterName, data]) => {
      if (data) {
        data.isAdvancedOnly = ADVANCED_ONLY_CHAPTERS.includes(chapterName);
        if (!data.status) data.status = "weak";

        if (HIGH_PRIORITY_CHAPTERS.includes(chapterName)) data.priority = "high";
        else if (LOW_PRIORITY_CHAPTERS.includes(chapterName)) data.priority = "low";
        else data.priority = "medium";
      }
    });
    return;
  }

  // Fallback initial core database seeding
  Object.entries(FULL_SYLLABUS).forEach(([subject, chapters]) => {
    chapters.forEach(chapter => {
      let prioritySetting = "medium";
      if (HIGH_PRIORITY_CHAPTERS.includes(chapter)) prioritySetting = "high";
      else if (LOW_PRIORITY_CHAPTERS.includes(chapter)) prioritySetting = "low";

      window.appData.chapters[chapter] = {
        subject,
        status: "weak",
        pyq: 0,
        revision1: false,
        revision2: false,
        revision3: false,
        priority: prioritySetting,
        notes: "",
        lastRevised: null,
        custom: false,
        isAdvancedOnly: ADVANCED_ONLY_CHAPTERS.includes(chapter)
      };
    });
  });

  if (typeof window.saveData === "function") window.saveData();
}

function getSubjectProgress(subject) {
  if (!window.appData || !window.appData.chapters) return 0;
  const chapters = Object.values(window.appData.chapters).filter(ch => ch.subject === subject);
  if (chapters.length === 0) return 0;

  let totalScore = 0;
  chapters.forEach(chapter => {
    let statusScore = 25;
    if (chapter.status === "average") statusScore = 50;
    if (chapter.status === "strong") statusScore = 75;
    if (chapter.status === "mastered") statusScore = 100;
    totalScore += statusScore;
  });
  return Math.round(totalScore / chapters.length);
}

function renderSubjectProgress() {
  const physics = document.getElementById("physics-progress");
  const chemistry = document.getElementById("chemistry-progress");
  const maths = document.getElementById("maths-progress");

  if (!physics || !chemistry || !maths) return; 

  physics.style.width = getSubjectProgress("Physics") + "%";
  chemistry.style.width = getSubjectProgress("Chemistry") + "%";
  maths.style.width = getSubjectProgress("Mathematics") + "%";

  const counts = getSubjectCounts();
  const totalChapters = counts.Physics + counts.Chemistry + counts.Mathematics;

  const mainChapterHeaderCount = document.getElementById("chapter-counts");
  if (mainChapterHeaderCount) mainChapterHeaderCount.innerText = `(${totalChapters} Total)`;
}

function renderLowestPYQList() {
  const target = document.getElementById("danger-zone-list");
  if (!target) return;
  target.innerHTML = "";

  const list = Object.entries(window.appData.chapters || {})
    .sort((a, b) => (a[1].pyq || 0) - (b[1].pyq || 0))
    .slice(0, 10);

  list.forEach(([name, data]) => {
    target.innerHTML += `
    <div class="danger-item">
      <strong>${name}</strong><br>${data.pyq || 0} PYQs Solved
    </div>`;
  });
}

function renderSyllabusDistributionBalance() {
  const target = document.getElementById("settings-distribution-analyzer");
  if (!target) return;

  const chapters = Object.values(window.appData.chapters || {});
  if (chapters.length === 0) {
    target.innerText = "No data configured in profile database.";
    return;
  }

  const matrix = {
    high: { Physics: 0, Chemistry: 0, Mathematics: 0, total: 0 },
    medium: { Physics: 0, Chemistry: 0, Mathematics: 0, total: 0 },
    low: { Physics: 0, Chemistry: 0, Mathematics: 0, total: 0 }
  };

  chapters.forEach(c => {
    const p = c.priority || "medium";
    const sub = c.subject;
    if (matrix[p] && matrix[p][sub] !== undefined) {
      matrix[p][sub]++;
      matrix[p].total++;
    }
  });

  target.innerHTML = `
    <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);">
      <span style="color: var(--weak); font-weight: bold; display: block; margin-bottom: 4px;">🔥 HIGH PRIORITY (${matrix.high.total})</span>
      <span style="opacity: 0.9; font-size: 0.85rem;">P: <strong>${matrix.high.Physics}</strong> | C: <strong>${matrix.high.Chemistry}</strong> | M: <strong>${matrix.high.Mathematics}</strong></span>
    </div>
    <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);">
      <span style="color: var(--average); font-weight: bold; display: block; margin-bottom: 4px;">⚡ MEDIUM PRIORITY (${matrix.medium.total})</span>
      <span style="opacity: 0.9; font-size: 0.85rem;">P: <strong>${matrix.medium.Physics}</strong> | C: <strong>${matrix.medium.Chemistry}</strong> | M: <strong>${matrix.medium.Mathematics}</strong></span>
    </div>
    <div>
      <span style="color: var(--mastered); font-weight: bold; display: block; margin-bottom: 4px;">❄️ LOW PRIORITY (${matrix.low.total})</span>
      <span style="opacity: 0.9; font-size: 0.85rem;">P: <strong>${matrix.low.Physics}</strong> | C: <strong>${matrix.low.Chemistry}</strong> | M: <strong>${matrix.low.Mathematics}</strong></span>
    </div>
  `;
}

function getSubjectCounts() {
  const result = { Physics: 0, Chemistry: 0, Mathematics: 0 };
  if (!window.appData || !window.appData.chapters) return result;
  Object.values(window.appData.chapters).forEach(chapter => {
    if (result[chapter.subject] !== undefined) result[chapter.subject]++;
  });
  return result;
}

// Loader event listener node
document.addEventListener("DOMContentLoaded", () => {
  // Let app.js read state memory from localStorage before validating variables
  setTimeout(() => {
    initializeSyllabus();
    
    try { renderLowestPYQList(); } catch(e){}
    try { renderSubjectProgress(); } catch(e){}
    try { renderSyllabusDistributionBalance(); } catch(e){}
    
    // Smoothly synchronize active views without execution freezes
    if (typeof window.fullyTriggerUIRefresh === "function") {
      window.fullyTriggerUIRefresh();
    }
  }, 50);
});
// ==========================================================================
// ADDITION: MISSING BACKLOG & MASTER DIRECTORY UI RENDER ENGINES
// ==========================================================================

function renderBacklogRevision() {
  const target = document.getElementById("backlog-revision-list");
  if (!target) return;

  const chapters = Object.entries(window.appData.chapters || {});
  if (chapters.length === 0) {
    target.innerHTML = `<div style="opacity:0.5; padding:10px; font-size:0.9rem;">No data found. Configure your chapters list.</div>`;
    return;
  }

  // Filter out chapters marked as 'weak' or 'average' to prioritize your backlog
  const backlogList = chapters
    .filter(([name, data]) => data.status === "weak" || data.status === "average")
    .sort((a, b) => {
      // Prioritize High Yield chapters at the top of the backlog queue
      const pA = a[1].priority === "high" ? 3 : a[1].priority === "medium" ? 2 : 1;
      const pB = b[1].priority === "high" ? 3 : b[1].priority === "medium" ? 2 : 1;
      return pB - pA;
    })
    .slice(0, 5); // Display top 5 urgent backlogs

  if (backlogList.length === 0) {
    target.innerHTML = `<div style="color:var(--mastered); font-weight:bold; padding:10px; font-size:0.9rem;">🏆 Zero Backlogs! Everything is in strong shape!</div>`;
    return;
  }

  let html = "";
  backlogList.forEach(([name, data]) => {
    const isHigh = data.priority === "high";
    const statusLabel = data.status === "weak" ? "❌ Weak" : "⚡ Average";
    html += `
      <div class="danger-item" style="border-left: 4px solid ${data.status === 'weak' ? 'var(--weak)' : 'var(--average)'}; margin-bottom: 8px; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: 8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:#fff; font-size:0.9rem;">${name}</strong>
          <span style="font-size:0.75rem; opacity:0.8;">${statusLabel}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; margin-top:4px; opacity:0.6;">
          <span>${data.subject}</span>
          <span>${isHigh ? '🔥 High Yield' : '⚡ Med Yield'}</span>
        </div>
      </div>
    `;
  });

  target.innerHTML = html;
}

function renderMasterDirectory() {
  const statsBox = document.getElementById("directory-recency-stats");
  const listBox = document.getElementById("master-directory-scroll-list");
  
  const chapters = Object.values(window.appData.chapters || {});
  if (chapters.length === 0) {
    if (statsBox) statsBox.innerText = "No metrics configuration tracked.";
    return;
  }

  // Calculate quick metrics for Memory Decay block
  const total = chapters.length;
  const masteredCount = chapters.filter(c => c.status === "mastered" || c.status === "strong").length;
  const healthPercent = Math.round((masteredCount / total) * 100);

  if (statsBox) {
    statsBox.innerHTML = `
      🎯 Retained Units: <strong>${masteredCount} / ${total}</strong> (${healthPercent}% Core Retention)<br>
      ⚠️ Active Decay Warning: <strong>${total - masteredCount}</strong> items require drilling reviews soon.
    `;
  }

  if (!listBox) return;
  listBox.innerHTML = "";

  // Sort layout items: display weak entries at top so you face them first
  const sortedChapters = Object.entries(window.appData.chapters || {})
    .sort((a, b) => {
      const order = { weak: 1, average: 2, strong: 3, mastered: 4 };
      return (order[a[1].status] || 1) - (order[b[1].status] || 1);
    });

  let html = "";
  sortedChapters.forEach(([name, data]) => {
    let color = "var(--weak)";
    if (data.status === "average") color = "var(--average)";
    if (data.status === "strong") color = "var(--strong)";
    if (data.status === "mastered") color = "var(--mastered)";

    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--card2); padding:10px 14px; border-radius:12px; margin-bottom:8px; border-right: 4px solid ${color};">
        <div>
          <div style="font-size:0.9rem; font-weight:bold; color:#fff;">${name}</div>
          <div style="font-size:0.72rem; opacity:0.5; margin-top:2px;">${data.subject} • ${data.pyq || 0} PYQs</div>
        </div>
        <span style="font-size:0.75rem; color:${color}; font-weight:bold; text-transform:uppercase;">${data.status}</span>
      </div>
    `;
  });

  listBox.innerHTML = html;
}

// Map them back to the shared window routing path namespace so app.js can call them
window.renderBacklogRevision = renderBacklogRevision;
window.renderMasterDirectory = renderMasterDirectory;
window.initializeSyllabus = initializeSyllabus;
window.getSubjectProgress = getSubjectProgress;
window.renderSubjectProgress = renderSubjectProgress;
window.getSubjectCounts = getSubjectCounts;
window.renderSyllabusDistributionBalance = renderSyllabusDistributionBalance;
