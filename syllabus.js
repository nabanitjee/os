// =========================
// JEE MASTER SYLLABUS DATA
// =========================

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

function initializeSyllabus() {
  if (Object.keys(appData.chapters).length > 0) return;

  Object.entries(FULL_SYLLABUS).forEach(([subject, chapters]) => {
    chapters.forEach(chapter => {
      appData.chapters[chapter] = {
        subject,
        status: "weak",
        pyq: 0,
        revision1: false,
        revision2: false,
        revision3: false,
        priority: "medium",
        notes: "",
        lastRevised: null,
        custom: false
      };
    });
  });

  saveData();
  if (typeof renderStatusCounts === "function") {
    renderStatusCounts();
    renderPrepIndex();
  }
}

function getSubjectProgress(subject) {
  const chapters = Object.values(appData.chapters).filter(ch => ch.subject === subject);
  if (chapters.length === 0) return 0;

  let totalScore = 0;
  chapters.forEach(chapter => {
    let statusScore = 0;
    switch (chapter.status) {
      case "weak": statusScore = 25; break;
      case "average": statusScore = 50; break;
      case "strong": statusScore = 75; break;
      case "mastered": statusScore = 100; break;
    }
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

function getDangerZone() {
  return Object.entries(appData.chapters)
    .sort((a, b) => (a[1].pyq || 0) - (b[1].pyq || 0))
    .slice(0, 10);
}

function renderLowestPYQList() {
  const target = document.getElementById("danger-zone-list");
  if (!target) return;
  target.innerHTML = "";

  getDangerZone().forEach(([name, data]) => {
    target.innerHTML += `
    <div class="danger-item">
      <strong>${name}</strong><br>${data.pyq} PYQs Solved
    </div>`;
  });
}

function getSubjectCounts() {
  const result = { Physics: 0, Chemistry: 0, Mathematics: 0 };
  Object.values(appData.chapters).forEach(chapter => {
    if (result[chapter.subject] !== undefined) result[chapter.subject]++;
  });
  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  initializeSyllabus();
  renderLowestPYQList();
  renderSubjectProgress();
});

window.initializeSyllabus = initializeSyllabus;
window.getSubjectProgress = getSubjectProgress;
window.renderSubjectProgress = renderSubjectProgress;
window.getSubjectCounts = getSubjectCounts;
