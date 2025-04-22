const model = require('../models/user');
const expense = require('../models/expense');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => res.render('./user/login');

exports.getSignup = (req, res, next) => res.render('./user/signup');

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await model.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
        return res.render("user/login", { error: "Invalid email or password" });
    }

    req.session.user = user;
    res.redirect("/users/profile");
};

exports.signup = (req, res, next) => {
    let user = new model(req.body);
    user.categories = [{ name: "Housing", budget: 0 }];
    user.save()
        .then(() => res.redirect('/users/login'))
        .catch(err => next(err));
};

exports.profile = async (req, res, next) => {
    let id = req.session.user;
    const currentDate = new Date();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let currentMonth = months[currentDate.getMonth()];
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
        const user = await model.findById(id);
        if (!user) return res.redirect('/users/login');

        let expenses;
        let filterName = 'All Time';

        if (req.query.type === 'current') {
            expenses = await expense.find({ user: id, date: { $gte: startOfMonth, $lte: endOfMonth } });
            filterName = 'Current Month';
        } else if (req.query.type === 'monthly' && req.query.month) {
            const monthIndex = months.indexOf(req.query.month);
            if (monthIndex === -1) return res.status(400).send("Invalid month parameter.");
            const start = new Date(currentDate.getFullYear(), monthIndex, 1);
            const end = new Date(currentDate.getFullYear(), monthIndex + 1, 0, 23, 59, 59, 999);
            expenses = await expense.find({ user: id, date: { $gte: start, $lte: end } });
            currentMonth = months[monthIndex];
            filterName = `${months[monthIndex]} ${currentDate.getFullYear()}`;
        } else {
            expenses = await expense.find({ user: id });
        }

        const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        const categoriesData = [];
        expenses.forEach(exp => {
            const found = categoriesData.find(cat => cat._id === exp.category);
            if (found) {
                found.totalSpending += exp.amount;
            } else {
                categoriesData.push({ _id: exp.category, totalSpending: exp.amount });
            }
        });

        categoriesData.sort((a, b) => b.totalSpending - a.totalSpending);

        const maxSpending = categoriesData.length ? categoriesData[0].totalSpending : 1;
        const minSpending = categoriesData.length ? categoriesData[categoriesData.length - 1].totalSpending : 1;
        const spendingRange = maxSpending - minSpending || 1;

        const minBubbleSize = 75;
        const maxBubbleSize = 200;
        categoriesData.forEach(cat => {
            const scaled = minBubbleSize + ((cat.totalSpending - minSpending) / spendingRange) * (maxBubbleSize - minBubbleSize);
            cat.scaledSize = Math.max(scaled, minBubbleSize);
        });

        const centerX = 360, centerY = 180;
        let baseRadius = maxBubbleSize / 6;
        categoriesData.sort((a, b) => b.scaledSize - a.scaledSize);

        categoriesData.forEach((cat, i) => {
            const angle = (i + 2) * (360 / categoriesData.length) * (Math.PI / 180);
            const radius = cat.scaledSize + baseRadius + (i + 10);
            cat.positionX = centerX + radius * Math.cos(angle);
            cat.positionY = centerY + radius * Math.sin(angle);
        });

        if (req.query.type === 'budget') {
            return res.json({ categories: user.categories });
        }

        if (req.query.type === 'all') {
            return res.json({
                categories: user.categories,
                categoriesData: categoriesData,
                expenses,
                user
            });
        }

        if (req.query.type) {
            return res.json({ categoriesData, currentMonth, filterName });
        }

        res.render('./user/profile', {
            user,
            expenses,
            categoriesData,
            maxSpending,
            minSpending,
            filterName,
            currentMonth,
            totalExpense // <-- Make sure this is passed to the EJS view
        });
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);
        res.redirect('/');
    });
};

exports.addCategory = (req, res, next) => {
    const { categoryName } = req.body;
    model.findById(req.session.user)
        .then(user => {
            const exists = user.categories.some(cat => cat.name === categoryName);
            if (!exists) {
                user.categories.push({ name: categoryName, budget: 0 });
                return user.save().then(() => res.status(200).json({ message: 'Category added successfully.' }));
            } else {
                return res.status(400).json({ message: 'Category already exists.' });
            }
        })
        .catch(err => next(err));
};

exports.update = (req, res, next) => {
    const { budgetAmount, categoryName } = req.body;
    model.findById(req.session.user)
        .then(user => {
            const category = user.categories.find(cat => cat.name === categoryName);
            if (category) {
                category.budget = Number(budgetAmount);
                return user.save();
            } else {
                throw new Error("Category not found");
            }
        })
        .then(() => res.status(200).json({ message: 'Category updated successfully.' }))
        .catch(err => res.status(500).json({ message: 'Failed to update category.', error: err }));
};

exports.income = (req, res) => {
    const { monthlyIncome, savingsGoal, savingsDeadline, month } = req.body;
    model.findById(req.session.user)
        .then(user => {
            user.income = {
                incomeAmount: Number(monthlyIncome),
                savingsAmount: Number(savingsGoal),
                savingsDeadline: Number(savingsDeadline),
                savingsMonth: String(month)
            };
            return user.save();
        })
        .then(() => res.redirect("/expenses"))
        .catch(err => res.status(500).json({ message: "Failed to save income and savings information." }));
};

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email, notificationsEnabled, budgetAlert } = req.body;
        const userId = req.session.user._id;
        const user = await model.findById(userId);

        if (!user) return res.status(404).send("User not found.");

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.notificationsEnabled = notificationsEnabled !== undefined ? notificationsEnabled : user.notificationsEnabled;
        user.budgetAlert = budgetAlert !== undefined ? budgetAlert === 'true' : user.budgetAlert;

        await user.save();
        res.redirect('/users/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating profile.");
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.session.user._id;
        if (!userId) return res.status(401).send('Not authenticated');

        await model.findByIdAndDelete(userId);
        req.session.destroy(err => {
            if (err) return res.status(500).send("Error logging out after deletion.");
            res.redirect('/');
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error while deleting account.');
    }
};

