// Constants and DOM Elements
const taskList = document.getElementById("taskList");
const emptyText = document.getElementById("emptyText");
const taskModal = document.getElementById("taskModal");
const passwordModal = document.getElementById("passwordModal");
const passwordInput = document.getElementById("passwordInput");
const modalTitle = document.getElementById("modalTitle");

const taskTitle = document.getElementById("taskTitle");
const taskCategory = document.getElementById("taskCategory");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");

const searchInput = document.getElementById("searchInput");
const categoryTabs = document.querySelectorAll(".category-tab");
const appLogo = document.getElementById("appLogo");
const headerGreeting = document.getElementById("headerGreeting");

const darkToggle = document.getElementById("darkToggle");

const quotes = {
  Deva: [
    "Push yourself, because no one else is going to do it for you.",
    "Success doesn’t come to you. You go to it.",
    "Your limitation—it’s only your imagination.",
  ],
  Amirtha: [
    "Believe you can and you're halfway there.",
    "Dream it. Wish it. Do it.",
    "Don’t wait for opportunity. Create it.",
  ]
};

let currentUser = "Deva";
let tasks = [];
let activeCategory = "All";

const passwords = {
  Deva: "devamirtha3019",
  Amirtha: "devamirtha3019"
};

// ================= INIT =================
init();

function init() {
  loadTasks();
  loadTheme();
  renderTasks();
  updateGreeting();
  showMotivation();
  requestNotificationPermission();
  trackStreaks();
}

// ================= USER SWITCHING =================
appLogo.addEventListener("dblclick", () => {
  const nextUser = currentUser === "Deva" ? "Amirtha" : "Deva";
  modalTitle.textContent = `Switch to ${nextUser}? Enter Password`;
  passwordInput.value = "";
  passwordModal.classList.remove("hidden");
});

function validatePassword() {
  const nextUser = currentUser === "Deva" ? "Amirtha" : "Deva";
  const entered = passwordInput.value;
  if (entered === passwords[nextUser]) {
    currentUser = nextUser;
    closePasswordModal();
    updateGreeting();
    loadTasks();
    renderTasks();
    showMotivation();
  } else {
    alert("Incorrect password!");
  }
}

function closePasswordModal() {
  passwordModal.classList.add("hidden");
}

// ================= THEME =================
darkToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", document.documentElement.classList.contains("dark") ? "dark" : "light");
});

function loadTheme() {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  }
}

// ================= MOTIVATION =================
function showMotivation() {
  const quoteArr = quotes[currentUser] || [];
  const randomQuote = quoteArr[Math.floor(Math.random() * quoteArr.length)];
  headerGreeting.textContent = `Hello, ${currentUser} 👋 — "${randomQuote}"`;
}

function updateGreeting() {
  const quoteArr = quotes[currentUser] || [];
  const randomQuote = quoteArr[Math.floor(Math.random() * quoteArr.length)];
  headerGreeting.textContent = `Hello, ${currentUser} 👋 — "${randomQuote}"`;
}

// ================= TASK HANDLING =================
document.getElementById("addTaskBtn").addEventListener("click", () => {
  taskModal.classList.remove("hidden");
});

function closeModal() {
  taskModal.classList.add("hidden");
  clearModalFields();
}

function clearModalFields() {
  taskTitle.value = "";
  taskCategory.value = "Study";
  taskDate.value = "";
  taskTime.value = "";
}

function addTask() {
  if (!taskTitle.value.trim()) {
    alert("Task title is required!");
    return;
  }

  const task = {
    id: Date.now(),
    title: taskTitle.value.trim(),
    category: taskCategory.value,
    date: taskDate.value,
    time: taskTime.value,
    done: false
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  closeModal();
  scheduleReminder(task);
  triggerStreakUpdate();
}

function loadTasks() {
  tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
}

function saveTasks() {
  localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
}

// ================= RENDERING =================
function renderTasks() {
  const filtered = tasks.filter(t => {
    const matchCategory = activeCategory === "All" || t.category === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(searchInput.value.toLowerCase());
    return matchCategory && matchSearch;
  });

  taskList.innerHTML = "";

  if (filtered.length === 0) {
    emptyText.classList.remove("hidden");
  } else {
    emptyText.classList.add("hidden");
    filtered.forEach(t => {
      const div = document.createElement("div");
      div.className = "p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md transition duration-300 flex flex-col gap-2 border border-gray-200 dark:border-gray-700";
      div.innerHTML = `
        <h3 class="font-semibold text-lg line-clamp-2 ${t.done ? 'line-through text-gray-400' : ''}">${t.title}</h3>
        <p class="text-sm text-gray-500">🗂 ${t.category} | 📅 ${t.date || "No date"} | ⏰ ${t.time || "No time"}</p>
        <div class="flex justify-between items-center mt-2">
          <button class="text-sm text-white ${t.done ? 'bg-green-500' : 'bg-blue-500'} px-3 py-1 rounded-lg hover:opacity-90 transition" onclick="toggleDone(${t.id})">
            ${t.done ? 'Completed' : 'Mark Done'}
          </button>
          <button class="text-red-500 hover:text-red-700 text-lg" onclick="deleteTask(${t.id})"><i class="ph ph-trash"></i></button>
        </div>
      `;
      taskList.appendChild(div);
    });
  }

  updateCategoryCounts();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  renderTasks();
  if (task.done) confetti();
}

// ================= CATEGORY =================
categoryTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    categoryTabs.forEach(t => t.classList.remove("active-tab"));
    tab.classList.add("active-tab");
    activeCategory = tab.textContent.trim().split(" ")[0];
    renderTasks();
  });
});

function updateCategoryCounts() {
  const counts = {
    All: tasks.length,
    Study: tasks.filter(t => t.category === "Study").length,
    Work: tasks.filter(t => t.category === "Work").length,
    Daily: tasks.filter(t => t.category === "Daily").length
  };

  document.getElementById("count-all").textContent = counts.All;
  document.getElementById("count-study").textContent = counts.Study;
  document.getElementById("count-work").textContent = counts.Work;
  document.getElementById("count-daily").textContent = counts.Daily;
}

// ================= SEARCH =================
searchInput.addEventListener("input", renderTasks);

// ================= NOTIFICATIONS =================
function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }
}

function scheduleReminder(task) {
  if (!task.date || !task.time || Notification.permission !== "granted") return;

  const dateTime = new Date(`${task.date}T${task.time}`);
  const delay = dateTime - Date.now();

  if (delay > 0) {
    setTimeout(() => {
      new Notification(`Reminder: ${task.title}`, {
        body: `Category: ${task.category}`,
      });
    }, delay);
  }
}

// ================= STREAKS =================
function trackStreaks() {
  const today = new Date().toISOString().split("T")[0];
  const streakKey = `streak_${currentUser}`;
  const lastKey = `lastActive_${currentUser}`;
  const lastDate = localStorage.getItem(lastKey);
  let streak = Number(localStorage.getItem(streakKey) || 0);

  if (lastDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (lastDate === yesterdayStr) {
    streak += 1;
  } else {
    streak = 1;
  }

  localStorage.setItem(lastKey, today);
  localStorage.setItem(streakKey, streak);

  console.log(`${currentUser} streak: ${streak} days`);
}

function triggerStreakUpdate() {
  localStorage.setItem(`lastActive_${currentUser}`, new Date().toISOString().split("T")[0]);
  trackStreaks();
}
