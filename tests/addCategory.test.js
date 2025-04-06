const request = require('supertest');
const app = require('../app');

describe('POST /users/addCategory', () => {
    it('should add a new category and respond with success', async () => {
        const response = await request(app)
            .post('/users/addCategory')
            .set('Content-Type', 'application/json')
            .send({
                categoryName: 'Test Category'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Category added');
    });

    it('should return an error when categoryName is missing', async () => {
        const response = await request(app)
            .post('/users/addCategory')
            .set('Content-Type', 'application/json')
            .send({
                categoryName: ''
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('Category name is required');
    });
});
