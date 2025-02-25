import { db, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc, updateDoc } from "./firebase.js";

// Firestore Collection References
const budgetDocRef = doc(db, "budget", "userBudget");
const expenseCollection = collection(db, "expenses");

// Selecting Elements
const totalAmountInput = document.getElementById("total-amount");
const expenseAmountInput = document.getElementById("user-amount");
const setBudgetButton = document.getElementById("total-amount-button");
const addExpenseButton = document.getElementById("check-amount");
const expenseTitleInput = document.getElementById("product-title");

const budgetError = document.getElementById("budget-error");
const expenseTitleError = document.getElementById("product-title-error");

const amountDisplay = document.getElementById("amount");
const expenseDisplay = document.getElementById("expenditure-value");
const balanceDisplay = document.getElementById("balance-amount");
const expenseList = document.getElementById("list");

let totalBudget = 0;
let totalExpenses = 0;
let isEditing = false;
let editExpenseId = null;

// ✅ Function to Set and Add to Budget in Firestore
setBudgetButton.addEventListener("click", async () => {
    let enteredAmount = parseFloat(totalAmountInput.value);

    if (isNaN(enteredAmount) || enteredAmount <= 0) {
        budgetError.classList.remove("hide");
        return;
    }

    budgetError.classList.add("hide");

    try {
        const budgetSnapshot = await getDoc(budgetDocRef);
        let existingBudget = budgetSnapshot.exists() ? budgetSnapshot.data().totalBudget : 0;
        let updatedBudget = existingBudget + enteredAmount;

        await setDoc(budgetDocRef, { totalBudget: updatedBudget });
        totalBudget = updatedBudget;
        updateUI();
    } catch (error) {
        console.error("Error setting budget:", error);
    }

    totalAmountInput.value = "";
});

// ✅ Function to Add or Update an Expense
async function handleExpense() {
    let title = expenseTitleInput.value.trim();
    let amount = parseFloat(expenseAmountInput.value);

    if (!title || isNaN(amount) || amount <= 0) {
        expenseTitleError.classList.remove("hide");
        return;
    }

    expenseTitleError.classList.add("hide");

    try {
        if (isEditing) {
            // ✅ Edit existing expense
            await updateDoc(doc(db, "expenses", editExpenseId), { title, amount });

            // ✅ Remove old item from UI
            document.querySelector(`[data-id='${editExpenseId}']`).remove();

            // ✅ Reset state
            isEditing = false;
            editExpenseId = null;
            addExpenseButton.textContent = "Add Expense";

        } else {
            // ✅ Add new expense
            const docRef = await addDoc(expenseCollection, { title, amount });
            displayExpense(title, amount, docRef.id);
            totalExpenses += amount;
        }

        updateUI();
    } catch (error) {
        console.error("Error handling expense:", error);
    }

    expenseTitleInput.value = "";
    expenseAmountInput.value = "";
}

// ✅ Attach Event Listener for Add/Edit Expense
addExpenseButton.addEventListener("click", handleExpense);

// ✅ Function to Display an Expense in UI
function displayExpense(title, amount, id) {
    let expenseItem = document.createElement("div");
    expenseItem.classList.add("sublist-content", "flex-space");
    expenseItem.setAttribute("data-id", id);
    expenseItem.innerHTML = `
        <p class="product">${title}</p>
        <p class="amount">${amount.toFixed(2)}</p>
        <button class="edit">✏️</button>
        <button class="delete">❌</button>
    `;

    // ✅ Edit Expense
    expenseItem.querySelector(".edit").addEventListener("click", () => {
        expenseTitleInput.value = title;
        expenseAmountInput.value = amount;
        isEditing = true;
        editExpenseId = id;
        addExpenseButton.textContent = "Update Expense";
    });

    // ✅ Delete Expense
    expenseItem.querySelector(".delete").addEventListener("click", async () => {
        try {
            await deleteDoc(doc(db, "expenses", id));
            totalExpenses -= amount;
            updateUI();
            expenseItem.remove();
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    });

    expenseList.appendChild(expenseItem);
}

// ✅ Function to Load Budget and Expenses from Firebase
async function loadExpenses() {
    console.log("🔍 Fetching data from Firebase...");
    expenseList.innerHTML = ""; 
    totalExpenses = 0;

    try {
        const budgetSnapshot = await getDoc(budgetDocRef);
        if (budgetSnapshot.exists()) {
            totalBudget = budgetSnapshot.data().totalBudget;
            console.log("✅ Budget Retrieved:", totalBudget);
        } else {
            console.warn("⚠️ No budget found in Firestore!");
        }

        const querySnapshot = await getDocs(expenseCollection);
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            console.log("✅ Expense Retrieved:", data);
            displayExpense(data.title, data.amount, doc.id);
            totalExpenses += data.amount;
        });

        updateUI();
    } catch (error) {
        console.error("❌ Error loading data from Firestore:", error);
    }
}

// ✅ Function to Update Budget Summary in UI
function updateUI() {
    amountDisplay.innerText = totalBudget.toFixed(2);
    expenseDisplay.innerText = totalExpenses.toFixed(2);
    balanceDisplay.innerText = (totalBudget - totalExpenses).toFixed(2);

    let budgetSummary = document.querySelector(".summary-section");
    if (!budgetSummary) {
        console.error("❌ Error: Budget Summary ('.summary-section') not found in DOM.");
    } else {
        console.log("✅ Budget Summary found. Ensuring it's visible.");
        budgetSummary.style.display = "block";
    }
}

// ✅ Load budget and expenses when the page loads
window.onload = () => {
    loadExpenses();
};
