// require dependencies
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var promise = require('bluebird');
var session = require('express-session');
var expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
var bcrypt = require('bcryptjs');
var logger = require('morgan');
var jwt = require('jsonwebtoken');
mongoose.Promise = promise;

//require all js file
var Key = require('./private/key');
var User = require('./model/register');
var checkAuth = require('./authentication');
var Form = require('./model/fomsubmit');


var app = express();

// to hide X-Powered-By for Security,Save Bandwidth in ExpressJS(node.js)
app.disable('x-powered-by');

//configure the app
app.set('port',9000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//set all middleware
app.use(bodyParser.json());
//extended false means it won't be accepting nested objects (accept only single)
// here security for session to be added like.... session validate
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended : false}));
app.use(expressValidator());
app.use(express.static(path.join(__dirname,'public')));

app.use(cookieParser());

// if saveUninitialized : false than it will store session till the instance is in existence
// secret is hashing secret
// secret should be that much complex that one couldnt guess it easily
app.use(session({
    secret : 'keyboard cat',
    cookie : {maxAge : 1000* 60 * 60 * 24 * 7},
    resave : false,
    saveUninitialized : true
}));

// My Router start from here

//render for login page
app.get('/',function(req,res){
    res.render('login');
});
//check for credential
app.post('/login',function(req,res) {
    var email = req.body.email;
    var password = req.body.password;
    User.find({email: email})
        .exec(function (err, user) {
            if (err) {
                return res.sendStatus(401).json({
                    status : 'failure',
                    message: err
                });
            }
            else {
                if (user.length < 1) {
                    return res.status(401).json({
                        status : 'failure',
                        message: 'Auth Failed'
                    });
                }
                bcrypt.compare(password, user[0].password, function (err, match) {
                    if (err) {
                        res.sendStatus(401).json({
                            status : 'failure',
                            message: err
                        });
                    }
                    else {
                        if (match) {
                            var token = jwt.sign(
                                {
                                    email: user[0].email,
                                    userID: user[0]._id
                                },
                                Key.key(),
                                {
                                    expiresIn: "1h"
                                });
                            req.session.token = token;
                            res.redirect('/dashboard');
                            return;
                        }
                        else {
                            res.status(401).json({
                                status : 'failure',
                                message: "Auth Failed"
                            });
                        }
                    }
                });
            }
        });
});
//render to dashboard
app.get('/dashboard',checkAuth,function(req,res){
    res.render('dashboard');
});
//from submit here
app.post('/submitform',checkAuth,function(req,res){
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var phone = req.body.phone;
    var message = req.body.message;
    //express-validation perform here
    req.check('email',' email validation failed').isEmail();
    req.check('phone',' number must be integer and of 10 digit').matches(/^\d{10}$/);
    var errors = req.validationErrors();
    //if any error then send it
    if(errors){
        return res.send({
            error : 'errors',
            message: errors[0].msg
        });
    }
    // if not the submit the form
    var form = new Form({
        firstname : firstname,
        lastname : lastname,
        email : email,
        phone : phone,
        message : message
    });
    form.save(function(err){
        if(err){
            return res.sendStatus(401).json({
                status : 'failure',
                message: err
            });
        }
        else{
            res.send({status : 'success' , message : 'Form submit successfully'})
        }
    })
});

//==========================Database connection===========================

//data base connection and opening port
var db = 'mongodb://127.0.0.1/Health';
mongoose.connect(db);

//=============================Start server========================
//connecting database and starting server
var database = mongoose.connection;
database.on('open', function () {
    console.log("database is connected");
    app.listen(app.get('port'), function () {
        console.log('server connected to http://localhost:' + app.get('port'));
    });
});