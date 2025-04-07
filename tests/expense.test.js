const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/user');
const Expense = require('../models/expense');

describe('Expense Routes (Edit & Delete)', () => {
    let user;
    let editExpense;
    let deleteExpense;

    beforeAll(async () => {
        user = await User.create({
            firstName: 'Test',
            lastName: 'User',
            email: 'testuser@example.com',
            password: 'testpass123'
        });

        editExpense = await Expense.create({
            name: 'Expense to Edit',
            amount: 100,
            category: 'Misc',
            date: new Date(),
            user: user._id
        });

        deleteExpense = await Expense.create({
            name: 'Expense to Delete',
            amount: 50,
            category: 'Misc',
            date: new Date(),
            user: user._id
        });
    });

    afterAll(async () => {
        if (user) {
            await Expense.deleteMany({ user: user._id });
            await User.findByIdAndDelete(user._id);
        }
        await mongoose.connection.close();
    });

    it('should update an expense successfully', async () => {
        const response = await request(app)
            .post(`/expenses/${editExpense._id}/edit`)
            .send({
                expenseName: 'Updated Expense',
                expenseAmount: 200,
                expenseCategory: 'Updated Category',
                expenseDate: '2025-04-06'
            });

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/expenses');
    });

    it('should delete an expense successfully', async () => {
        const response = await request(app)
            .delete(`/expenses/${deleteExpense._id}/delete`); 

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/expenses');
    });
});
