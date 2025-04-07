const express = require('express');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

/**Added the override method to delete expense */
const methodOverride = require('method-override');


const app = express();
const port = 3000;
const host = 'localhost';
let mongoUri = "mongodb+srv://admin:admin123@cluster0.jxafl.mongodb.net/sprint0?retryWrites=true&w=majority&appName=Cluster0";
app.set('view engine', 'ejs');

mongoose.connect(mongoUri)
.then(() => {
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    })
})
.catch(err=>console.log(err.message));

app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({mongoUrl: mongoUri}),
        cookie: {maxAge: 60*60*1000}
        })
);

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
/*Enables PUT and DELETE for the the expense deletion*/
app.use(methodOverride('_method'));
app.use(morgan('dev'));

app.get('/', (req,res) => {
    res.render('index.ejs');
});

app.use('/users', userRoutes);
app.use('/expenses', expenseRoutes);

module.exports = app;
