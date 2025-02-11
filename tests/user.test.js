const request = require('supertest');
const app = require('../app');

describe('POST /users/login', () => {
    it('should redirect to profile on successful login', async () => {

        const response = await request(app)
        .post('/users/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            email: 'john@smith.com',
            password: '12345'
        });
        
        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/users/profile');
    });

    it('should show an error on incorrect login', async () => {

        const response = await request(app)
        .post('/users/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            email: 'ap@gmail.com',
            password: '12345'
        });

        expect(response.statusCode).toBe(302);
        expect(response.headers.location).toBe('/users/login');
    });
});