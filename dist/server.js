"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const promise_1 = __importDefault(require("mysql2/promise"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const router = (0, express_1.Router)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
// Database configuration
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'tasks_db'
};
// Database connection
let pool;
const initializeDatabase = async () => {
    try {
        console.log('Initializing database connection...');
        console.log('Database config:', { ...dbConfig, password: '****' });
        // Create initial connection without database
        const initialConnection = await promise_1.default.createConnection({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password
        });
        console.log('Initial connection established');
        // Create database if it doesn't exist
        await initialConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
        console.log('Database created or verified successfully');
        // Use the database
        await initialConnection.query(`USE ${dbConfig.database}`);
        console.log('Database selected successfully');
        // Create tasks table
        await initialConnection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
        console.log('Table created or verified successfully');
        // Close the initial connection
        await initialConnection.end();
        console.log('Initial connection closed');
        // Create connection pool with database selected
        pool = promise_1.default.createPool({
            ...dbConfig,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        // Test pool connection
        const [testResult] = await pool.query('SELECT 1');
        console.log('Connection pool created and tested successfully');
    }
    catch (error) {
        console.error('Error during database initialization:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
        }
        throw error;
    }
};
// API Routes
const testDbHandler = async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1');
        res.json({ message: 'Database connection successful', results: rows });
    }
    catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
};
const getTasksHandler = async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
        res.json({ success: true, data: rows });
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
    }
};
const createTaskHandler = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const [result] = await pool.query('INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)', [title, description, status]);
        const [newTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newTask[0] });
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ success: false, error: 'Failed to create task' });
    }
};
const updateTaskHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        await pool.query('UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?', [title, description, status, id]);
        const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (!updatedTask[0]) {
            res.status(404).json({ success: false, error: 'Task not found' });
            return;
        }
        res.json({ success: true, data: updatedTask[0] });
    }
    catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, error: 'Failed to update task' });
    }
};
const deleteTaskHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ success: false, error: 'Task not found' });
            return;
        }
        res.json({ success: true, message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, error: 'Failed to delete task' });
    }
};
// Mount routes
router.get('/test-db', testDbHandler);
router.get('/tasks', getTasksHandler);
router.post('/tasks', createTaskHandler);
router.put('/tasks/:id', updateTaskHandler);
router.delete('/tasks/:id', deleteTaskHandler);
// Mount router
app.use('/api', router);
// Start server
const startServer = async () => {
    try {
        await initializeDatabase();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Handle process termination
process.on('SIGINT', async () => {
    if (pool) {
        await pool.end();
        console.log('Database connection pool closed');
    }
    process.exit(0);
});
startServer();
