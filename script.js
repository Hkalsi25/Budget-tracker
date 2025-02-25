import { db, auth, collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc, updateDoc } from "./firebase.js";
import { signOutUser } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";

// ✅ Redirect unauthorized users to login
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("✅ User authenticated:", user.email);
        loadExpenses();
    } else {
        console.log("🚫 No user logged in. Redirecting to login...");
        window.location.replace("login.html");
    }
});

// ✅ Logout Functionality
document.getElementById("sign-out-btn").addEventListener("click", async () => {
    await signOutUser();
    window.location.replace("login.html");
});

// ✅ Helper Functions to Get Firestore References
const getBudgetRef = () => auth.currentUser ? doc(db, "budget", auth.currentUser.uid) : null;
const getExpensesCollection = () => auth.currentUser ? collection(db, "expenses", auth.currentUser.uid, "userExpenses") : null;

// Selecting Elements
const totalAmountInput = document.getElementById("total-amount");
const expenseAmountInput = document.getElementById("user-amount");
const setBudgetButton = document.getElementById("total-amount-button");
const addExpenseButton = document.getElementById("check-amount");
const expenseTitleInput = document.getElementById("product-title");
const resetBudgetButton = document.getElementById("reset-budget-button");
const budgetError = document.getElementById("budget-error");
const expenseTitleError = document.getElementById("product-title-error");

const amountDisplay = document.getElementById("amount");
const expenseDisplay = document.getElementById("expenditure-value");
const balanceDisplay = document.getElementById("balance-amount");
const expenseList = document.getElementById("list");

let totalBudget = 0;
let totalExpenses = 0;
let editingExpenseId = null; // Store the ID of the expense being edited

// ✅ Function to Update Budget Summary in UI
function updateUI() {
    amountDisplay.innerText = totalBudget.toFixed(2);
    expenseDisplay.innerText = totalExpenses.toFixed(2);
    balanceDisplay.innerText = (totalBudget - totalExpenses).toFixed(2);
}

// ✅ Function to Set Budget in Firestore
setBudgetButton.addEventListener("click", async () => {
    let enteredAmount = parseFloat(totalAmountInput.value);
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
        budgetError.textContent = "Value cannot be empty or negative";
        budgetError.classList.add("show");
        return;
    } else {
        budgetError.classList.remove("show");
    }

    try {
        const budgetDocRef = getBudgetRef();
        if (!budgetDocRef) return;

        const budgetSnapshot = await getDoc(budgetDocRef);
        let existingBudget = budgetSnapshot.exists() ? budgetSnapshot.data().totalBudget : 0;
        let updatedBudget = existingBudget + enteredAmount;

        await setDoc(budgetDocRef, { userId: auth.currentUser.uid, totalBudget: updatedBudget }, { merge: true });

        totalBudget = updatedBudget;
        updateUI();
    } catch (error) {
        console.error("❌ Error setting budget:", error);
    }

    totalAmountInput.value = "";
});

// ✅ Reset Budget & Clear Expenses
resetBudgetButton.addEventListener("click", async () => {
    try {
        const budgetDocRef = getBudgetRef();
        if (!budgetDocRef) return;

        await setDoc(budgetDocRef, { totalBudget: 0 });

        const expensesCollection = getExpensesCollection();
        if (!expensesCollection) return;

        const querySnapshot = await getDocs(expensesCollection);
        querySnapshot.forEach(async (expenseDoc) => {
            await deleteDoc(expenseDoc.ref);
        });

        totalBudget = 0;
        totalExpenses = 0;
        updateUI();
        expenseList.innerHTML = "";

        console.log("✅ Budget reset and all expenses deleted.");
    } catch (error) {
        console.error("❌ Error resetting budget:", error);
    }
});

