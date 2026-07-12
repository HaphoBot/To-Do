const inputTask = document.getElementById("enter-task");
const buttonTask = document.getElementById("add-task");
const ulIncomplete = document.getElementById("incomplete-task");
const ulCompleted = document.getElementById("completed-task");
const trashAudio = document.getElementById("trash");
const completeAudio = document.getElementById("complete-sound");
const changeThema = document.getElementById("change-thema");
const switchDiv = document.getElementById("switch");

const STORAGE_KEY = "todoTasks";
const THEME_KEY = "todoTheme";

/* ---------- Работа с localStorage ---------- */

function loadTasksFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  try {
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveTasksToStorage() {
  const tasks = [];

  document.querySelectorAll("#incomplete-task > li").forEach((li) => {
    tasks.push({
      id: li.dataset.id,
      text: li.querySelector("div").textContent,
      completed: false,
    });
  });

  document.querySelectorAll("#completed-task > li").forEach((li) => {
    tasks.push({
      id: li.dataset.id,
      text: li.querySelector("div").textContent,
      completed: true,
    });
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ---------- Создание разметки задачи ---------- */

function createTaskElement(id, text, completed) {
  const li = document.createElement("li");
  li.dataset.id = id;

  const div = document.createElement("div");
  div.contentEditable = completed ? "false" : "true";
  div.textContent = text;
  div.addEventListener("input", saveTasksToStorage);

  const checkImg = document.createElement("img");
  checkImg.src = "./media/green_checkmark.png";
  checkImg.alt = "";
  checkImg.tabIndex = 0;
  checkImg.className = "focus";
  checkImg.addEventListener("click", taskCompleted);

  const trashImg = document.createElement("img");
  trashImg.src = "./media/trash.png";
  trashImg.tabIndex = 0;
  trashImg.className = "focus";
  trashImg.addEventListener("click", deleteTask);

  li.appendChild(div);
  li.appendChild(checkImg);
  li.appendChild(trashImg);

  return li;
}

/* ---------- Основные действия ---------- */

function addNewTask() {
  const text = inputTask.value.trim();
  if (!text) return;

  const id = generateId();
  const li = createTaskElement(id, text, false);
  ulIncomplete.appendChild(li);

  inputTask.value = "";
  saveTasksToStorage();
}

function deleteTask(e) {
  const li = e.target.closest("li");
  li.remove();
  trashAudio.currentTime = 0;
  trashAudio.volume = 0.2;
  trashAudio.play();
  saveTasksToStorage();
}

function taskCompleted(e) {
  const li = e.target.closest("li");
  const div = li.querySelector("div");

  if (li.parentElement.id === "incomplete-task") {
    ulCompleted.appendChild(li);
    div.contentEditable = "false";
    completeAudio.currentTime = 0;
    completeAudio.volume = 0.2;
    completeAudio.play();
  } else {
    ulIncomplete.appendChild(li);
    div.contentEditable = "true";
  }
  saveTasksToStorage();
}

/* ---------- Восстановление списка при загрузке ---------- */

function renderTasksFromStorage() {
  const tasks = loadTasksFromStorage();

  ulIncomplete.innerHTML = "";
  ulCompleted.innerHTML = "";

  tasks.forEach((task) => {
    const li = createTaskElement(task.id, task.text, task.completed);
    (task.completed ? ulCompleted : ulIncomplete).appendChild(li);
  });
}

/* ---------- Тема ---------- */

function applyTheme(isDark) {
  const main = isDark ? "rgb(48 96 94)" : "rgb(167, 255, 252)";
  document.documentElement.style.setProperty("--main-color", main);
  document.body.style.background = isDark ? "#222" : "none";
  switchDiv.style.background = isDark ? "#fff" : "#000";
  switchDiv.style.right = isDark ? "80px" : "10px";
}

function loadTheme() {
  const isDark = localStorage.getItem(THEME_KEY) === "dark";
  applyTheme(isDark);
}

changeThema.addEventListener("click", () => {
  const isDarkNow = switchDiv.style.right === "80px";
  const willBeDark = !isDarkNow;
  applyTheme(willBeDark);
  localStorage.setItem(THEME_KEY, willBeDark ? "dark" : "light");
});

/* ---------- Слушатели и инициализация ---------- */

buttonTask.addEventListener("click", addNewTask);
inputTask.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addNewTask();
});

document.addEventListener("DOMContentLoaded", () => {
  renderTasksFromStorage();
  loadTheme();
});
