const request = require('supertest');
const app = require('../app');

describe('POST /users/signup', () => {

    it('should redirect to login page on successful signup', async () => {
        const response = await request(app)
            .post('/users/signup')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                email: 'newuser@example.com',
                password: 'securepassword'
            });

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/users/login');
    });

    it('should redirect back to signup page if email already exists', async () => {
        const response = await request(app)
            .post('/users/signup')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                email: 'john@smith.com',
                password: '12345'
            });

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/users/signup');
    });

    it('should handle missing fields and redirect back to signup', async () => {
        const response = await request(app)
            .post('/users/signup')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                email: 'incomplete@example.com',
                password: '12345'
            });

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/users/signup');
    });
});
