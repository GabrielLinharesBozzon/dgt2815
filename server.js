require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tasks_db'
};

console.log('Attempting to connect to database with config:', {
    ...dbConfig,
    password: '****' // Hide password in logs
});

// Database connection
const db = mysql.createConnection(dbConfig);

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        // Try to create database if it doesn't exist
        if (err.code === 'ER_BAD_DB_ERROR') {
            const tempConnection = mysql.createConnection({
                host: dbConfig.host,
                port: dbConfig.port,
                user: dbConfig.user,
                password: dbConfig.password
            });

            tempConnection.connect((err) => {
                if (err) {
                    console.error('Error connecting to MySQL:', err);
                    return;
                }

                console.log('Connected to MySQL server successfully');

                // Create database
                tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`, (err) => {
                    if (err) {
                        console.error('Error creating database:', err);
                        return;
                    }

                    console.log('Database created successfully');
                    tempConnection.end();

                    // Create table
                    db.query(`
                        CREATE TABLE IF NOT EXISTS tasks (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            title VARCHAR(255) NOT NULL,
                            description TEXT,
                            status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                        )
                    `, (err) => {
                        if (err) {
                            console.error('Error creating table:', err);
                            return;
                        }
                        console.log('Table created successfully');
                    });
                });
            });
        }
        return;
    }
    console.log('Successfully connected to MySQL database');
});

// Test database connection
app.get('/api/test-db', (req, res) => {
    db.query('SELECT 1', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Database connection successful', results });
    });
});

// Routes
app.get('/api/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});

app.get('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM tasks WHERE id = ?', [id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json(results[0]);
    });
});

app.post('/api/tasks', (req, res) => {
    const { title, description, status } = req.body;
    
    // Validate input
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }

    const query = 'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)';
    
    db.query(query, [title, description, status], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(201).json({ id: result.insertId, title, description, status });
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Validate input
    if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
    }

    const query = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?';
    
    db.query(query, [title, description, status, id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json({ id, title, description, status });
    });
});

app.delete('/api/tasks/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM tasks WHERE id = ?';
    
    db.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Task not found' });
            return;
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

const PORT = process.env.PORT || 3000;

// Only start the server if this file is run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app; 