const input = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const clearBtn = document.getElementById('clear-btn');
const darkToggle = document.getElementById('dark-toggle');

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let darkMode = localStorage.getItem('darkMode') === 'true';

// Fast Apply Dark Mode Immediately
if (darkMode) {
  document.body.classList.add('dark');
}

// Render tasks
function renderTodos() {
  todoList.innerHTML = '';
  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.className = "task-item flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow dark:bg-gray-700 transition-all";

    li.innerHTML = `
      <div class="flex items-center gap-3">
        <input type="checkbox" ${todo.completed ? "checked" : ""} data-index="${index}" class="toggle-checkbox h-5 w-5 text-blue-500">
        <span class="${todo.completed ? "line-through opacity-50" : ""}">${todo.text}</span>
      </div>
      <div class="flex gap-2">
        <button data-index="${index}" class="edit-btn text-blue-500 hover:text-blue-700 font-semibold">Edit</button>
        <button data-index="${index}" class="delete-btn text-red-500 hover:text-red-700 font-semibold">Delete</button>
      </div>
    `;
    todoList.appendChild(li);
  });
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Add task
addBtn.addEventListener('click', () => {
  const text = input.value.trim();
  if (text) {
    todos.push({ text, completed: false });
    input.value = '';
    renderTodos();
  }
});

// Toggle complete
todoList.addEventListener('click', (e) => {
  if (e.target.classList.contains('toggle-checkbox')) {
    const index = e.target.dataset.index;
    todos[index].completed = !todos[index].completed;
    renderTodos();
  }
});

// Edit task
todoList.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-btn')) {
    const index = e.target.dataset.index;
    const newText = prompt("Edit your task:", todos[index].text);
    if (newText !== null && newText.trim() !== '') {
      todos[index].text = newText.trim();
      renderTodos();
    }
  }
});

// Delete task
todoList.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const index = e.target.dataset.index;
    todos.splice(index, 1);
    renderTodos();
  }
});

// Clear all
clearBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all tasks?')) {
    todos = [];
    renderTodos();
  }
});

// Enter key shortcut
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    addBtn.click();
  }
});

// Dark mode toggle
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  darkMode = !darkMode;
  localStorage.setItem('darkMode', darkMode);
});

// Initial render
renderTodos();
