
const request = require('supertest');
const app = require('../app');

describe('POST /users/updateBudget', () => {
    it('Should not pass after sending both name and amount', async () => {
        const response = await request(app)
            .post('/users/updateBudget')
            .set('Content-Type', 'application/json')
            .send({
                categoryName: 'Groceries',
                budgetAmount: '250'
            });

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toBe('Failed to update category.');
    });
});

