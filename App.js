/**
 Personal To-Do List Application
 * A comprehensive task management system
 * 
 * Features:
 * - Add, edit, delete, and complete tasks

 */

class TaskManagerApp {
    constructor() {
        // Core application state
        this.tasks = [];
        this.currentFilter = 'all';
        this.nextTaskId = 1;
        this.editingTaskId = null;
        
        // DOM element references for efficiency
        this.elements = {
            taskInput: document.getElementById('taskInputField'),
            addButton: document.getElementById('addTaskButton'),
            taskContainer: document.getElementById('taskListContainer'),
            emptyState: document.getElementById('emptyStateMessage'),
            charCount: document.getElementById('charCount'),
            editCharCount: document.getElementById('editCharCount'),
            totalCount: document.getElementById('totalCount'),
            completedCount: document.getElementById('completedCount'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            clearCompletedBtn: document.getElementById('clearCompletedBtn'),
            editModal: document.getElementById('editTaskModal'),
            editInput: document.getElementById('editTaskInput'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            cancelEditBtn: document.getElementById('cancelEditBtn'),
            saveEditBtn: document.getElementById('saveEditBtn')
        };
        
        this.initializeApplication();
    }
    
    /**
     * Initialize the application by setting up event listeners and initial state
     */
    initializeApplication() {
        this.setupEventListeners();
        this.updateTaskStatistics();
        this.renderTaskList();
        
        // Focus on input field for immediate user interaction
        this.elements.taskInput.focus();
        
        console.log('TaskMaster Pro initialized successfully');
    }
    
    /**
     * Set up all event listeners for user interactions
     */
    setupEventListeners() {
        // Task input and creation
        this.elements.taskInput.addEventListener('input', (e) => this.handleInputChange(e));
        this.elements.taskInput.addEventListener('keypress', (e) => this.handleInputKeypress(e));
        this.elements.addButton.addEventListener('click', () => this.createNewTask());
        
        // Filter controls
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterChange(e));
        });
        
