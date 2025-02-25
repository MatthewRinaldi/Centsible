const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    expenseName: {type: String},
    expenseAmount: {type: Number},
    expenseCategory: {type: String},
    user: {type: Schema.Types.ObjectId, ref:'User'}
});

module.exports = mongoose.model('Expense', expenseSchema);