const express = require('express');
const controller = require('../controllers/userController');

const router = express.Router();

router.get('/login', controller.getLogin);

router.post('/login', controller.login);

router.get('/profile', controller.profile);

router.get('/logout', controller.logout);

module.exports = router;