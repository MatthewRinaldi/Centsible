const express = require('express');
const controller = require('../controllers/userController');

const router = express.Router();

router.get('/login', controller.getLogin);

router.post('/login', controller.login);

router.get('/signup', controller.getSignup);

router.post('/signup', controller.signup);

router.get('/profile', controller.profile);

router.get('/logout', controller.logout);

router.post('/addCategory', controller.addCategory);

router.post('/updateBudget', controller.update);

router.post('/incomeUpdate', controller.income);

module.exports = router;