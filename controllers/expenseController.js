/*const model = require('../models/expense');

exports.getExpenses = (req,res,next) => {
    if (req.session.user) {
        model.find()
        .then(expenses=>res.render('./expenses/expenses', {expenses}))
        .catch(err=>next(err));
    } else {
        return res.redirect('/users/profile');
    }
};

exports.getNewExpense = (req,res,next) => {
    if (req.session.user) {
        return res.render('./expenses/new');
    } else {
        return res.redirect('/users/profile');
    }
}

exports.createExpense = (req,res,next) => {
    let expense = new model(req.body);
    expense.user = req.session.user;
    expense.save()
    .then(expense=> {
        res.redirect('/expenses/' + expense._id);
    })
    .catch(err=>next);
}

exports.getExpense = (req,res,next) => {
    let id = req.params.id;
    
    model.findById(id).populate('expenseName')
    .then(expense=>{
            res.render('./expenses/expense', {expense});
    })
    .catch(err=>next(err));
}*/

const model = require("../models/expense");

exports.getExpenses = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/users/login");
    }

    model.find({ user: req.session.user })
        .sort({ date: -1 })  // Sort by date (newest first)
        .then(expenses => {
            console.log("Expenses retrieved from DB:", expenses);
            res.render("expenses/expenses", { expenses });
        })
        .catch(err => {
            console.error("Error fetching expenses:", err);
            next(err);
        });
};

exports.getNewExpense = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/users/login");
    }
    res.render("expenses/new", { error: null });
};

exports.createExpense = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/users/login");
    }

    console.log("Received Expense Data:", req.body);

    let { expenseName, expenseAmount, expenseCategory, expenseDate } = req.body;

    // Validate amount
    let parsedAmount = parseFloat(expenseAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
        console.error("Invalid amount entered:", expenseAmount);
        return res.status(400).render("expenses/new", { error: "Invalid amount entered." });
    }

    const expenseData = {
        name: expenseName || "Untitled Expense",
        amount: parsedAmount.toFixed(2),
        category: expenseCategory || "Uncategorized",
        date: expenseDate ? new Date(expenseDate) : new Date(),
        user: req.session.user,
    };

    let expense = new model(expenseData);

    expense.save()
        .then(savedExpense => {
            console.log("Expense saved successfully:", savedExpense);
            res.redirect("/expenses");
        })
        .catch(err => {
            console.error("Error saving expense:", err);

            if (err.name === "ValidationError") {
                return res.status(400).render("expenses/new", { error: "Invalid data. Please check your input." });
            }

            next(err);
        });
};

exports.getExpense = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/users/login");
    }

    let id = req.params.id;

    model.findOne({ _id: id, user: req.session.user })
        .then(expense => {
            if (!expense) {
                return res.status(404).render("errors/404", { message: "Expense not found" });
            }

            const formattedExpense = {
                ...expense._doc,
                amount: parseFloat(expense.amount).toFixed(2),
                date: expense.date ? new Date(expense.date).toLocaleDateString() : "N/A",
            };

            res.render("expenses/expense", { expense: formattedExpense });
        })
        .catch(err => {
            console.error("Error fetching expense:", err);
            next(err);
        });
};
