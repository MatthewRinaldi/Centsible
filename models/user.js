const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {type: String},
    lastName: {type: String},
    email: {type: String},
    password: {type: String}
});

userSchema.methods.comparePassword = function(inputPassword) {
    return Promise.resolve(inputPassword == this.password);
}

module.exports = mongoose.model('User', userSchema);