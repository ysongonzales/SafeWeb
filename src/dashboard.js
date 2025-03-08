let chart = null
let savings = null;

function getLocalStorageItem(key, defaultValue) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
}

function calculateAndSaveSavings() {
    // Get income and expenses arrays from localStorage
    let incomeArray = JSON.parse(localStorage.getItem("incomeArray")) || { label: "Income", data: Array(12).fill(0) };
    let expensesArray = JSON.parse(localStorage.getItem("expensesArray")) || { label: "Expenses", data: Array(12).fill(0) };

    // Ensure both arrays have exactly 12 elements
    let incomeData = incomeArray.data.slice(0, 12).map(num => parseFloat(num) || 0);
    let expensesData = expensesArray.data.slice(0, 12).map(num => parseFloat(num) || 0);

    // Subtract per index: savings = income - expenses
    let savingsData = incomeData.map((income, index) => income - expensesData[index]);

    // Create savingsArray object
    let savingsArray = {
        label: "Savings",
        data: savingsData
    };

    savings = savingsArray.data;
    // Save to localStorage
    localStorage.setItem("savingsArray", JSON.stringify(savingsArray));

    console.log("Savings array saved:", savingsArray);
    console.log(savings)
}

function createList() {
    const goalList = getLocalStorageItem('goalList', [])
    console.log(goalList);

    const parent = document.getElementById('dashboard-goal')
    calculateAndSaveSavings();
    if (goalList.length > 0) {
        parent.innerHTML = '';
        goalList.forEach(data => {
            const card = document.createElement('div');
            card.className = 'card';
            card.id = 'card';   
            const progressValue = Math.max(0, (savings[data.id] / data.amount) * 100);
            const savingsValue = Math.max(0, savings[data.id]);

            card.innerHTML = `
                <p>${data.monthYear}: <br> ${data.name} <br> ${data.amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</p>
                <progress max="100" value="${progressValue}"></progress>
                <p>${progressValue.toFixed(2)}%</p>
                <span class="tooltip-text" id="tooltipText">Goal: ${data.amount.toLocaleString("en-PH", { style: "currency", currency: "PHP" })} <br>Current Progress: ${savingsValue.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}</span>
            `;
            parent.appendChild(card);
        })
    }
    else {
        parent.innerHTML = '';
        const p = document.createElement('p');
        p.id="noDataMessage";
        p.innerText ="No data available";
        parent.appendChild(p);

    }
}

function initialize() {
    const currentYear = new Date().getFullYear();
    const months = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    const labels = months.map(month => `${month} ${currentYear}`);

    // Fetch data from localStorage
    const expensesArray = getLocalStorageItem("expensesArray", { label: "Expenses", data: Array(12).fill(0) });
    const incomeArray = getLocalStorageItem("incomeArray", { label: "Income", data: Array(12).fill(0) });
    const savingsArray = getLocalStorageItem("savingsArray", { label: "Savings", data: Array(12).fill(0) });
    const goalArray = getLocalStorageItem("goalArray", { label: "Goal", data: Array(12).fill(0) });

    // Create the final structured data object
    const data = {
        labels: labels,
        datasets: [
            {
                label: "Income",
                data: incomeArray.data
            },
            {
                label: "Expenses",
                data: expensesArray.data
            },
            {
                label: "Savings",
                data: savingsArray.data
            },
            {
                label: "Goal",
                data: goalArray.data
            }
        ]
    };

    // Debugging: Log the final structured data object
    console.log(data);
    
    if (chart !== null) {
        chart.destroy();
    }

    const ctx = document.getElementById("dashboard-chart").getContext("2d");
    chart = new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const total_income = getLocalStorageItem('totalIncome', 0)
    const total_expenses = getLocalStorageItem('totalExpenses', 0)
    const total_savings = savingsArray.data.reduce((sum, value) => sum + value, 0) || 0;

    document.getElementById('totalIncome').innerHTML = `${total_income.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}`
    document.getElementById('totalExpenses').innerHTML = `${total_expenses.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}`
    document.getElementById('totalSavings').innerHTML = `${total_savings.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}` 
}

document.getElementById('dashboard').addEventListener('click', () => {
    initialize();
    createList();
});
document.addEventListener('DOMContentLoaded', () => {
    initialize();
    createList();
});

document.addEventListener("DOMContentLoaded", function() {
    const burgerMenu = document.getElementById("burger-menu");
    const sidebar = document.querySelector("aside");

    burgerMenu.addEventListener("click", function() {
        sidebar.classList.toggle("show");
    });

    // Close menu when clicking outside
    document.addEventListener("click", function(event) {
        if (!sidebar.contains(event.target) && event.target !== burgerMenu) {
            sidebar.classList.remove("show");
        }
    });
});
