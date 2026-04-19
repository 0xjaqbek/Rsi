let currentCase = null;

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

function pickCase() {
  const i = Math.floor(Math.random() * window.RSI_CASES.length);
  currentCase = window.RSI_CASES[i];
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
  `;

  stepList.innerHTML = "";
  currentCase.steps.forEach((step, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <label>
        <input type="checkbox" data-step="${idx}">
        ${step}
      </label>
    `;
    stepList.appendChild(li);
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
  const checked = [...document.querySelectorAll('[data-step]')]
    .map((el, idx) => el.checked ? idx : null)
    .filter(v => v !== null);

  const expected = currentCase.steps.map((_, idx) => idx);
  const ok = checked.length === expected.length && checked.every((v, i) => v === expected[i]);

  stepResult.textContent = ok
    ? "Kolejność poprawna."
    : "Kolejność niepoprawna. Sprawdź algorytm.";
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
    hint.textContent = `Poprawna dawka: ${expected} mg`;

    out.push(`${drug.name}: ${ok ? "OK" : "BŁĄD"} (Twoja: ${user || "-"}, poprawna: ${expected} mg)`);
  });

  drugResult.textContent = (allOk ? "Wszystkie dawki poprawne.
" : "Nie wszystkie dawki są poprawne.
") + out.join("
");
}

function showAnswer() {
  if (!currentCase) return;
  const doses = currentCase.drugs.map(d => {
    const dose = calcDose(d);
    return `${d.name}: ${dose} mg`;
  }).join("
");

  answerBox.textContent =
`Kolejność:
${currentCase.steps.map((s, i) => `${i + 1}. ${s}`).join("
")}

Dawki:
${doses}`;
}

function resetAll() {
  if (!currentCase) return;
  renderCase();
}

nextCaseBtn.addEventListener("click", pickCase);
showAnswerBtn.addEventListener("click", showAnswer);
resetBtn.addEventListener("click", resetAll);
checkStepsBtn.addEventListener("click", checkSteps);
checkDrugsBtn.addEventListener("click", checkDrugs);

pickCase();
