const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    categories: [
        {
            name: {type: String, required: true},
            budget: {type: Number, default: 0}
        }
    ],
    income:
        {
            incomeAmount: {type: Number, default: 0},
            savingsAmount: {type: Number, default: 0},
            savingsDeadline: {type: Number, default: 0},
            savingsMonth: {type: String, default: null}
        },
    budgetAlert:{type: Boolean, default:true}
});


userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); 
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Compare stored hashed password with input password
userSchema.methods.comparePassword = function (inputPassword) {
    return bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
