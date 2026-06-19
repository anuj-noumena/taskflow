// =============================================
// 1. STATE — Our data lives here
//    'state' = the data your app needs to function.
//    In Session 1: state lives in JS variables (lost on refresh).
//    In Session 2: state lives in React's useState hook.
//    In Session 4: state lives in a MongoDB database (permanent).
// =============================================
let tasks = []; // array of task objects — our in-memory database
let currentFilter = "all"; // tracks which filter tab is active

// =============================================
// 2. DOM REFERENCES
//    Grab all HTML elements we need ONCE at the top.
//    Store them in variables — faster than querying the DOM each time.
//    Each querySelector/getElementById is a DOM traversal — avoid repetition.
// =============================================
const taskForm = document.getElementById("taskForm");
const taskBoard = document.getElementById("taskBoard");
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskPriority = document.getElementById("taskPriority");
const taskStatus = document.getElementById("taskStatus");
const filterBtns = document.querySelectorAll(".filter-btn");

// =============================================
// 3. UTILITY — Generate a unique ID for each task
//    Why do we need IDs? We need to identify WHICH task to delete.
//    'indexOf' or positional approach breaks if tasks are reordered.
//    Unique IDs are stable — they never change.
// =============================================
function generateId() {
  // Date.now() returns milliseconds since Jan 1, 1970
  // Example: 1705746123456
  // .toString(36) converts it to base-36 (0-9 and a-z) — shorter string
  // Example: "lkq7abc"
  const timePart = Date.now().toString(36);

  // Math.random() returns a decimal between 0 and 1
  // Example: 0.7364819572
  // .toString(36) → "0.pbxqmk"
  // .slice(2) removes the "0." prefix → "pbxqmk"
  const randomPart = Math.random().toString(36).slice(2);

  return timePart + randomPart;
  // Example result: "lkq7abcpbxqmk" — always unique
}

// Alternative: crypto.randomUUID() (modern browsers)
// Example result: "550e8400-e29b-41d4-a716-446655440000"
// We'll use this in Session 3 with Node.js

// =============================================
// 4. LABEL MAPS — Convert stored values to display labels
//    We store 'high', 'medium', 'low' (short, easy to compare in code)
//    We display '🔴 High', '🟡 Medium', '🟢 Low' (nice for users)
//    The map is our translation layer between the two.
// =============================================
const priorityLabels = {
  low: "🟢 Low",
  medium: "🟡 Medium",
  high: "🔴 High",
};

const statusLabels = {
  todo: "📋 To Do",
  inprogress: "⚙️ In Progress",
  done: "✅ Done",
};

// Usage:
// priorityLabels['high']   → '🔴 High'
// priorityLabels['medium'] → '🟡 Medium'
// statusLabels['todo']     → '📋 To Do'

// =============================================
// 5. ADD TASK — Form submit handler
// =============================================
// taskForm.addEventListener("submit", function (e) {
//   e.preventDefault();

//   // Read values from form inputs
//   const title = taskTitle.value.trim();
//   // .trim() removes whitespace from start and end
//   // "  Fix bug  " → "Fix bug"
//   // This catches users who accidentally type spaces only

//   // Extra validation: don't add tasks with empty titles
//   // (HTML 'required' attribute helps, but this is a JS fallback)
//   if (title === "") {
//     // Temporarily highlight the input to signal the error
//     taskTitle.style.borderColor = "var(--danger)";
//     setTimeout(function () {
//       taskTitle.style.borderColor = ""; // reset after 1.5 seconds
//     }, 1500);
//     return; // stop execution here — don't add the task
//   }

//   // Build a new task object — a plain JavaScript object (key: value pairs)
//   const newTask = {
//     id: generateId(), // unique identifier
//     title: title, // from input
//     description: taskDesc.value.trim(), // may be empty
//     priority: taskPriority.value, // 'low' | 'medium' | 'high'
//     status: taskStatus.value, // 'todo' | 'inprogress' | 'done'
//     createdAt: new Date().toLocaleDateString("en-IN"),
//     // toLocaleDateString formats the date for a locale
//     // 'en-IN' → "20/01/2025" (India format: DD/MM/YYYY)
//     // 'en-US' → "1/20/2025" (US format: MM/DD/YYYY)
//     // 'en-GB' → "20/01/2025" (UK format)
//   };

//   // Push the new task to our array
//   tasks.push(newTask);
//   // tasks array now has one more element
//   // tasks = [{ id: 'abc123', title: 'Fix bug', ... }]

//   // Re-render the board to reflect the new task
//   renderTasks();

//   // Reset form fields
//   taskForm.reset();
//   // .reset() clears all inputs/selects/textareas to their initial values

//   // But reset() also clears select elements — manually restore defaults
//   taskPriority.value = "medium";
//   taskStatus.value = "todo";

//   // Move focus back to the title field — user can immediately type next task
//   taskTitle.focus();
// });

// // =============================================
// // 6. DELETE TASK
// //    Array.filter() is non-destructive — it creates a NEW array.
// //    We assign the new array back to 'tasks'.
// //    This is the functional programming approach — no mutation.
// // =============================================
// function deleteTask(id) {
//   // Show a confirmation dialog before deleting
//   const confirmed = confirm("Delete this task? This cannot be undone.");
//   if (!confirmed) return; // user clicked Cancel — do nothing

//   // filter() goes through every task and keeps only those
//   // where the condition returns true.
//   // We keep all tasks EXCEPT the one with the matching id.
//   tasks = tasks.filter(function (task) {
//     return task.id !== id;
//   });

