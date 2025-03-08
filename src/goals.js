let data = [];
let savings = null;

const date_input = document.getElementById('goalDate');
const name_input = document.getElementById('goalName');
const amount_input = document.getElementById('goalAmount');

let selectedCard = null;
let selectedData = null;

let storedData = null;

function sortByMonthYear(array) {
    const monthOrder = {
        "January": 0, "February": 1, "March": 2, "April": 3,
        "May": 4, "June": 5, "July": 6, "August": 7,
        "September": 8, "October": 9, "November": 10, "December": 11
    };

    return array
        .map(item => {
            const [month, year] = item.monthYear.split(" ");
            return { ...item, id: monthOrder[month] };
        })
        .sort((a, b) => a.id - b.id);
}

function saveToLocalStorage(data) {
    data = sortByMonthYear(data);
    localStorage.setItem("goalList", JSON.stringify(data));
    console.log('Data saved to LocalStorage with key goalList', data);
    createGoalArray();
}

function loadFromLocalStorage() {
    storedData = JSON.parse(localStorage.getItem("goalList"));
    if (storedData) {
        data = storedData;
        data = sortByMonthYear(data);
        console.log('Data loaded from LocalStorage with key goalList', data);
        insertGoals();
    }
    else {
        data = []
        insertGoals();
    }
}

function createGoalArray() {
    let storedGoals = JSON.parse(localStorage.getItem("goalList")) || []; // Default to empty array if null

    let monthlySums = new Array(12).fill(0); // Initialize array with 12 zeroes

    storedGoals.forEach(goal => {
        if (goal.id >= 0 && goal.id <= 11) {
            monthlySums[goal.id] += parseFloat(goal.amount) || 0;
        }
    });

    let goalArray = {
        label: "Goal",
        data: monthlySums
    };

    localStorage.setItem("goalArray", JSON.stringify(goalArray));
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

function clearFields() {
    date_input.value = '';
    name_input.value = '';
    amount_input.value = '';
}

function enableEditing() {
    document.querySelectorAll(".default").forEach(button => {
        button.style.display = "none";
    });

    document.querySelectorAll(".edit").forEach(button => {
        button.style.display = "inline-block";
    });
}

function disableEditing() {
    document.querySelectorAll(".edit").forEach(button => {
        button.style.display = "none";
    });

    document.querySelectorAll(".default").forEach(button => {
        button.style.display = "inline-block";
    });
}

function populateInputs(data) {
    date_input.value = parseMonthYear(data.monthYear);
    name_input.value = data.name;
    amount_input.value = data.amount;
}

function formatYearMonth(dateString) {
    let date = new Date(dateString + "-01");
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function parseMonthYear(monthYearString) {
    let [month, year] = monthYearString.split(" ");
    let date = new Date(`${month} 1, ${year}`);
    
    let monthNumber = String(date.getMonth() + 1).padStart(2, '0');
    
    return `${year}-${monthNumber}`;
}

function insertGoals() {
    const parent = document.getElementById('section-goal-list')
    data = sortByMonthYear(data);
    calculateAndSaveSavings();
    if (data.length > 0) {
        parent.innerHTML = '';
        data.forEach(data => {
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
            card.addEventListener('click', () => {
                enableEditing();
                populateInputs(data);
                selectedCard = card;
                selectedData = data;
            })
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

document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", function () {
        const tooltip = this.querySelector(".tooltip-text");
        tooltip.style.opacity = tooltip.style.opacity === "1" ? "0" : "1";
        tooltip.style.visibility = tooltip.style.visibility === "visible" ? "hidden" : "visible";
    });
});

function addGoal() {
    if (!date_input.value || !amount_input.value || !name_input.value) {
        Swal.fire({
            title: "Error!",
            text: "Please fill out all fields!",
            icon: "warning"
        });
    }
    else {
        data.push({
            monthYear: formatYearMonth(date_input.value),
            name: name_input.value,
            amount: parseFloat(amount_input.value)
        });
        Swal.fire({
            title: "Success!",
            text: "Data added successfully!",
            icon: "success"
        });
        saveToLocalStorage(data);
        calculateAndSaveSavings();
    }
}

function updateGoal() {
    if (selectedCard && selectedData) {
        selectedData.monthYear = formatYearMonth(date_input.value);
        selectedData.name = name_input.value;
        selectedData.amount = amount_input.value || 0;
        insertGoals();
        calculateAndSaveSavings()
    }
}

{/* <div class="card">
    <P>January 2025: <br> Reach ₱20,000.00</P>
    <progress max="100" value="35"></progress>
    <p>35%</p>
</div> */}

document.getElementById('goals-add').addEventListener('click', (e) => {
    e.preventDefault();
    addGoal();
    clearFields();
    insertGoals();
})

document.getElementById("goals-cancel").addEventListener('click', (e) => {
    e.preventDefault();
    disableEditing();
    clearFields();
})

document.getElementById("goals-clear").addEventListener('click', (e) => {
    e.preventDefault();
    disableEditing();
    clearFields();
})

document.getElementById('goals-edit').addEventListener('click', (e) => {
    Swal.fire({
        title: "Edit Data",
        text: "Click on the goal to edit values.",
        icon: "info"
    });
})

document.getElementById('goals-save').addEventListener('click', (e) => {
    e.preventDefault();
    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire("Saved!", "Changes has been saved successfully!", "success");
          updateGoal();
          clearFields();
          disableEditing();
          saveToLocalStorage(data);
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
          clearFields();
          disableEditing();
        }
      });
})

document.getElementById("reset-history-goals").addEventListener('click', (e) => {
    e.preventDefault();
    Swal.fire({
        title: "Are you sure?",
        text: "This will remove all goal data!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, keep it"
    }).then((result) => {
        if (result.isConfirmed) {
            data = [];
            disableEditing();
            clearFields();
            insertGoals();
            localStorage.removeItem('goalList');
            Swal.fire("Deleted!", "All goal data has been deleted.", "success").then(() => {
                location.reload();
            });
        }
    });
})

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    calculateAndSaveSavings();
})