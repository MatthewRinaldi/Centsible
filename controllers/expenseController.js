const model = require('../models/expense');

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
}