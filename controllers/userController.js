const model = require('../models/user');
const expense = require('../models/expense');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res, next) => {
    return res.render('./user/login');
};

exports.getSignup = (req, res, next) => {
    return res.render('./user/signup');
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await model.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
        return res.render("user/login", { error: "Invalid email or password" });
    }

    req.session.user = user;
    res.redirect("/users/profile"); // Redirect to profile on success
};

exports.signup = (req, res, next) => {
    let user = new model(req.body);
    user.categories = [{name: "Housing", budget: 0}];
    user.save()
    .then(user => {
        res.redirect('/users/login');
    })
    .catch(err => next(err));  
};

exports.profile = async (req, res, next) => {
    let id = req.session.user;
    const currentDate = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let currentMonth = months[currentDate.getMonth()];
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
        const user = await model.findById(id);
        if (!user) {
            console.log('User not found!');
            return res.redirect('/users/login');  
        }

        let filter = {};
        let filterName = 'All Time';
        let expenses;

        if (req.query.type === 'current') {
            expenses = await expense.find({ user: id, date: { $gte: startOfMonth, $lte: endOfMonth } });
            filterName = 'Current Month';
        } else if (req.query.type === 'monthly' && req.query.month) {
            const monthIndex = months.indexOf(req.query.month);
            if (monthIndex === -1) {
                return res.status(400).send("Invalid month parameter.");
            }

            const startOfSelectedMonth = new Date(currentDate.getFullYear(), monthIndex, 1);
            const endOfSelectedMonth = new Date(currentDate.getFullYear(), monthIndex + 1, 0, 23, 59, 59, 999);

            expenses = await expense.find({
                user: id,
                date: {$gte: startOfSelectedMonth, $lte: endOfSelectedMonth}
            });
            console.log("Fetching expenses for date range:", startOfSelectedMonth, "to", endOfSelectedMonth);
            console.log("Number of expenses found:", expenses.length);

            filterName = `${months[monthIndex]} ${currentDate.getFullYear()}`;
            currentMonth = months[monthIndex];
        } else {
            expenses = await expense.find({user: id});
            filterName = 'All Time';
        }

        const categoriesData = [];

        expenses.forEach(expense => {
            const category = categoriesData.find(cat => cat._id === expense.category);

            if (category) {
                category.totalSpending += expense.amount;
            } else {
                categoriesData.push({
                    _id: expense.category,
                    totalSpending: expense.amount
                });
            }
        });
        categoriesData.sort((a, b) => b.totalSpending - a.totalSpending);

        const maxSpending = categoriesData.length > 0 ? categoriesData[0].totalSpending : 1;
        const minSpending = categoriesData.length > 0 ? categoriesData[categoriesData.length - 1].totalSpending : 1;

        const spendingRange = maxSpending - minSpending || 1;
        
        const minBubbleSize = 75;
        const maxBubbleSize = 200;

        categoriesData.forEach(category => {
            const scaledSize = minBubbleSize + ((category.totalSpending - minSpending) / spendingRange) * (maxBubbleSize - minBubbleSize);
            category.scaledSize = Math.max(scaledSize, minBubbleSize);
        });

        const centerX = 360;
        const centerY = 180;
        let baseRadius = maxBubbleSize / 6;

        categoriesData.sort((a, b) => b.scaledSize - a.scaledSize);

        // I hate math
        categoriesData.forEach((category, index) => {
            const angle = (index + 2) * (360 / categoriesData.length) * (Math.PI / 180);
            const radius = (category.scaledSize) + baseRadius + (index + 10); 

            category.positionX = centerX + radius * Math.cos(angle);
            category.positionY = centerY + radius * Math.sin(angle);
        });

        if (req.query.type === 'budget') {
            return res.json({
                categories: user.categories
            });
        } 

        if (req.query.type) {
            console.log("Returning JSON:", { categoriesData, currentMonth, filterName });
            return res.json({
                categoriesData,
                currentMonth,
                filterName
            });
        }

        res.render('./user/profile', {
            user, 
            expenses, 
            categoriesData, 
            maxSpending, 
            minSpending,
            filterName,
            currentMonth
        });
    } catch (err) {
        next(err);
    } 
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) 
            return next(err);
        res.redirect('/');  
    });
};

exports.addCategory = (req,res,next) => {
    const {categoryName} = req.body;
    let id = req.session.user;

    console.log("Received categoryName: ", categoryName);

    model.findById(id)
    .then(user => {
        
        const categoryExists = user.categories.some(cat => cat.name === categoryName);

        if (!categoryExists) {
            user.categories.push({name: categoryName, budget: 0});
            user.save()
            .then(() => {
                return res.status(200).json({ message: 'Category added successfully.' });
            })
            .catch(err=>{
                return res.status(500).json({ message: 'Error saving category.', error: err });
            });
        } else {
            return res.status(400).json({ message: 'Category already exists.' });
        }
    })
    .catch(err=>next(err));
}

exports.update = (req,res,next) => {
    const { budgetAmount, categoryName } = req.body;

    model.findById(req.session.user)
    .then(user => {
        const category = user.categories.find(cat => cat.name === categoryName);
        if (category) {
            category.budget = Number(budgetAmount);
            return user.save();
        } else {
            throw new Error("Category not found")
        }
    })
    .then(() => {
        res.status(200).json({ message: 'Category updated successfully.' })
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Failed to update category.', error: err});
    });
}
