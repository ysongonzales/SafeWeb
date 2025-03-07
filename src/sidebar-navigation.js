const dashboard_btn = document.getElementById("dashbaord");
const income_btn = document.getElementById("income");
const expenses_btn = document.getElementById("expenses");
const goal_btn = document.getElementById("goal");
const reset_btn = document.getElementById("reset");

const dashbaord_section = document.getElementById("dashboard-section");
const income_section = document.getElementById("income-section");
const expenses_section = document.getElementById("expenses-section");
const goal_section = document.getElementById("goal-section");

const contact = "emersongonzales609@gmail.com";

document.querySelectorAll(".nav-button:not(#reset)").forEach(button => {
  button.addEventListener("click", function () {
      document.querySelectorAll(".nav-button").forEach(btn => btn.classList.remove("active"));
      this.classList.add("active");

      document.querySelectorAll("section").forEach(section => {
          section.style.display = section.id.includes(button.id) ? "flex" : "none";
      });
  });
});

document.querySelectorAll("section").forEach(section => {
  section.style.display = "none";
  if (section.id.includes('dashboard')) {
  section.style.display = "flex";
  }
});

reset_btn.addEventListener('click', () => {
  Swal.fire({
    title: "Are you sure?",
    text: "This will remove all existing data!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, keep it"
}).then((result) => {
    if (result.isConfirmed) {
        localStorage.clear()
        Swal.fire("Deleted!", "All expenses data has been deleted.", "success").then(() => {
            location.reload();
        });
    }
});
})

document.getElementById('policy').addEventListener('click', () => {
  Swal.fire({
    title: "Privacy Policy",
    html: `
        <p style="text-align: left"><b>1. Data Collection</b></p>
        <p style="text-align: left">We collect and store financial data, goals, and user preferences to improve your experience. No personal identifying information is required.
        </p>
        <br>
        <p style="text-align: left"><b>2. Use of Data</b></p>
        <p style="text-align: left">Your financial data is stored locally in your browser and is not shared with third parties.</p><br>
        <p style="text-align: left"><b>3. Security</b></p>
        <p style="text-align: left">We take precautions to secure your data, but you are responsible for managing your local storage settings.</p><br>
        <p style="text-align: left"><b>4. Changes to this Policy</b></p>
        <p style="text-align: left">We may update this policy. Continued use of the website means acceptance of any changes.</p>
        <br><br>
        <p>For inquiries, contact us at <a href="mailto:${contact}">${contact}</a>.</p>
    `
  })
})

document.getElementById('terms').addEventListener('click', () => {
  Swal.fire({
    title: "Terms of Service",
    html: `
        <p style="text-align: left"><b>1. Acceptance of Terms</b></p>
        <p style="text-align: left">By using this website, you agree to these Terms of Service. If you do not agree, please discontinue use.</p>
        <br>
        <p style="text-align: left"><b>2. Purpose</b></p>
        <p style="text-align: left">This website provides financial tracking and goal-setting tools for personal use.</p><br>
        <p style="text-align: left"><b>3. User Responsibilities</b></p>
        <p style="text-align: left">• You are responsible for entering accurate financial data.</p>
        <p style="text-align: left">• We are not liable for any financial decisions made based on this tool.</p><br>
        <p style="text-align: left"><b>4. Limitation of Liability</b></p>
        <p style="text-align: left">We are not responsible for any loss, inaccuracies, or misuse of financial data. Use this tool at your own risk.</p><br>
        <p style="text-align: left"><b>5. Modifications</b></p>
        <p style="text-align: left">We may update these terms. Continued use of the website means acceptance of any changes.</p>
        <br>
        <p>For questions, contact us at <a href="mailto:${contact}">${contact}</a>.</p>
    `
  })
})