const expenseModal = document.getElementById('expenseModal');
const expenseForm = document.getElementById('expenseForm');
const expenseTableBody = document.getElementById('expenseTableBody');

const totalSpentDisplay = document.getElementById('totalSpentDisplay');
const budgetGoalDisplay = document.getElementById('budgetGoalDisplay');
const remainingDisplay = document.getElementById('remainingDisplay');
const budgetProgressBar = document.getElementById('budgetProgressBar');
const progressPercentage = document.getElementById('progressPercentage');
const budgetInput = document.getElementById('budgetInput');

let expenses = [];
let budgetGoal = parseFloat(localStorage.getItem('budgetGoal')) || 10000;

// --- INITIALIZATION ---

// Load data from MongoDB when the page opens
window.addEventListener('DOMContentLoaded', () => {
    budgetGoalDisplay.textContent = `₹${budgetGoal.toLocaleString()}`;
    
    fetchExpenses();
});

async function fetchExpenses() {
    try {
        const response = await fetch('http://localhost:5000/api/expenses');
        if (!response.ok) throw new Error('Failed to fetch');
        
        expenses = await response.json();
        
        renderExpenses();
        updateBudgetStats();
    } catch (err) {
        console.error("Error loading data from MongoDB:", err);
    }
}

// --- UI LOGIC ---

function toggleModal() {
    expenseModal.classList.toggle('hidden');
    expenseModal.classList.toggle('flex');
}

function editBudget() {
    budgetGoalDisplay.classList.add('hidden');
    budgetInput.value = budgetGoal;
    budgetInput.classList.remove('hidden');
    budgetInput.focus();
}

function saveBudget() {
    const value = parseFloat(budgetInput.value);
    if (!isNaN(value) && value > 0) {
        budgetGoal = value;
        budgetGoalDisplay.textContent = `₹${budgetGoal.toLocaleString()}`;
        // Optional: save budgetGoal to localStorage so it stays after refresh
        localStorage.setItem('budgetGoal', budgetGoal);
    }
    budgetInput.classList.add('hidden');
    budgetGoalDisplay.classList.remove('hidden');
    updateBudgetStats();
}

// --- DATA RENDERING ---

function renderExpenses() {
    if (expenses.length === 0) {
        expenseTableBody.innerHTML = `<tr><td colspan="5" class="px-10 py-6 text-center text-slate-400">No expenses found.</td></tr>`;
        return;
    }

    expenseTableBody.innerHTML = expenses.map(expense => `
        <tr class="border-b border-slate-50 hover:bg-slate-50/50 transition">
            <td class="px-10 py-6 font-bold text-slate-400">
                ${expense.date ? new Date(expense.date).toLocaleDateString() : 'Today'}
            </td>
            <td class="px-10 py-6">
                <span class="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
                    ${expense.category}
                </span>
            </td>
            <td class="px-10 py-6 text-slate-600">${expense.description}</td>
            <td class="px-10 py-6 font-black text-slate-900">₹${Number(expense.amount).toLocaleString()}</td>
            <td class="px-10 py-6 text-right">
                <span class="${expense.type === 'Split' ? 'text-orange-500' : 'text-emerald-500'} font-black text-[10px] uppercase">
                    ${expense.type}
                </span>
            </td>
        </tr>
    `).join('');
}

function updateBudgetStats() {
    const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const remaining = budgetGoal - totalSpent;
    const percentSpent = Math.min((totalSpent / budgetGoal) * 100, 100);

    totalSpentDisplay.textContent = `₹${totalSpent.toLocaleString()}`;
    remainingDisplay.textContent = `₹${remaining.toLocaleString()}`;
    
    // Update visual progress
    budgetProgressBar.style.width = `${percentSpent}%`;
    progressPercentage.textContent = `${Math.floor(percentSpent)}%`;

    // Change color if over budget
    if (remaining < 0) {
        remainingDisplay.classList.add('text-rose-500');
        remainingDisplay.classList.remove('text-emerald-500');
    } else {
        remainingDisplay.classList.remove('text-rose-500');
        remainingDisplay.classList.add('text-emerald-500');
    }
}

// --- FORM SUBMISSION (TO MONGODB) ---

expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get values directly from form to ensure no nulls
    const amountVal = expenseForm.querySelector('input[type="number"]').value;
    const descVal = expenseForm.querySelector('input[type="text"]').value;
    const categoryVal = expenseForm.querySelector('select').value;
    const typeVal = expenseForm.querySelector('input[name="expenseType"]:checked').value;

    const newExpense = {
        amount: parseFloat(amountVal),
        description: descVal,
        category: categoryVal,
        type: typeVal
    };

    try {
        const response = await fetch('http://localhost:5000/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newExpense)
        });

        if (response.ok) {
            const savedExpense = await response.json();
            
            // Add to the top of the list
            expenses.unshift(savedExpense);
            
            // UI Updates
            renderExpenses();
            updateBudgetStats();
            
            // Reset and close
            expenseForm.reset();
            toggleModal();
        } else {
            alert("Failed to save to database.");
        }
    } catch (err) {
        console.error("Connection error:", err);
        alert("Cannot reach the server. Make sure your backend is running on port 5000.");
    }
});