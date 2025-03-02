/*const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    expenseName: {type: String},
    expenseAmount: {type: Number},
    expenseCategory: {type: String},
    user: {type: Schema.Types.ObjectId, ref:'User'}
});

module.exports = mongoose.model('Expense', expenseSchema);*/

const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("Expense", expenseSchema);