        // Bulk actions
        this.elements.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());
        
        // Modal controls
        this.elements.closeModalBtn.addEventListener('click', () => this.closeEditModal());
        this.elements.cancelEditBtn.addEventListener('click', () => this.closeEditModal());
        this.elements.saveEditBtn.addEventListener('click', () => this.saveTaskEdit());
        this.elements.editInput.addEventListener('input', (e) => this.handleEditInputChange(e));
        this.elements.editInput.addEventListener('keypress', (e) => this.handleEditKeypress(e));
        
        // Close modal when clicking outside
        this.elements.editModal.addEventListener('click', (e) => {
            if (e.target === this.elements.editModal) {
                this.closeEditModal();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleGlobalKeyboard(e));
    }
    
    /**
     * Handle input field changes and update character count
     */
    handleInputChange(event) {
        const inputText = event.target.value;
        const charLength = inputText.length;
        
        // Update character counter with color coding
        this.elements.charCount.textContent = charLength;
        
        if (charLength > 80) {
            this.elements.charCount.style.color = 'var(--danger-red)';
        } else if (charLength > 60) {
            this.elements.charCount.style.color = 'var(--warning-amber)';
        } else {
            this.elements.charCount.style.color = 'var(--neutral-500)';
        }
        
        // Enable/disable add button based on content
        this.elements.addButton.disabled = charLength === 0 || charLength > 100;
    }
    
    /**
     * Handle Enter key press in main input field
     */
    handleInputKeypress(event) {
        if (event.key === 'Enter' && !this.elements.addButton.disabled) {
            this.createNewTask();
        }
    }
    
    /**
     * Handle edit input field changes
     */
    handleEditInputChange(event) {
        const inputText = event.target.value;
        const charLength = inputText.length;
        
        this.elements.editCharCount.textContent = charLength;
        
        // Color coding for character limit
        if (charLength > 80) {
            this.elements.editCharCount.style.color = 'var(--danger-red)';
        } else if (charLength > 60) {
            this.elements.editCharCount.style.color = 'var(--warning-amber)';
        } else {
            this.elements.editCharCount.style.color = 'var(--neutral-500)';
        }
        
        this.elements.saveEditBtn.disabled = charLength === 0 || charLength > 100;
    }
    
    /**
     * Handle Enter key in edit modal
     */
    handleEditKeypress(event) {
        if (event.key === 'Enter' && !this.elements.saveEditBtn.disabled) {
            this.saveTaskEdit();
        } else if (event.key === 'Escape') {
            this.closeEditModal();
        }
    }
    
    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeyboard(event) {
        // Escape key closes modal
        if (event.key === 'Escape' && !this.elements.editModal.classList.contains('hidden')) {
            this.closeEditModal();
        }
        
        // Focus input field with Ctrl+N or Cmd+N
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            this.elements.taskInput.focus();
        }
    }
    
    /**
     * Create a new task from the input field
     */
    createNewTask() {
        const taskText = this.elements.taskInput.value.trim();
        
        if (taskText === '' || taskText.length > 100) {
            return;
        }
        
        const newTask = {
            id: this.nextTaskId++,
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.tasks.unshift(newTask); // Add to beginning for recency
        this.elements.taskInput.value = '';
        this.elements.charCount.textContent = '0';
        this.elements.charCount.style.color = 'var(--neutral-500)';
        
        this.updateTaskStatistics();
        this.renderTaskList();
        
        // Keep focus on input for rapid task entry
        this.elements.taskInput.focus();
        
        // Subtle success feedback
        this.elements.addButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.elements.addButton.style.transform = '';
        }, 150);
    }
    
    /**
     * Toggle task completion status
     */
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        
        this.updateTaskStatistics();
        this.renderTaskList();
        
        // Provide audio feedback (if supported by browser)
        this.playCompletionSound(task.completed);
    }
    
    /**
     * Open edit modal for a specific task
     */
    openEditModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.editingTaskId = taskId;
        this.elements.editInput.value = task.text;
        this.elements.editCharCount.textContent = task.text.length;
        this.elements.saveEditBtn.disabled = false;
        
        this.elements.editModal.classList.remove('hidden');
        this.elements.editInput.focus();
        this.elements.editInput.select(); // Select all text for easy editing
    }
    
    /**
     * Close the edit modal
     */
    closeEditModal() {
        this.elements.editModal.classList.add('hidden');
        this.editingTaskId = null;
        this.elements.editInput.value = '';
        this.elements.editCharCount.textContent = '0';
    }
    
    /**
     * Save changes from edit modal
     */
    saveTaskEdit() {
        if (!this.editingTaskId) return;
        
        const newText = this.elements.editInput.value.trim();
        if (newText === '' || newText.length > 100) return;
        
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = newText;
            task.editedAt = new Date().toISOString();
        }
        
        this.closeEditModal();
        this.renderTaskList();
    }
    
    /**
     * Delete a specific task
     */
    deleteTask(taskId) {
        // Simple confirmation dialog
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const confirmDelete = confirm(`Are you sure you want to delete "${task.text}"?`);
        if (!confirmDelete) return;
        
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.updateTaskStatistics();
        this.renderTaskList();
    }
    
    /**
     * Handle filter button clicks
     */
    handleFilterChange(event) {
        const filterType = event.target.closest('.filter-btn').dataset.filter;
        
        // Update active filter button
        this.elements.filterButtons.forEach(btn => btn.classList.remove('active'));
        event.target.closest('.filter-btn').classList.add('active');
        
        this.currentFilter = filterType;
        this.renderTaskList();
    }
    
    /**
     * Clear all completed tasks
     */
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            alert('No completed tasks to clear!');
            return;
        }
        
        const confirmClear = confirm(`Delete ${completedCount} completed task${completedCount === 1 ? '' : 's'}?`);
        if (!confirmClear) return;
        
        this.tasks = this.tasks.filter(t => !t.completed);
        this.updateTaskStatistics();
        this.renderTaskList();
    }
    
    /**
     * Filter tasks based on current filter setting
     */
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'all':
            default:
                return this.tasks;
        }
    }
    
    /**
     * Update task statistics in header
     */
    updateTaskStatistics() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        
        this.elements.totalCount.textContent = totalTasks;
        this.elements.completedCount.textContent = completedTasks;
        
        // Update clear completed button state
        this.elements.clearCompletedBtn.disabled = completedTasks === 0;
        this.elements.clearCompletedBtn.style.opacity = completedTasks === 0 ? '0.5' : '1';
    }
    
    /**
     * Render the complete task list
     */
    renderTaskList() {
        const filteredTasks = this.getFilteredTasks();
        
        // Show/hide empty state
        if (filteredTasks.length === 0) {
            this.elements.taskContainer.style.display = 'none';
            this.elements.emptyState.style.display = 'block';
            this.updateEmptyStateMessage();
        } else {
            this.elements.taskContainer.style.display = 'flex';
            this.elements.emptyState.style.display = 'none';
        }
        
        // Clear existing tasks
        this.elements.taskContainer.innerHTML = '';
        
        // Render each task
        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.elements.taskContainer.appendChild(taskElement);
        });
    }
    
    /**
     * Update empty state message based on current filter
     */
    updateEmptyStateMessage() {
        const emptyIcon = this.elements.emptyState.querySelector('i');
        const emptyTitle = this.elements.emptyState.querySelector('h3');
        const emptyText = this.elements.emptyState.querySelector('p');
        
        switch (this.currentFilter) {
            case 'pending':
                emptyIcon.className = 'fas fa-check-circle';
                emptyTitle.textContent = 'All caught up!';
                emptyText.textContent = 'You have no pending tasks. Great job staying productive!';
                break;
            case 'completed':
                emptyIcon.className = 'fas fa-clock';
                emptyTitle.textContent = 'No completed tasks yet';
                emptyText.textContent = 'Complete some tasks to see them here and track your progress.';
                break;
            default:
                emptyIcon.className = 'fas fa-clipboard-list';
                emptyTitle.textContent = 'No tasks yet!';
                emptyText.textContent = 'Add your first task above to get started with your productivity journey.';
        }
    }
    
    /**
     * Create HTML element for a single task
     */
    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.dataset.taskId = task.id;
        
        // Format creation date
        const createdDate = new Date(task.createdAt);
        const formattedDate = this.formatRelativeTime(createdDate);
        
        taskDiv.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 title="Mark as ${task.completed ? 'pending' : 'completed'}"></div>
            <div class="task-content">
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-metadata">
                    Created ${formattedDate}
                    ${task.editedAt ? ` • Edited ${this.formatRelativeTime(new Date(task.editedAt))}` : ''}
                    ${task.completedAt ? ` • Completed ${this.formatRelativeTime(new Date(task.completedAt))}` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-task-btn" title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete-task-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const checkbox = taskDiv.querySelector('.task-checkbox');
        const editBtn = taskDiv.querySelector('.edit-task-btn');
        const deleteBtn = taskDiv.querySelector('.delete-task-btn');
        
        checkbox.addEventListener('click', () => this.toggleTaskCompletion(task.id));
        editBtn.addEventListener('click', () => this.openEditModal(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        
        return taskDiv;
    }
    
    /**
     * Format date as relative time (e.g., "2 hours ago")
     */
    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMinutes < 1) {
            return 'just now';
        } else if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
    
    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Play completion sound (if supported)
     */
    playCompletionSound(completed) {
        // Simple audio feedback using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(completed ? 800 : 400, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Audio not supported or blocked, fail silently
            console.log('Audio feedback not available');
        }
    }
}

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new TaskManagerApp();
    
    // Make app instance globally available for debugging
    window.taskApp = app;
    
    // Add some demo tasks for better initial experience (optional)
    if (window.location.search.includes('demo=true')) {
        app.tasks = [
            {
                id: 1,
                text: 'Welcome to TaskMaster Pro! Edit or delete this task to get started.',
                completed: false,
                createdAt: new Date(Date.now() - 60000).toISOString(),
                completedAt: null
            },
            {
                id: 2,
                text: 'Try marking this task as completed',
                completed: false,
                createdAt: new Date(Date.now() - 120000).toISOString(),
                completedAt: null
            },
            {
                id: 3,
                text: 'This task is already completed - great job!',
                completed: true,
                createdAt: new Date(Date.now() - 180000).toISOString(),
                completedAt: new Date(Date.now() - 60000).toISOString()
            }
        ];
        app.nextTaskId = 4;
        app.updateTaskStatistics();
        app.renderTaskList();
    }
});