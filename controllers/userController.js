const model = require('../models/user');
const bcrypt = require('bcryptjs');

exports.getLogin = (req,res,next) => {
    return res.render('./user/login');
};

xports.login = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;

    model.findOne({ email: email })
        .then(user => {
            if (!user) {
                console.log('Invalid email address!');
                return res.redirect('/users/login');
            }
            return bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        req.session.user = user._id;
                        return res.redirect('/users/profile');
                    } else {
                        console.log("Incorrect password!");
                        return res.redirect('/users/login');
                    }
                });
        })
        .catch(err => next(err));
};

exports.profile = (req,res,next) => {
    let id = req.session.user;
    model.findById(id)
    .then(user=>{
        if(!user){
            console.log('User not found!');
            res.redirect('/users/login');
        } else {
            res.render('./user/profile', {user});
        }
    })
    .catch(err=>next(err));
};

exports.logout = (req, res, next)=>{
    req.session.destroy(err=>{
        if(err) 
           return next(err);
        else
            res.redirect('/');  
    });
};