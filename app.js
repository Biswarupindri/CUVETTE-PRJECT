let currentUser = null;

const sections = {
    login: document.getElementById('login-section'),
    signup: document.getElementById('signup-section'),
    dashboard: document.getElementById('dashboard-section'),
    tasks: document.getElementById('tasks-section'),
    notes: document.getElementById('notes-section')
};

// Logout handler - defined once
function handleLogout() {
    localStorage.removeItem('user');
    currentUser = null;
    window.location.hash = "#login";
    route();
}

function renderHeader() {
    const userInfo = document.getElementById("user-info");
    const logoutButton = document.getElementById("logout-btn");
    const desktopNavLinks = document.getElementById("desktop-nav");

    if (currentUser) {
        userInfo.textContent = currentUser.email;
        logoutButton.style.display = "block";
        desktopNavLinks.querySelector("#nav-dashboard").style.display = "inline";
        desktopNavLinks.querySelector("#nav-tasks").style.display = "inline";
        desktopNavLinks.querySelector("#nav-notes").style.display = "inline";
    } else {
        userInfo.textContent = "";
        logoutButton.style.display = "none";
        desktopNavLinks.querySelector("#nav-dashboard").style.display = "none";
        desktopNavLinks.querySelector("#nav-tasks").style.display = "none";
        desktopNavLinks.querySelector("#nav-notes").style.display = "none";
    }
    setActiveNavLink();
}

// Bind logout once when DOM loads
document.getElementById("logout-btn").addEventListener('click', handleLogout);

function initialize() {
    // SignUp Handler
    const signUpForm = document.getElementById('signup-form');
    signUpForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const userName = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            const res = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
            const data = await res.json();
            if (data.length > 0) {
                throw new Error("Email Exists");
            }

            const createUser = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName, email, password })
            });

            const createdUser = await createUser.json();
            currentUser = createdUser;
            localStorage.setItem("user", JSON.stringify(currentUser));

            window.location.hash = "dashboard";
            route();

        } catch (err) {
            document.getElementById('signup-errors').textContent = err.message;
        }
    });

    // Login Handler
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
            const data = await res.json();

            if (data.length === 0) {
                throw new Error("Invalid Credentials");
            }

            const user = data.find(item => item.password === password);
            if (!user) {
                throw new Error("Invalid Credentials");
            }

            currentUser = user;
            localStorage.setItem("user", JSON.stringify(currentUser));
            window.location.hash = 'dashboard';
            route();

        } catch (err) {
            document.getElementById('login-errors').textContent = err.message;
        }
    });

    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    currentUser = storedUser ? JSON.parse(storedUser) : null;

    route();
    window.onhashchange = route;
}
initialize();

function route() {
    const hash = window.location.hash || '#';
    renderHeader();

    if (currentUser) {
        const page = hash.substring(1) || 'dashboard';
        showSections(page);
        switch (page) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'tasks':
                renderTasks();
                break;
            case 'notes':
                // renderNotes();
                break;
            default:
                showSections('dashboard');
                renderDashboard();
        }
    } else {
        if (hash === '#signup') {
            showSections('signup');
        } else {
            showSections('login');
        }
    }
    setActiveNavLink();
}

function showSections(name) {
    Object.values(sections).forEach(item => item.classList.remove('active'));
    if (sections[name]) {
        sections[name].classList.add('active');
    }
}

function renderDashboard() {
    sections.dashboard.innerHTML = `
        <h2>Welcome to your Dashboard</h2> ${currentUser.userName} !<p>Choose Either Tasks or Notes to Get Started</p>
    `;
    setActiveNavLink();
}

function setActiveNavLink() {
    const hash = window.location.hash || '#dashboard';
    ['nav-dashboard', 'nav-tasks', 'nav-notes', 'mobile-nav-dashboard', 'mobile-nav-tasks', 'mobile-nav-notes'].forEach(id => {
        const link = document.getElementById(id);
        if (link) {
            link.classList.remove('active');
            if (hash.includes(link.getAttribute('href'))) {
                link.classList.add('active');
            }
        }
    });
}

// renderTasks function
// Create Read Update Delete (CRUD) operations for tasks

function tasksCRUD(currentUserID) {

    const STORAGE_KEY = "tasks-" + currentUserID;
    const BASE_URL = "http://localhost:3000/tasks";

    function loadTasksFromLocal() {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return tasks ? tasks : [];
    }

    function saveTasksToLocal(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    async function createTask(task) {
        try{
        try {
            task.userId = currentUserID;
            task.completed = false;
            task.createdAt = new Date().toISOString();
@@ -213,10 +213,10 @@
            return null;
        }

}
    }


// ?userId=currentUserID
    // ?userId=currentUserID
    async function readTasks() {
        try {
            const response = await fetch(`${BASE_URL}?userId=${currentUserID}`);
@@ -240,9 +240,9 @@
            });

            const result = await response.json();
            if(!result) {
               alert("Task not found or update failed");
               return null;
            if (!result) {
                alert("Task not found or update failed");
                return null;
            }

            let localTasks = loadTasksFromLocal();
@@ -253,20 +253,20 @@
                }
                return item;
            });
            

            saveTasksToLocal(localTasks);
            return true;



            

        } catch (error) {
            console.log("Error updating task:", error);
            return null;
        }


}
    }

    // deleteTask
    // http://localhost:3000/tasks/:taskId
