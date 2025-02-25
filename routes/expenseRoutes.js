const express = require('express');
const controller = require('../controllers/expenseController');

const router = express.Router();

router.get('/', controller.getExpenses);

router.get('/new', controller.getNewExpense);

router.post('/', controller.createExpense);

router.get('/:id', controller.getExpense);

module.exports = router;