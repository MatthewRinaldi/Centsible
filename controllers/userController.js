/*const model = require('../models/user');

exports.getLogin = (req,res,next) => {
    return res.render('./user/login');
};

exports.getSignup = (req,res,next) => {
    return res.render('./user/signup');
}

exports.login = (req,res,next) => {
    let email = req.body.email;
    let password = req.body.password;
    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('Invalid email address!');  
            res.redirect('/users/login');
        } else {
            user.comparePassword(password)
            .then(result=>{
                if(result){
                    req.session.user = user._id;
                    res.redirect('/users/profile');
                } else {
                    console.log("Incorrect password!");
                    res.redirect('/users/login');
                }
            })
        }
    })
    .catch(err=>next(err));
};

exports.signup = (req,res,next) => {
    let user = new model(req.body);
    user.save()
    .then(user=> {
        res.redirect('/users/login');
    })
    .catch(err=>next);
}

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
};*/

const model = require('../models/user');

exports.getLogin = (req, res, next) => {
    return res.render('./user/login');
};

exports.getSignup = (req, res, next) => {
    return res.render('./user/signup');
};

exports.login = (req, res, next) => {
    let email = req.body.email;
    let password = req.body.password;

    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            console.log('Invalid email address!');  
            return res.redirect('/users/login');
        }

        user.comparePassword(password)
        .then(result => {
            if (result) {
                req.session.user = user._id;
                return res.redirect('/users/profile');  
            } else {
                console.log("Incorrect password!");
                return res.redirect('/users/login');  
            }
        })
        .catch(err => next(err));  
    })
    .catch(err => next(err));  
};

exports.signup = (req, res, next) => {
    let user = new model(req.body);
    user.save()
    .then(user => {
        res.redirect('/users/login');
    })
    .catch(err => next(err));  
};

exports.profile = (req, res, next) => {
    let id = req.session.user;

    model.findById(id)
    .then(user => {
        if (!user) {
            console.log('User not found!');
            return res.redirect('/users/login');  
        } 
        res.render('./user/profile', { user });
    })
    .catch(err => next(err));  
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) 
            return next(err);
        res.redirect('/');  
    });
};