@@ -302,27 +302,144 @@
}

function renderTasks() {
    const {createTask, readTasks, updateTask, deleteTask} = tasksCRUD(currentUser.id);

    // console.log("Rendering Tasks...");
    const { createTask, readTasks, updateTask, deleteTask } = tasksCRUD(currentUser.id);

    let tasks = [];

    readTasks().then((data) =>  {
    readTasks().then((data) => {
        tasks = data;
        renderList();
    })

    function renderList() {
        const list = document.getElementById("tasks-list");
        if(!list) return;
        if (!list) return;

        // list.innerHTML = tasks.length ? tasks.map(taskItemHTML).join("") : "<p>No tasks found</p>";

        if (tasks.length > 0) {
            list.innerHTML = tasks.map((item) => taskItemHTML(item)).join("");
        } else {
            list.innerHTML = "<p>No tasks found</p>";
        }   
        }


        // add delete and edit

        tasks.forEach((task) => {
            const checkBtn = document.getElementById('task-check-' + task.id)
            checkBtn.addEventListener('change', async (e) => {
                updateTask(task.id, { completed: e.target.checked }).then(() => renderTasks());
            })

            const delBtn = document.getElementById('task-del-' + task.id);
            delBtn.addEventListener('click', async () => {
                deleteTask(task.id).then(() => renderTasks());
            })

            const editBtn = document.getElementById('task-edit-' + task.id);
            editBtn.addEventListener('click', () => {
                showEditTaskModal(task, updateTask, renderTasks);
            })
        })
    }

    const addTaskButton = document.getElementById("add-task-btn");
    // console.log(addTaskButton);

    addTaskButton.addEventListener("click", () => {
        const modal = document.getElementById("task-modal");
        const form = document.getElementById("add-task-form");

        // modal.style.display = "flex";

        document.getElementById("task-modal-title").textContent = "Add New Task";
        form.reset();

        // easyMDE initialization
        setTimeout(() => {
            if (window.easyMDETask) {
                window.easyMDETask.toTextArea();
                window.easyMDETask = new EasyMDE({
                    element: document.getElementById("task-desc"),
                    autoDownloadFontAwesome: true,
                    minHeight: "200px",
                    status: false
                })
            }
        }, 100)

        form.onsubmit = async () => {
            try {
                const newTask = {
                    title: document.getElementById("task-title").value,
                    description: document.getElementById("task-desc").value,
                    priority: document.getElementById("task-priority").value,
                    color: document.getElementById("task-color").value
                }

                await createTask(newTask);
                modal.style.display = "none";
                renderTasks();

            } catch (err) {
                console.error("Error adding task:", err);
            }
        }
        modal.onclick = (event) => {
            console.log(event)
            if (event.target === modal) {
                modal.style.display = "none";
            }
        }
        modal.style.display = "flex";

    })
}


function showEditTaskModal(task, updateTask, renderTasks) {
    // console.log("showEditTaskModal called for task:");
    const modal = document.getElementById("task-modal");
    const form = document.getElementById("add-task-form");

    document.getElementById("task-modal-title").textContent = "Update the Task";
    form.querySelector("button[type='submit']").textContent = "Update Task";

    // fill the existing values in the form
    document.getElementById("task-title").value = task.title;
    document.getElementById("task-desc").value = task.description;
    document.getElementById("task-priority").value = task.priority;
    document.getElementById("task-color").value = task.color;

    // easyMDE initialization

    form.onsubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedTask = {
                title: document.getElementById("task-title").value,
                description: document.getElementById("task-desc").value,
                priority: document.getElementById("task-priority").value,
                color: document.getElementById("task-color").value
            }

            await updateTask(task.id, updatedTask);
            modal.style.display = "none";
            renderTasks();
        } catch (err) {
            console.error("Error updating task:", err);
        }
}
    modal.onclick = (event) => {
        console.log(event)
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
    modal.style.display = "flex";
}

// tasks.map((item) => taskItemHTML(item)
@@ -357,7 +474,7 @@
              </div>
          </div>
      `;
  }
}

// below function is used to change special symbols into an escaped HTML format
// > :gt; & :amp; &lt; :lt; &gt; :gt; " :quot; '
@@ -372,7 +489,7 @@
function markdownToHTML(markdown) {
    if (!window.easyMDETask) return markdown; // Ensure editor is initialized
    return window.easyMDETask.markdown(markdown);
  }
}
