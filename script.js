const form=document.getElementById('expense-form');
const tableBody=document.querySelector('#expense-table tbody');
const totalDisplay=document.getElementById('total');
const loginBtn=document.getElementById('login-btn');
const usernameInput=document.getElementById('username');
const budgetInput=document.getElementById('budget');
const remainingDisplay=document.getElementById('remaining');
const darkModeBtn=document.getElementById('dark-mode-btn');

let currentUserKey=null;
let expenses=[];
let budget=0;
let editingIndex=null;
let lastDeleted=null;

function getUserKey(username){
let userId=localStorage.getItem(`userId_${username}`);
if(!userId){
userId=Date.now();
localStorage.setItem(`userId_${username}`,userId);
}
return `expenses_${userId}`;
}

/* LOGIN */
loginBtn.onclick=()=>{
const username=usernameInput.value.trim();
if(!username)return alert("Enter username");
currentUserKey=getUserKey(username);
form.style.display="block";
loadExpenses();
};

/* ADD / UPDATE */
form.onsubmit=e=>{
e.preventDefault();

let type=document.getElementById('type').value;
const custom=document.getElementById('custom-type').value.trim();
if(custom) type=custom;

const expense={
type,
date:date.value,
amount:parseFloat(amount.value)
};

if(editingIndex!==null){
expenses[editingIndex]=expense;
editingIndex=null;
}else{
expenses.push(expense);
}

saveExpenses();
renderExpenses();
form.reset();
};

/* RENDER */
function renderExpenses(){
tableBody.innerHTML="";
let total=0;

expenses.forEach((exp,index)=>{
const row=document.createElement('tr');
row.innerHTML=`
<td>${exp.type}</td>
<td>${exp.date}</td>
<td>₹${exp.amount}</td>
<td>
<button onclick="editExpense(${index})">✏️</button>
<button onclick="deleteExpense(${index})">❌</button>
</td>`;
tableBody.appendChild(row);
total+=exp.amount;
});

totalDisplay.textContent=total;
updateBudget();
}

/* EDIT POPUP */
const modal=document.getElementById("editModal");

function editExpense(index){
const exp=expenses[index];
editType.value=exp.type;
editDate.value=exp.date;
editAmount.value=exp.amount;
editingIndex=index;
modal.style.display="block";
}

function saveEdit(){
expenses[editingIndex]={
type:editType.value,
date:editDate.value,
amount:parseFloat(editAmount.value)
};
saveExpenses();
renderExpenses();
closeModal();
}

function closeModal(){
modal.style.display="none";
}

/* DELETE + UNDO */
function deleteExpense(index){
lastDeleted={data:expenses[index],index};
expenses.splice(index,1);
saveExpenses();
renderExpenses();
showToast();
}

function showToast(){
toast.style.display="block";
setTimeout(()=>toast.style.display="none",4000);
}

function undoDelete(){
if(lastDeleted){
expenses.splice(lastDeleted.index,0,lastDeleted.data);
saveExpenses();
renderExpenses();
}
}

/* STORAGE */
function saveExpenses(){
localStorage.setItem(currentUserKey,JSON.stringify(expenses));
}

function loadExpenses(){
const data=localStorage.getItem(currentUserKey);
expenses=data?JSON.parse(data):[];
renderExpenses();
}

/* BUDGET */
budgetInput.oninput=e=>{
budget=parseFloat(e.target.value)||0;
updateBudget();
};

function updateBudget(){
const total=expenses.reduce((s,e)=>s+e.amount,0);
remainingDisplay.textContent=budget-total;
}

/* DARK MODE */
darkModeBtn.onclick=()=>{
document.body.classList.toggle("dark");
};
