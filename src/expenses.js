const currentYear = new Date().getFullYear();
const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

const labels = months.map(month => `${month} ${currentYear}`);

let data = {
    labels: labels,
    datasets: []
}

let storedData = null;

let chart = null;

let date = '';
let category = '';
let amount = 0;

let datasetIndex = 0;
let dataIndex = 0;

const date_input = document.getElementById("expensesDate");
const category_input = document.getElementById("expensesCategory");
const amount_input = document.getElementById("expensesAmount");

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

    // Save to localStorage
    localStorage.setItem("savingsArray", JSON.stringify(savingsArray));

    console.log("Savings array saved:", savingsArray);
}

function saveToLocalStorage(data) {
    localStorage.setItem("expensesData", JSON.stringify(data));
    saveTotalExpenses(data.datasets)
    saveExpensesArray(data.datasets)
    console.log('Data saved to LocalStorage with key expensesData');
    calculateAndSaveSavings();
}

function loadFromLocalStorage() {
    storedData = JSON.parse(localStorage.getItem("expensesData"));
    if (storedData) {
        data = storedData;
    }
    console.log('Data loaded from LocalStorage with key expensesData');

}

function saveTotalExpenses(datasets) {
    let totalexpenses = datasets.reduce((sum, dataset) => {
        return sum + dataset.data.reduce((innerSum, value) => innerSum + (parseFloat(value) || 0), 0);
    }, 0);

    localStorage.setItem("totalExpenses", totalexpenses.toString());

    console.log("Total Expenses Saved:", totalexpenses);
}

function saveExpensesArray(datasets) {
    let maxLength = Math.max(...datasets.map(d => d.data.length));
    let sumPerIndex = Array(maxLength).fill(0);

    datasets.forEach(dataset => {
        dataset.data.forEach((value, index) => {
            if (value !== null && value !== undefined) {
                sumPerIndex[index] += parseFloat(value) || 0;
            }
        });
    });

    let expensesDataset = {
        label: "Expenses",
        data: sumPerIndex
    };

    localStorage.setItem("expensesArray", JSON.stringify(expensesDataset));

    console.log("Expenses Array Saved:", expensesDataset);
}

function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
} 

function createArr(index, amount) {
    const arr = new Array(12).fill(null)
    arr[index] = amount;
    return arr;
}

function addToData(date, category, amount) {
    let index = 0;
    if (labels.includes(date)){
        index = labels.indexOf(date)
    }

    let color = getRandomColor();
    data.datasets.push({
        label: category,
        data: createArr(index, amount),
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1   
    })
}

function formatYearMonth(dateString) {
    let date = new Date(dateString + "-01"); // Convert "2025-01" to "2025-01-01"
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function parseMonthYear(monthYearString) {
    let [month, year] = monthYearString.split(" ");
    let date = new Date(`${month} 1, ${year}`); // Create date from "January 1, 2025"
    
    let monthNumber = String(date.getMonth() + 1).padStart(2, '0'); // Convert to "01"
    
    return `${year}-${monthNumber}`;
}

function clearFields() {
    document.getElementById("expensesDate").value = '';
    document.getElementById("expensesCategory").value = '';
    document.getElementById("expensesAmount").value = '';
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

function saveChanges() {
    date = formatYearMonth(date_input.value);

    let index = 0;
    if (labels.includes(date)){
        index = labels.indexOf(date)
    }

    data.datasets[datasetIndex].label = category_input.value;
    data.datasets[datasetIndex].data = createArr(index, amount_input.value);
    console.log(createArr(index, amount_input.value))
    console.log(data.datasets[datasetIndex]);
    createChart("expenses-chart", data);
    saveToLocalStorage(data);
}

function createChart(id, data) {

    if (chart !== null) {
        chart.destroy();
    }

    const ctx = document.getElementById(id).getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: data ? data : [],
        options: {
            scales: {
                x:{
                    stacked: true
                },
                y: {
                    beginAtZero: true,
                    stacked: true
                },
            },
            onClick: function(event, elements) {
                if (elements.length > 0) {
                    enableEditing();
                    datasetIndex = elements[0].datasetIndex; // Get dataset index
                    dataIndex = elements[0].index; // Get data index
                    const value = this.data.datasets[datasetIndex].data[dataIndex]; // Get clicked value

                    console.log(this.data.labels[dataIndex])
                    console.log(this.data.datasets[datasetIndex].label)
                    console.log("Clicked Data:", value, datasetIndex, dataIndex);

                    document.getElementById("expensesDate").value = parseMonthYear(this.data.labels[dataIndex]);
                    document.getElementById("expensesCategory").value = this.data.datasets[datasetIndex].label;
                    document.getElementById("expensesAmount").value=this.data.datasets[datasetIndex].data[dataIndex];
                }
            },
            onHover: (event, chartElement) => {
                    event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            }, 
            plugins: {
                title: {
                    display: false  ,
                    text: 'Expenses Chart'
                },
                legend: 
                {
                    display: false,
                },
            }
        }
    });
    console.log(id, data)
}

