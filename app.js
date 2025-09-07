document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIG & STATE ---
    const API_URL = 'http://127.0.0.1:8000/api';
    let currentTasks = [];
    let editingTaskId = null;
    let taskModal; // Will hold the Bootstrap Modal instance

    // --- DOM ELEMENTS ---
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const notification = document.getElementById('notification');
    const formTitle = document.getElementById('form-title');
    const logoutBtn = document.getElementById('logout-btn');
    const filterStatus = document.getElementById('filter-status');
    const searchInput = document.getElementById('search-input');
    const addTaskBtn = document.getElementById('add-task-btn');

    // --- NOTIFICATIONS ---
    function showNotification(message, type = 'success') {
        notification.textContent = message;
        notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'}`;
        setTimeout(() => {
            notification.className = 'alert d-none';
        }, 3000);
    }

    // --- API HELPER ---
    async function apiRequest(endpoint, method = 'GET', body = null) {
        const headers = { 'Content-Type': 'application/json' };
        const token = localStorage.getItem('accessToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const config = { method, headers };
        if (body) {
            config.body = JSON.stringify(body);
        }
        try {
            const response = await fetch(`${API_URL}${endpoint}`, config);
            if (response.status === 401) {
                handleLogout();
                showNotification('Session expired. Please log in.', 'error');
                return null;
            }
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData) || 'API request failed');
            }
            return response.status === 204 ? true : await response.json();
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
            return null;
        }
    }

    // --- AUTHENTICATION ---
    async function handleLogin(e) {
        e.preventDefault();
        const credentials = { username: loginForm.username.value, password: loginForm.password.value };
        const data = await apiRequest('/token/', 'POST', credentials);
        if (data && data.access) {
            localStorage.setItem('accessToken', data.access);
            switchToDashboard();
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        const userData = { username: registerForm.username.value, password: registerForm.password.value };
        const user = await apiRequest('/register/', 'POST', userData);
        if (user) {
            showNotification('Registration successful! Please log in.', 'success');
            // Switch to login tab
            new bootstrap.Tab(document.querySelector('a[href="#login-tab"]')).show();
            registerForm.reset();
        }
    }

    function handleLogout() {
        localStorage.removeItem('accessToken');
        dashboardView.classList.add('d-none');
        authView.classList.remove('d-none');
    }

    // --- TASK RENDERING ---
    function getPriorityBadge(priority) {
        const colors = { Low: 'success', Medium: 'warning', High: 'danger' };
        return `<span class="badge bg-${colors[priority] || 'secondary'}">${priority}</span>`;
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const searchTerm = searchInput.value.toLowerCase();
        let filteredTasks = currentTasks.filter(task =>
            task.title.toLowerCase().includes(searchTerm) ||
            task.priority.toLowerCase().includes(searchTerm)
        );

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `<div class="col-12"><p class="text-center text-muted">No tasks found.</p></div>`;
            return;
        }

        filteredTasks.forEach(task => {
            const isCompleted = task.status;
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4';
            card.innerHTML = `
                <div class="card task-card h-100 shadow-sm ${isCompleted ? 'task-completed' : ''}">
                    <div class="card-body d-flex align-items-start">
                        <input type="checkbox" data-task-id="${task.id}" class="form-check-input task-status-checkbox me-3 mt-1" ${isCompleted ? 'checked' : ''}>
                        <div class="flex-grow-1">
                            <h5 class="card-title">
                                ${task.title}
                                <span class="float-end">
                                    <a href="#" class="text-primary me-2 edit-btn" data-task-id="${task.id}"><i class="bi bi-pencil-square"></i></a>
                                    <a href="#" class="text-danger delete-btn" data-task-id="${task.id}"><i class="bi bi-trash"></i></a>
                                </span>
                            </h5>
                            <p class="card-text">${task.description || ''}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <small class="text-muted">Due: ${task.due_date}</small>
                                <div>
                                    ${getPriorityBadge(task.priority)}
                                    <span class="badge ${isCompleted ? 'bg-success' : 'bg-secondary'}">${isCompleted ? 'Completed' : 'Pending'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            taskList.appendChild(card);
        });
    }

    // --- TASK CRUD ---
    async function fetchTasks() {
        const status = filterStatus.value;
        let endpoint = `/tasks/?ordering=due_date${status !== 'all' ? `&status=${status}` : ''}`;
        const data = await apiRequest(endpoint);
        if (data) {
            currentTasks = data;
            renderTasks();
        }
    }

    async function handleTaskFormSubmit(e) {
        e.preventDefault();
        const taskData = {
            title: taskForm.title.value,
            description: taskForm.description.value,
            due_date: taskForm.due_date.value,
            priority: taskForm.priority.value,
        };
        const result = editingTaskId
            ? await apiRequest(`/tasks/${editingTaskId}/`, 'PUT', taskData)
            : await apiRequest('/tasks/', 'POST', taskData);
        if (result) {
            showNotification(`Task ${editingTaskId ? 'updated' : 'created'}!`, 'success');
            taskModal.hide();
            fetchTasks();
        }
    }

    async function handleTaskActions(e) {
        e.preventDefault();
        const target = e.target.closest('.edit-btn, .delete-btn, .task-status-checkbox');
        if (!target) return;
        
        const taskId = target.dataset.taskId;
        const task = currentTasks.find(t => t.id == taskId);

        if (target.matches('.edit-btn, .edit-btn *')) {
            formTitle.textContent = 'Edit Task';
            editingTaskId = taskId;
            taskForm.title.value = task.title;
            taskForm.description.value = task.description;
            taskForm.due_date.value = task.due_date;
            taskForm.priority.value = task.priority;
            taskModal.show();
        } else if (target.matches('.delete-btn, .delete-btn *')) {
            if (confirm('Are you sure you want to delete this task?')) {
                if (await apiRequest(`/tasks/${taskId}/`, 'DELETE')) {
                    showNotification('Task deleted!', 'success');
                    fetchTasks();
                }
            }
        } else if (target.matches('.task-status-checkbox')) {
            const updatedData = { ...task, status: target.checked };
            if (await apiRequest(`/tasks/${taskId}/`, 'PUT', updatedData)) {
                showNotification('Task status updated!', 'success');
                fetchTasks();
            }
        }
    }

    function resetAndShowModal() {
        editingTaskId = null;
        formTitle.textContent = 'Add New Task';
        taskForm.reset();
        document.getElementById('task-priority').value = 'Medium'; // Reset select
    }

    // --- INITIALIZATION ---
    function switchToDashboard() {
        authView.classList.add('d-none');
        dashboardView.classList.remove('d-none');
        fetchTasks();
    }

    function init() {
        taskModal = new bootstrap.Modal(document.getElementById('task-modal'));
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        logoutBtn.addEventListener('click', handleLogout);
        taskForm.addEventListener('submit', handleTaskFormSubmit);
        taskList.addEventListener('click', handleTaskActions);
        filterStatus.addEventListener('change', fetchTasks);
        searchInput.addEventListener('input', renderTasks);
        addTaskBtn.addEventListener('click', resetAndShowModal);
        
        if (localStorage.getItem('accessToken')) {
            switchToDashboard();
        }
    }

    init();
});