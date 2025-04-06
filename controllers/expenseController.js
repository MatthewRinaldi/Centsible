const controller = require('../controllers/expenseController');
const model = require("../models/expense");
const user = require("../models/user");

exports.getExpenses = async (req, res, next) => {
    try {
        if (!req.session.user) {
            return res.redirect("/users/login");
        }

        model.find({ user: req.session.user })
        .sort({ date: -1 })  // Sort by date (newest first)
        .then(expenses => {
            console.log("Expenses retrieved from DB:", expenses);
            user.findById(req.session.user)
            .then(user => {
                let totalExpense = 0
                expenses.forEach(expense => {
                    totalExpense = totalExpense + expense.amount;
                })
                res.render("expenses/expenses", { expenses, user, totalExpense });
            })
            .catch(err=>next(err));
        })
        .catch(err => {
            console.error("Error fetching expenses:", err);
            next(err);
        });
    }
    catch (err) {
        throw new Error(err);
    }
};


exports.getNewExpense = (req, res, next) => {
    let id = req.session.user;
    if (!req.session.user) {
        return res.redirect("/users/login");
    }
    user.findById(id)
    .then(user=>{res.render("expenses/new", { user, currentPage: 'new' })})
    .catch(err=>{next(err)});
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
        return res.status(400).render("expenses/new", { error: "Invalid amount entered.", currentPage: 'new' });
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
                return res.status(400).render("expenses/new", { error: "Invalid data. Please check your input.", currentPage: 'new' });
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

            res.render("expenses/expense", { formattedExpense, expense, currentPage: 'details' });
        })
        .catch(err => {
            console.error("Error fetching expense:", err);
            next(err);
        });
        exports.searchExpenses = async (req, res, next) => {
            try {
                if (!req.session.user) {
                    return res.redirect("/users/login");
                }
        
                const { searchTerm, category, startDate, endDate, minAmount, maxAmount } = req.query;
        
                let query = { user: req.session.user };
        
                if (searchTerm) {
                    query.name = { $regex: searchTerm, $options: 'i' };
                }
        
                if (category) {
                    query.category = category;
                }
        
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
        
                res.render("expenses/expenses", {
                    expenses,
                    currentPage: 'expenses',
                    user: req.session.user,
                    searchTerm,
                    category,
                    startDate,
                    endDate,
                    minAmount,
                    maxAmount
                });
        
            } catch (err) {
                console.error("Error fetching expenses:", err);
                next(err);
            }
        };
        
        
            
};