// ✅ Function to Handle Adding/Updating an Expense
async function handleExpense() {
    let title = expenseTitleInput.value.trim();
    let amount = parseFloat(expenseAmountInput.value);

    if (!title || isNaN(amount) || amount <= 0) {
        expenseTitleError.textContent = "Expense amount cannot be empty or negative";
        expenseTitleError.classList.add("show");
        return;
    } else {
        expenseTitleError.classList.remove("show");
    }

    try {
        const expensesCollection = getExpensesCollection();
        if (!expensesCollection) return;

        if (editingExpenseId) {
            // ✅ Update Existing Expense
            const expenseDocRef = doc(db, "expenses", auth.currentUser.uid, "userExpenses", editingExpenseId);
            const oldExpenseSnapshot = await getDoc(expenseDocRef);

            if (oldExpenseSnapshot.exists()) {
                const oldExpenseAmount = oldExpenseSnapshot.data().amount;
                totalExpenses -= oldExpenseAmount; // Remove old expense amount before updating
            }

            await updateDoc(expenseDocRef, { title, amount });

            // ✅ Update UI
            const expenseItem = document.querySelector(`[data-id="${editingExpenseId}"]`);
            if (expenseItem) {
                expenseItem.querySelector(".product").innerText = title;
                expenseItem.querySelector(".amount").innerText = amount.toFixed(2);
            }

            totalExpenses += amount;
            editingExpenseId = null;
            addExpenseButton.textContent = "Add Expense";
        } else {
            // ✅ Add New Expense
            const docRef = await addDoc(expensesCollection, { title, amount });

            displayExpense(title, amount, docRef.id);
            totalExpenses += amount;
        }

        updateUI();
    } catch (error) {
        console.error("❌ Error handling expense:", error);
    }

    // Reset fields
    expenseTitleInput.value = "";
    expenseAmountInput.value = "";
}

// ✅ Attach Function to Button
addExpenseButton.addEventListener("click", handleExpense);

// ✅ Function to Display an Expense in UI
function displayExpense(title, amount, id) {
    let expenseItem = document.createElement("div");
    expenseItem.classList.add("sublist-content", "flex-space");
    expenseItem.setAttribute("data-id", id);
    expenseItem.innerHTML = `
        <p class="product">${title}</p>
        <p class="amount">${amount.toFixed(2)}</p>
        <button class="edit">✏️ Edit</button>
        <button class="delete">❌ Delete</button>`;

    // ✅ Edit Expense
    expenseItem.querySelector(".edit").addEventListener("click", () => {
        expenseTitleInput.value = title;
        expenseAmountInput.value = amount;
        editingExpenseId = id;
        addExpenseButton.textContent = "Update Expense";
    });

    // ✅ Delete Expense
    expenseItem.querySelector(".delete").addEventListener("click", async () => {
        try {
            await deleteDoc(doc(db, "expenses", auth.currentUser.uid, "userExpenses", id));
            totalExpenses -= amount;
            updateUI();
            expenseItem.remove();
        } catch (error) {
            console.error("❌ Error deleting expense:", error);
        }
    });

    expenseList.appendChild(expenseItem);
}

// ✅ Load Budget and Expenses from Firestore
async function loadExpenses() {
    expenseList.innerHTML = "";
    totalExpenses = 0;

    try {
        const budgetDocRef = getBudgetRef();
        if (!budgetDocRef) return;

        const budgetSnapshot = await getDoc(budgetDocRef);
        if (budgetSnapshot.exists()) {
            totalBudget = budgetSnapshot.data().totalBudget;
        }

        const expensesCollection = getExpensesCollection();
        if (!expensesCollection) return;

        const querySnapshot = await getDocs(expensesCollection);
        querySnapshot.forEach((expenseDoc) => {
            let data = expenseDoc.data();
            displayExpense(data.title, data.amount, expenseDoc.id);
            totalExpenses += data.amount;
        });

        updateUI();
    } catch (error) {
        console.error("❌ Error loading data from Firestore:", error);
    }
}