document.getElementById("expenses-add").addEventListener('click', (e) => {
    e.preventDefault();

    if (
        date_input.value.trim() === "" || 
        category_input.value.trim() === "" || 
        amount_input.value.trim() === ""
    ) {
        Swal.fire({
            title: "Error!",
            text: "Please fill out all fields!",
            icon: "warning"
        });
    }
    else {
        date = formatYearMonth(date_input.value);
        category = category_input.value;
        amount = parseFloat(amount_input.value).toFixed(2);

        console.log(labels)

        Swal.fire({
            title: "Success!",
            text: "Data added successfully!",
            icon: "success"
        });

        clearFields();
        addToData(date, category, amount);
        saveToLocalStorage(data);
        createChart("expenses-chart", data);
    }
})

document.getElementById("expenses-edit").addEventListener('click', (e) => {
    e.preventDefault();
    Swal.fire({
        title: "Edit Data",
        text: "Click on the graph to edit values.",
        icon: "info"
    });
})

document.getElementById("expenses-save").addEventListener('click', (e) => {
    e.preventDefault();

    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          Swal.fire("Saved!", "Changes has been saved successfully!", "success");
          saveChanges();
          clearFields();
          disableEditing();
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
          clearFields();
          disableEditing();
        }
      });
})

document.getElementById("expenses-cancel").addEventListener('click', (e) => {
    e.preventDefault();
    disableEditing();
    clearFields();
})

document.getElementById("expenses-clear").addEventListener('click', (e) => {
    e.preventDefault();
    clearFields();
    disableEditing();
})

function openModal() {
    const modal = document.getElementById("expensesModal");
    modal.style.display = "flex";

    const expensesContainer = document.getElementById("expensesContainer");
    expensesContainer.innerHTML = "";

    let storedData = JSON.parse(localStorage.getItem("expensesData")) || { labels: [], datasets: [] };

    let groupedData = {};

    storedData.datasets.forEach(dataset => {
        dataset.data.forEach((amount, index) => {
            if (amount !== null && amount !== 0) {
                let month = storedData.labels[index];

                if (!groupedData[month]) {
                    groupedData[month] = [];
                }

                groupedData[month].push({
                    category: dataset.label,
                    amount: amount
                });
            }
        });
    });

    if (Object.keys(groupedData).length === 0) {
        expensesContainer.innerHTML = `<p id="noDataMessage">No data available</p>`;
    } else {
        let sortedMonths = Object.keys(groupedData).sort((a, b) => {
            return new Date(a) - new Date(b);
        });

        sortedMonths.forEach(month => {
            let monthGroup = document.createElement("div");
            monthGroup.classList.add("month-group");
            monthGroup.innerHTML = `<h3>${month}</h3>`;

            let list = document.createElement("ul");

            groupedData[month].forEach(entry => {
                let listItem = document.createElement("li");
                listItem.innerHTML = `
                    <strong>Category:</strong> ${entry.category} <br>
                    <strong>Amount:</strong> ₱ ${entry.amount}
                `;
                list.appendChild(listItem);
            });

            monthGroup.appendChild(list);
            expensesContainer.appendChild(monthGroup);
        });
    }
}

document.getElementById("openModal-expenses").addEventListener("click", () => {
    openModal();
});

document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("expensesModal").style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("expensesModal")) {
        document.getElementById("expensesModal").style.display = "none";
    }
});

document.getElementById("reset-history-expenses").addEventListener('click', () => {
    Swal.fire({
        title: "Are you sure?",
        text: "This will remove all expenses data!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, keep it"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem("expensesData");
            localStorage.removeItem("expensesArray");
            localStorage.removeItem("totalExpenses");
            Swal.fire("Deleted!", "All expenses data has been deleted.", "success").then(() => {
                data = [];
                createChart("expenses-chart", data);
                calculateAndSaveSavings();
            });
        }
    });
})

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    createChart("expenses-chart", data);
});