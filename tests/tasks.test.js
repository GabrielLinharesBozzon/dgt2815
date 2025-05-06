const request = require('supertest');
const express = require('express');
const mysql = require('mysql2');
const app = require('../server');

describe('Database Connection', () => {
    test('GET /api/test-db - should test database connection', async () => {
        const response = await request(app)
            .get('/api/test-db')
            .expect(200);

        expect(response.body.message).toBe('Database connection successful');
    });
});

describe('Task API Endpoints', () => {
    let testTaskId;

    // Test creating a new task
    test('POST /api/tasks - should create a new task', async () => {
        const newTask = {
            title: 'Test Task',
            description: 'This is a test task',
            status: 'pending'
        };

        const response = await request(app)
            .post('/api/tasks')
            .send(newTask)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe(newTask.title);
        expect(response.body.description).toBe(newTask.description);
        expect(response.body.status).toBe(newTask.status);

        testTaskId = response.body.id;
    });

    // Test getting all tasks
    test('GET /api/tasks - should get all tasks', async () => {
        const response = await request(app)
            .get('/api/tasks')
            .expect(200);

        expect(Array.isArray(response.body)).toBeTruthy();
        expect(response.body.length).toBeGreaterThan(0);
    });

    // Test getting a specific task
    test('GET /api/tasks/:id - should get a specific task', async () => {
        const response = await request(app)
            .get(`/api/tasks/${testTaskId}`)
            .expect(200);

        expect(response.body).toHaveProperty('id', testTaskId);
    });

    // Test updating a task
    test('PUT /api/tasks/:id - should update a task', async () => {
        const updatedTask = {
            title: 'Updated Test Task',
            description: 'This is an updated test task',
            status: 'in_progress'
        };

        const response = await request(app)
            .put(`/api/tasks/${testTaskId}`)
            .send(updatedTask)
            .expect(200);

        expect(response.body.title).toBe(updatedTask.title);
        expect(response.body.description).toBe(updatedTask.description);
        expect(response.body.status).toBe(updatedTask.status);
    });

    // Test invalid task update
    test('PUT /api/tasks/:id - should handle invalid task update', async () => {
        const invalidTask = {
            title: '', // Empty title should be invalid
            description: 'This is an invalid task',
            status: 'invalid_status'
        };

        const response = await request(app)
            .put(`/api/tasks/${testTaskId}`)
            .send(invalidTask)
            .expect(400);

        expect(response.body).toHaveProperty('error');
    });

    // Test deleting a task
    test('DELETE /api/tasks/:id - should delete a task', async () => {
        const response = await request(app)
            .delete(`/api/tasks/${testTaskId}`)
            .expect(200);

        expect(response.body.message).toBe('Task deleted successfully');
    });

    // Test deleting non-existent task
    test('DELETE /api/tasks/:id - should handle non-existent task', async () => {
        const response = await request(app)
            .delete('/api/tasks/999999')
            .expect(404);

        expect(response.body).toHaveProperty('error');
    });
}); 