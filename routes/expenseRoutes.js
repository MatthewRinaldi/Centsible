const express = require('express');
const controller = require('../controllers/expenseController');

const router = express.Router();

// View all expenses
router.get('/', controller.getExpenses);

// Create new expense
router.get('/new', controller.getNewExpense);
router.post('/', controller.createExpense);

// View a single expense
router.get('/:id', controller.getExpense);

// Edit an expense (show edit form)
router.get('/:id/edit', controller.getEditExpenseForm);

// Update an expense (handle form submission)
router.post('/:id/edit', controller.updateExpense);

// Delete an expense
router.delete('/:id', controller.deleteExpense);

router.get('/expenses', controller.getFilteredExpenses);

module.exports = router;
