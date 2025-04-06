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

    it('should show login page again with error message on incorrect login', async () => {

        const response = await request(app)
        .post('/users/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send({
            email: 'wrong@gmail.com',
            password: '12345' // wrong password
        });
    
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('Invalid email or password'); 
    });
    
    
});