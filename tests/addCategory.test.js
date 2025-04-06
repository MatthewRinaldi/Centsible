const request = require('supertest');
const app = require('../app');

describe('POST /expenses', () => {
    it('should create expense and redirect to /expenses', async () => {
        const response = await request(app)
            .post('/expenses')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                expenseName: 'Coffee',
                expenseAmount: '3.50',
                expenseCategory: 'Food',
                expenseDate: '2025-04-06'
            });

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/users/login');
    });
});
