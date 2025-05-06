-- Create database
CREATE DATABASE IF NOT EXISTS tasks_db;
USE tasks_db;

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO tasks (title, description, status) VALUES
('Complete project documentation', 'Write detailed documentation for the Node.js CRUD application', 'pending'),
('Implement user authentication', 'Add login and registration functionality', 'in_progress'),
('Design database schema', 'Create ERD and implement database structure', 'completed'); 