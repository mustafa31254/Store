var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session=require("express-session");
var passport=require("passport");
var localStrategy=require("passport-local").localStrategy;
var bodyParser = require('body-parser');
var crypto=require("crypto");
 var multer=require("multer");
var ConnectRoles=require("connect-roles");
var expressValidator=require('express-validator');
// var messages=require("express-messages");
var mongodb=require("mongodb");
var mongoose=require("mongoose");
var flash=require("connect-flash");
var MongoStore = require('connect-mongo')(session);
var index = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var roles = require('./routes/roles');
var admin = require('./routes/admin');

var categories = require('./routes/categories');

var methodOverride = require('method-override');

var db=mongoose.connection;

var app = express();
app.listen(3001,()=>{
    console.log('Running on Port 3001');
});

app.locals.moment = require('moment');
app.locals.trancateText=function(text,length){
    var trancatedText=text.substring(0,length);
    return trancatedText;
}

mongoose.connect("mongodb://localhost/nodeAuth", {
    useMongoClient: true,
    /* other options */
  });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(methodOverride('_method'))
app.use(session({
secret:"screte",
saveUninitialized:true,
resave:true,
store: new MongoStore({ mongooseConnection: mongoose.connection }),
cookie:{maxAge:3*60*60*1000}
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
// app.use(role.middleware());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));





var profileImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/profileImages/');
    },
    filename: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        ext = ext.length>1 ? ext : "." + require('mime').extension(file.mimetype);
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, (err ? undefined : raw.toString('hex') ) + ext);
        });
    }
});
var postImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/postsImages/')
    },
    filename: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        ext = ext.length>1 ? ext : "." + require('mime').extension(file.mimetype);
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, (err ? undefined : raw.toString('hex') ) + ext);
        });
    }
});
var categoryImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/categoryImages/');
    },
    filename: function (req, file, cb) {
        var ext = path.extname(file.originalname);
        ext = ext.length>1 ? ext : "." + require('mime').extension(file.mimetype);
        crypto.pseudoRandomBytes(16, function (err, raw) {
            cb(null, (err ? undefined : raw.toString('hex') ) + ext);
        });
    }
});


var uploadPostImages = multer({ storage: postImageStorage });
var uploadProfileImages = multer({ storage: profileImageStorage });
var uploadCategoryImages = multer({ storage: categoryImageStorage });

// var upload = multer({storage: storage}).single('profileImage');
// app.use(upload.single('profileImage'));

app.use(flash());
var messages=require('express-messages');
app.use(function (req, res, next) {
res.locals.messages = messages(req, res);
//res.locals.session=req.session;
  next();
});
app.use(function (req, res, next) {

res.locals.session=req.session;
  next();
});


//Accessing user to whole app
app.get('*',function(req,res,next){
  res.locals.user=req.user || null;
  
  next();
});
// so,did it for every function
// var requireRole = function(role) {
//   return function(req, res, next) {
//     if(user in req.session && req.session.user.role === role)
//       next();
//     else
//       res.send(403);
//   }
// };

// app.get('*',function(req,res,next){
//   res.locals.requireRole=requireRole;
//   next();
// });



app.use('/', index);
app.use('/users', uploadProfileImages.single("profileImage"), users);
app.use('/posts',uploadPostImages.single("postImage"), posts);
app.use('/categories',uploadCategoryImages.single("categoryImage"), categories);
app.use('/roles', roles);
app.use('/admin',uploadProfileImages.single("profileImage"), admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
