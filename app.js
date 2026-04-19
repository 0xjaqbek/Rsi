let currentCase = null;
let mode = "learn";
let chosenSteps = [];

const caseInfo = document.getElementById("caseInfo");
const stepList = document.getElementById("stepList");
const drugForm = document.getElementById("drugForm");
const answerBox = document.getElementById("answerBox");
const stepResult = document.getElementById("stepResult");
const drugResult = document.getElementById("drugResult");

const nextCaseBtn = document.getElementById("nextCaseBtn");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const resetBtn = document.getElementById("resetBtn");
const checkStepsBtn = document.getElementById("checkStepsBtn");
const checkDrugsBtn = document.getElementById("checkDrugsBtn");
const modeBtn = document.getElementById("modeBtn");

function pickCase() {
  const i = Math.floor(Math.random() * window.RSI_CASES.length);
  currentCase = window.RSI_CASES[i];
  chosenSteps = [];
  renderCase();
}

function renderCase() {
  if (!currentCase) return;

  caseInfo.innerHTML = `
    <p><strong>Typ:</strong> ${currentCase.title}</p>
    <p><strong>Wiek:</strong> ${currentCase.age}</p>
    <p><strong>Masa:</strong> ${currentCase.weight} kg</p>
    <p><strong>Stan:</strong> ${currentCase.presentation}</p>
    <p><strong>Zadanie:</strong> ${currentCase.goal}</p>
    <p><strong>Tryb:</strong> ${mode === "learn" ? "nauka" : "egzamin"}</p>
  `;

  stepList.innerHTML = "";

  const chosenBox = document.createElement("div");
  chosenBox.innerHTML = "<h3>Twoja sekwencja</h3>";
  const chosenOl = document.createElement("ol");
  chosenOl.id = "chosenSteps";
  chosenBox.appendChild(chosenOl);

  const availableBox = document.createElement("div");
  availableBox.innerHTML = "<h3>Dostępne czynności</h3>";
  const availableOl = document.createElement("ol");

  currentCase.steps.forEach((step, idx) => {
    if (chosenSteps.includes(idx)) return;

    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = step;
    btn.addEventListener("click", () => {
      chosenSteps.push(idx);
      renderCase();
    });
    li.appendChild(btn);
    availableOl.appendChild(li);
  });

  availableBox.appendChild(availableOl);

  stepList.appendChild(chosenBox);
  stepList.appendChild(availableBox);

  const chosenOlNode = document.getElementById("chosenSteps");
  chosenSteps.forEach((stepIdx, pos) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${currentCase.steps[stepIdx]}
      <button type="button" data-remove="${stepIdx}">Usuń</button>
    `;
    chosenOlNode.appendChild(li);
  });

  chosenOlNode.querySelectorAll("[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-remove"), 10);
      chosenSteps = chosenSteps.filter(v => v !== idx);
      renderCase();
    });
  });

  drugForm.innerHTML = "";
  currentCase.drugs.forEach((drug, idx) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <label>
        ${drug.name} (${drug.note})<br>
        Twoja dawka [mg]: <input type="number" step="0.1" data-drug="${idx}">
      </label>
      <div id="drugHint${idx}"></div>
      <br>
    `;
    drugForm.appendChild(wrapper);
  });

  answerBox.textContent = "";
  stepResult.textContent = "";
  drugResult.textContent = "";
}

function checkSteps() {
  const expected = currentCase.steps.map((_, idx) => idx);
  const ok =
    chosenSteps.length === expected.length &&
    chosenSteps.every((v, i) => v === expected[i]);

  stepResult.textContent = ok
    ? "Kolejność poprawna."
    : `Kolejność niepoprawna. Wybrałeś: ${chosenSteps.map(i => currentCase.steps[i]).join(" → ")}`;
}

function calcDose(drug) {
  const raw = currentCase.weight * drug.mgPerKg;
  const rounded = Math.round(raw * 10) / 10;
  if (drug.maxMg != null) return Math.min(rounded, drug.maxMg);
  return rounded;
}

function checkDrugs() {
  const inputs = [...document.querySelectorAll('[data-drug]')];
  let allOk = true;
  let out = [];

  inputs.forEach((input, idx) => {
    const drug = currentCase.drugs[idx];
    const expected = calcDose(drug);
    const user = parseFloat(input.value);
    const tol = drug.toleranceMg ?? 0.5;
    const ok = !Number.isNaN(user) && Math.abs(user - expected) <= tol;

    if (!ok) allOk = false;

    const hint = document.getElementById(`drugHint${idx}`);
    hint.textContent = mode === "learn" ? `Poprawna dawka: ${expected} mg` : "";

    out.push(`${drug.name}: ${ok ? "OK" : "BŁĄD"} (Twoja: ${user || "-"}, poprawna: ${expected} mg)`);
  });

  drugResult.textContent = (allOk ? "Wszystkie dawki poprawne.
" : "Nie wszystkie dawki są poprawne.
") + out.join("
");
}

function showAnswer() {
  if (!currentCase) return;

  const doses = currentCase.drugs
    .map(d => `${d.name}: ${calcDose(d)} mg`)
    .join("
");

  answerBox.textContent =
`Kolejność:
${currentCase.steps.map((s, i) => `${i + 1}. ${s}`).join("
")}

Dawki:
${doses}`;
}

function resetAll() {
  chosenSteps = [];
  renderCase();
}

function toggleMode() {
  mode = mode === "learn" ? "exam" : "learn";
  renderCase();
}

nextCaseBtn.addEventListener("click", pickCase);
showAnswerBtn.addEventListener("click", showAnswer);
resetBtn.addEventListener("click", resetAll);
checkStepsBtn.addEventListener("click", checkSteps);
checkDrugsBtn.addEventListener("click", checkDrugs);
modeBtn.addEventListener("click", toggleMode);

pickCase();
