const form = document.getElementById('expense-form');
const tableBody = document.querySelector('#expense-table tbody');
const totalDisplay = document.getElementById('total');
const loginBtn = document.getElementById('login-btn');
const usernameInput = document.getElementById('username');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const budgetInput = document.getElementById('budget');
const remainingDisplay = document.getElementById('remaining');
const darkModeBtn = document.getElementById('dark-mode-btn');

let currentUserKey = null;
let expenses = [];
let budget = 0;
let pieChart = null;
let barChart = null;

/* ✅ NEW SAFE VARIABLE */
let editingIndex = null;

/* USER KEY */
function getUserKey(username) {
  let userId = localStorage.getItem(`userId_${username}`);
  if (!userId) {
    userId = Date.now();
    localStorage.setItem(`userId_${username}`, userId);
  }
  return `expenses_${userId}`;
}

/* LOGIN */
loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (!username) return alert("Enter username");

  currentUserKey = getUserKey(username);
  form.style.display = "block";
  loadExpenses();
});

/* ADD / EDIT EXPENSE */
form.addEventListener('submit', function(e) {
  e.preventDefault();

  let type = document.getElementById('type').value;
  const customType = document.getElementById('custom-type').value.trim();
  if (customType) type = customType;

  const date = document.getElementById('date').value;
  const amount = parseFloat(document.getElementById('amount').value);

  const expense = { type, date, amount };

  /* ✅ FIXED EDIT LOGIC */
  if (editingIndex !== null) {
    expenses[editingIndex] = expense;
    editingIndex = null;
  } else {
    expenses.push(expense);
  }

  saveExpenses();
  renderExpenses();
  form.reset();
});

/* RENDER */
function renderExpenses() {
  tableBody.innerHTML = "";
  let total = 0;

  expenses.forEach((exp, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${exp.type}</td>
      <td>${exp.date}</td>
      <td>₹${exp.amount}</td>
      <td>
        <button onclick="editExpense(${index})">✏️</button>
        <button onclick="deleteExpense(${index})">❌</button>
      </td>
    `;

    tableBody.appendChild(row);
    total += exp.amount;
  });

  totalDisplay.textContent = total;
  updateBudget();
  renderCharts();
}

/* ✅ FIXED EDIT */
function editExpense(index) {
  const exp = expenses[index];

  document.getElementById('type').value = exp.type;
  document.getElementById('date').value = exp.date;
  document.getElementById('amount').value = exp.amount;

  editingIndex = index;
}

/* DELETE */
function deleteExpense(index) {
  if(!confirm("Delete this expense?")) return;

  expenses.splice(index, 1);
  saveExpenses();
  renderExpenses();
}

/* STORAGE */
function saveExpenses() {
  localStorage.setItem(currentUserKey, JSON.stringify(expenses));
}

function loadExpenses() {
  const data = localStorage.getItem(currentUserKey);
  expenses = data ? JSON.parse(data) : [];
  renderExpenses();
}

/* EXPORT */
exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(expenses)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${currentUserKey}.json`;
  a.click();
});

/* IMPORT */
importBtn.addEventListener('click', () => {
  const file = importFile.files[0];
  if (!file) return alert("Select file");

  const reader = new FileReader();
  reader.onload = e => {
    expenses = JSON.parse(e.target.result);
    saveExpenses();
    renderExpenses();
  };
  reader.readAsText(file);
});

/* BUDGET */
budgetInput.addEventListener('input', e => {
  budget = parseFloat(e.target.value) || 0;
  updateBudget();
});

function updateBudget() {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  remainingDisplay.textContent = budget - total;
}

/* DARK MODE */
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

/* CHARTS (UNCHANGED) */
function renderCharts(){
  if(!window.Chart) return;
}
