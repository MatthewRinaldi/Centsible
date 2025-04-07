const model = require("../models/expense");
const user = require("../models/user");

// View all expenses
exports.getExpenses = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect("/users/login");
        }

        const expenses = await model.find({ user: req.session.user }).sort({ date: -1 });

        const currentUser = await user.findById(req.session.user);
        let totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

        res.render("expenses/expenses", {
            expenses,
            user: currentUser,
            totalExpense
        });
    } catch (err) {
        console.error("Error fetching expenses:", err);
        next(err);
    }
};

// View single expense
exports.getExpense = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/users/login");
    }

    const id = req.params.id;

    model.findOne({ _id: id, user: req.session.user })
        .then(expense => {
            if (!expense) {
                return res.status(404).render("errors/404", { message: "Expense not found" });
            }

            const formattedExpense = {
                ...expense._doc,
                amount: parseFloat(expense.amount).toFixed(2),
                date: expense.date ? new Date(expense.date).toLocaleDateString() : "N/A"
            };

            res.render("expenses/expense", { formattedExpense, expense, currentPage: 'details' });
        })
        .catch(err => {
            console.error("Error fetching expense:", err);
            next(err);
        });
};

// Show new expense form
exports.getNewExpense = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/users/login");
    }

    user.findById(req.session.user)
        .then(user => {
            res.render("expenses/new", { user, currentPage: 'new' });
        })
        .catch(err => next(err));
};

// Create new expense
exports.createExpense = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/users/login");
    }

    const { expenseName, expenseAmount, expenseCategory, expenseDate } = req.body;
    const parsedAmount = parseFloat(expenseAmount);

    if (isNaN(parsedAmount) || parsedAmount < 0) {
        return res.status(400).render("expenses/new", {
            error: "Invalid amount entered.",
            currentPage: 'new'
        });
    }

    const expenseData = {
        name: expenseName || "Untitled Expense",
        amount: parsedAmount.toFixed(2),
        category: expenseCategory || "Uncategorized",
        date: expenseDate ? new Date(expenseDate) : new Date(),
        user: req.session.user
    };

    const expense = new model(expenseData);

    expense.save()
        .then(() => res.redirect("/expenses"))
        .catch(err => {
            if (err.name === "ValidationError") {
                return res.status(400).render("expenses/new", {
                    error: "Invalid data. Please check your input.",
                    currentPage: 'new'
                });
            }
            next(err);
        });
};

// Show edit form
exports.getEditExpenseForm = (req, res, next) => {
    const id = req.params.id;

    model.findOne({ _id: id, user: req.session.user })
        .then(expense => {
            if (!expense) {
                return res.status(404).render("errors/404", { message: "Expense not found" });
            }

            res.render("expenses/edit", { expense, error: null });
        })
        .catch(err => {
            console.error("Error fetching expense for edit:", err);
            next(err);
        });
};

// Update expense (POST from edit)
exports.updateExpense = (req, res, next) => {
    const id = req.params.id;
    const { expenseName, expenseAmount, expenseCategory, expenseDate } = req.body;

    const updatedExpense = {
        name: expenseName,
        amount: parseFloat(expenseAmount).toFixed(2),
        category: expenseCategory,
        date: expenseDate ? new Date(expenseDate) : new Date()
    };

    model.findOneAndUpdate({ _id: id, user: req.session.user }, updatedExpense, { new: true })
        .then(() => res.redirect('/expenses'))
        .catch(err => {
            console.error("Error updating expense:", err);
            next(err);
        });
};

// Delete expense
exports.deleteExpense = (req, res, next) => {
    const id = req.params.id;

    model.findOneAndDelete({ _id: id, user: req.session.user })
        .then(() => res.redirect('/expenses'))
        .catch(err => {
            console.error("Error deleting expense:", err);
            next(err);
        });
};

// Search & filter expenses
exports.searchExpenses = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect("/users/login");
        }

        const { searchTerm, category, startDate, endDate, minAmount, maxAmount } = req.query;
        let query = { user: req.session.user };

        if (searchTerm) query.name = { $regex: searchTerm, $options: 'i' };
        if (category) query.category = category;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }
        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = parseFloat(minAmount);
            if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
        }

        const expenses = await model.find(query).sort({ date: -1 });
        const currentUser = await user.findById(req.session.user);
        const totalExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

        res.render("expenses/expenses", {
            expenses,
            user: currentUser,
            totalExpense,
            searchTerm,
            category,
            startDate,
            endDate,
            minAmount,
            maxAmount
        });

    } catch (err) {
        console.error("Error filtering expenses:", err);
        next(err);
    }
};

