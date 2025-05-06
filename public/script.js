// API URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');

// Load tasks when page loads
document.addEventListener('DOMContentLoaded', loadTasks);

// Form submit handler
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const task = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        status: document.getElementById('status').value
    };

    try {
        if (taskId) {
            await updateTask(taskId, task);
        } else {
            await createTask(task);
        }
        resetForm();
        loadTasks();
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao salvar tarefa');
    }
});

// Load all tasks
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        const tasks = await response.json();
        
        taskList.innerHTML = tasks.map(task => `
            <tr>
                <td>${task.title}</td>
                <td>${task.description}</td>
                <td><span class="status-badge status-${task.status}">${getStatusText(task.status)}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary btn-action" onclick="editTask(${task.id})">Editar</button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="deleteTask(${task.id})">Excluir</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao carregar tarefas');
    }
}

// Create new task
async function createTask(task) {
    const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    });
    
    if (!response.ok) {
        throw new Error('Erro ao criar tarefa');
    }
}

// Update existing task
async function updateTask(id, task) {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    });
    
    if (!response.ok) {
        throw new Error('Erro ao atualizar tarefa');
    }
}

// Delete task
async function deleteTask(id) {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erro ao excluir tarefa');
        }
        
        loadTasks();
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao excluir tarefa');
    }
}

// Edit task
async function editTask(id) {
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`);
        const task = await response.json();
        
        document.getElementById('taskId').value = task.id;
        document.getElementById('title').value = task.title;
        document.getElementById('description').value = task.description;
        document.getElementById('status').value = task.status;
    } catch (error) {
        console.error('Error:', error);
        alert('Erro ao carregar tarefa');
    }
}

// Reset form
function resetForm() {
    taskForm.reset();
    document.getElementById('taskId').value = '';
}

// Get status text in Portuguese
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendente',
        'in_progress': 'Em Progresso',
        'completed': 'Concluída'
    };
    return statusMap[status] || status;
} 