//   // Visualising filter:
//   // Before: [{ id: 'a', title: 'Task 1' }, { id: 'b', title: 'Task 2' }]
//   // deleteTask('a') → filter keeps tasks where id !== 'a'
//   // After:  [{ id: 'b', title: 'Task 2' }]

//   renderTasks();
// }

// =============================================
// 7. RENDER TASKS — The core rendering function
//    This is called every time data changes.
//    It rebuilds the entire board from scratch.
//    This pattern is called "declarative rendering" —
//    describe WHAT the UI should look like, not HOW to change it step by step.
//    React does this same thing, just more efficiently.
// =============================================
function renderTasks() {
  // Step 1: Get the tasks to display based on the active filter
  let filteredTasks;

  if (currentFilter === "all") {
    filteredTasks = tasks;
    // Show everything — no filtering needed
  } else {
    filteredTasks = tasks.filter(function (task) {
      return task.status === currentFilter;
    });
    // Example: currentFilter = 'done'
    // Keeps only tasks where task.status === 'done'
  }

  // Step 2: Handle the case where there's nothing to show
  if (filteredTasks.length === 0) {
    // Ternary operator: condition ? valueIfTrue : valueIfFalse
    // Short version of an if/else for simple cases
    const message =
      currentFilter === "all"
        ? "No tasks yet. Add your first task! 🚀"
        : `No "${statusLabels[currentFilter]}" tasks found.`;

    taskBoard.innerHTML = `<p class="empty-state">${message}</p>`;
    return; // stop here — no need to continue
  }

  // Step 3: Build the HTML for all tasks
  //
  // .map() transforms every item in the array into something new.
  // Here: each task object → an HTML string.
  //
  // .join('') merges the array of strings into one big string.
  // Without join: ['<div>Task 1</div>', '<div>Task 2</div>']  (array)
  // With join(''):  '<div>Task 1</div><div>Task 2</div>'       (string)
  //
  // Then we assign the result to innerHTML — the browser renders it.

  taskBoard.innerHTML = filteredTasks
    .map(function (task) {
      return `
            <div class="task-card priority-${task.priority} status-${task.status}">

                <div class="task-info">
                    <h3 class="task-title">${task.title}</h3>

                    ${
                      task.description
                        ? `<p class="task-desc">${task.description}</p>`
                        : ""
                    }
                    <!-- Short-circuit: if description is truthy, render the <p>, else empty string -->

                    <div class="task-meta">
                        <span class="badge badge-priority-${task.priority}">
                            ${priorityLabels[task.priority]}
                        </span>
                        <span class="badge badge-status">
                            ${statusLabels[task.status]}
                        </span>
                        <span class="badge badge-status">
                            📅 ${task.createdAt}
                        </span>
                    </div>
                </div>

                <div class="task-actions">
                    <button
                        class="btn-delete"
                        onclick="deleteTask('${task.id}')"
                    >
                        🗑 Delete
                    </button>
                </div>

            </div>
        `;
    })
    .join("");
}

// =============================================
// 8. FILTER BUTTONS
// =============================================
filterBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    // Remove 'active' class from ALL buttons first
    filterBtns.forEach(function (b) {
      b.classList.remove("active");
    });

    // Add 'active' to the one that was just clicked
    // 'this' inside a regular function = the element the listener is on
    this.classList.add("active");

    // Read the data-filter attribute to know which filter was picked
    currentFilter = this.dataset.filter;
    // If user clicked <button data-filter="todo">, currentFilter = 'todo'

    renderTasks();
  });
});

// =============================================
// 9. PERSIST TO LOCALSTORAGE
//    Right now tasks disappear when you refresh.
//    localStorage is a browser key-value store — data survives page refresh.
//    It only stores STRINGS — we use JSON.stringify/parse to convert.
// =============================================

// Save tasks to localStorage every time they change
function saveTasks() {
  const tasksString = JSON.stringify(tasks);
  // JSON.stringify converts JS objects/arrays to a JSON string
  // tasks = [{ id: 'abc', title: 'Fix bug' }]
  // tasksString = '[{"id":"abc","title":"Fix bug"}]'
  localStorage.setItem("taskflow-tasks", tasksString);
}

// Load tasks from localStorage when the page loads
function loadTasks() {
  const savedString = localStorage.getItem("taskflow-tasks");
  // Returns the stored string, or null if nothing is saved yet

  if (savedString) {
    tasks = JSON.parse(savedString);
    // JSON.parse converts JSON string back to JS objects/arrays
    // savedString = '[{"id":"abc","title":"Fix bug"}]'
    // tasks = [{ id: 'abc', title: 'Fix bug' }]
  }
}

// Integrate localStorage into addTask and deleteTask
// After tasks.push(newTask), call saveTasks()
// After tasks = tasks.filter(...), call saveTasks()

// And call loadTasks() at the very start, before initial render

// Full integration (update the submit handler):
taskForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const title = taskTitle.value.trim();
  if (!title) return;

  const newTask = {
    id: generateId(),
    title: title,
    description: taskDesc.value.trim(),
    priority: taskPriority.value,
    status: taskStatus.value,
    createdAt: new Date().toLocaleDateString("en-IN"),
  };

  tasks.push(newTask);
  saveTasks(); // ← persist after every change
  renderTasks();

  taskForm.reset();
  taskPriority.value = "medium";
  taskStatus.value = "todo";
  taskTitle.focus();
});

function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  tasks = tasks.filter(function (t) {
    return t.id !== id;
  });
  saveTasks(); // ← persist after every change
  renderTasks();
}

// =============================================
// 10. INITIAL LOAD — Run when page first loads
// =============================================
loadTasks(); // Load any previously saved tasks
renderTasks(); // Render them (or show empty state)
