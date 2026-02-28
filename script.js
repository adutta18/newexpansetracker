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

// Generate unique user key
function getUserKey(username) {
  let userId = localStorage.getItem(`userId_${username}`);
  if (!userId) {
    userId = Date.now() + "_" + Math.random().toString(36).substr(2,9);
    localStorage.setItem(`userId_${username}`, userId);
  }
  return `expenses_${userId}`;
}

// Login
loginBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter a username!");
    return;
  }
  currentUserKey = getUserKey(username);
  form.style.display = "block";
  loadExpenses();
});

// Add Expense
form.addEventListener('submit', function(e) {
  e.preventDefault();

  let type = document.getElementById('type').value;
  const customType = document.getElementById('custom-type').value.trim();
  if (customType) type = customType;

  const date = document.getElementById('date').value;
  const amount = parseFloat(document.getElementById('amount').value);

  const expense = { type, date, amount };
  expenses.push(expense);
  saveExpenses();
  renderExpenses();

  form.reset();
});

// Render Expenses
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
        <button class="edit-btn" onclick="editExpense(${index})">✏️ Edit</button>
        <button class="delete-btn" onclick="deleteExpense(${index})">❌ Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
    total += exp.amount;
  });
  totalDisplay.textContent = total;
  updateBudget();
  renderCharts();
}

// Edit Expense
function editExpense(index) {
  const exp = expenses[index];
  document.getElementById('type').value = exp.type;
  document.getElementById('date').value = exp.date;
  document.getElementById('amount').value = exp.amount;
  expenses.splice(index, 1); // remove old entry, will be replaced when resubmitted
  saveExpenses();
  renderExpenses();
}

// Delete Expense
function deleteExpense(index) {
  expenses.splice(index, 1);
  saveExpenses();
  renderExpenses();
}

// Save Expenses
function saveExpenses() {
  localStorage.setItem(currentUserKey, JSON.stringify(expenses));
}

// Load Expenses
function loadExpenses() {
  const data = localStorage.getItem(currentUserKey);
  expenses = data ? JSON.parse(data) : [];
  renderExpenses();
}

// Export Data
exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(expenses)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${currentUserKey}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Import Data
importBtn.addEventListener('click', () => {
  const file = importFile.files[0];
  if (!file) {
    alert("Please select a file!");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(e) {
    expenses = JSON.parse(e.target.result);
    saveExpenses();
    renderExpenses();
  };
  reader.readAsText(file);
});

// Budget
budgetInput.addEventListener('input', e => {
  budget = parseFloat(e.target.value) || 0;
  updateBudget();
});

function updateBudget() {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remaining = budget - total;
  remainingDisplay.textContent = remaining;

  if (budget > 0 && remaining < budget * 0.2) {
    remainingDisplay.style.color = "red";
  } else {
    remainingDisplay.style.color = "green";
  }
}

// Analytics Charts + Monthly Summary
function renderCharts() {
  // Pie chart by category
  const categories = {};
  expenses.forEach(exp => {
    categories[exp.type] = (categories[exp.type] || 0) + exp.amount;
  });

  const pieCtx = document.getElementById('expense-chart').getContext('2d');
  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ['#007bff','#28a745','#ffc107','#dc3545','#6f42c1']
      }]
    }
  });

  // Bar chart by date
  const dateTotals = {};
  expenses.forEach(exp => {
    dateTotals[exp.date] = (dateTotals[exp.date] || 0) + exp.amount;
  });

  const barCtx = document.getElementById('expense-bar').getContext('2d');
  if (barChart) barChart.destroy();

  barChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(dateTotals),
      datasets: [{
        label: 'Expenses by Date',
        data: Object.values(dateTotals),
        backgroundColor: '#17a2b8'
      }]
    }
  });

  // Monthly summary table
  const monthlyTotals = {};
  expenses.forEach(exp => {
    if (!exp.date) return;
    const month = exp.date.slice(0,7); // YYYY-MM
    monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
  });

  const summaryBody = document.querySelector('#monthly-summary tbody');
  summaryBody.innerHTML = "";
  Object.keys(monthlyTotals).forEach(month => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${month}</td>
      <td>₹${monthlyTotals[month]}</td>
    `;
    summaryBody.appendChild(row);
  });
}

// Dark Mode
darkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
