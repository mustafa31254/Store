var passport=require("passport");
var LocalStrategy= require("passport-local").Strategy;
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var multer=require('multer');
var fs = require('fs');

var csrf = require('csurf');

var csrfProtection = csrf();
// var csrfProtection = csrf({ cookie: true })
//router.use(csrfProtection);
// var gutil = require('gulp-util');
var storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, './uploads/profileImages/');
  },
  filename: function (request, file, callback) {
    console.log(file);
    callback(null, file.originalname)
  }
});

// var upload = multer({ dest: './uploads' });
var bcrypt=require('bcryptjs');
var Post=require("../models/post");
var User = require('../models/user');
/* GET users listing. */

var Role = require('../models/role');
// var multer  = require('multer')
//var upload = multer({ dest: 'uploads/profileImages/' })
var upload = multer({storage: storage}).single('profileImage');
router.use(csrfProtection);
router.get('/', ensureAuthenticated, function(req, res, next) {
  console.log(req.user.username)

  Post.find({author:req.user.username})
    .paginate({ page: req.query.page }, function(err, posts) {
  res.render('User/account',{title:"Account","posts":posts});
    });
});

function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated())
  {
  return    next();
}
req.session.returnUrl=req.url;
  res.redirect('/users/login');
}

function ensureNotAuthenticated(req,res,next){
  if(!req.isAuthenticated())
  {
  return    next();
  }
  res.redirect('/');
}


function ensureAdmin(req,res,next){
  if(req.user && req.user.role==="Admin")
  {
  return    next();
  }
  res.redirect('/');
  req.flash("danger","you are not authorized to page");
}
function ensureAdminAndAuthor(req,res,next){
  if(req.user && req.user.role==="Admin"||req.user.role==="Author")
  {
  return    next();
  }
  res.redirect('/');
  req.flash("danger","you are not authorized to page");
}




router.get('/register',ensureNotAuthenticated, function(req, res, next) {
  res.render('User/register',{title:"register",csrf: req.csrfToken()});
});
router.get('/forgot', function(req, res) {
  res.render('User/forgot', {
    user: req.user,csrf: req.csrfToken()
  });
});

router.post('/forgot',ensureNotAuthenticated, function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('User/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
          user: 'test @gmail.com',
          pass: 'type your password'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'mustafa312540@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/users/forgot');
  });
});

router.get('/reset/:token',ensureNotAuthenticated, function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot/');
    }
    res.render('User/reset', {
      user: req.user,csrf: req.csrfToken()
    });
  });
});

router.post('/reset/:token',ensureNotAuthenticated, function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/users/login');
        }

       // user.password = req.body.password;
var password=req.body.password;
bcrypt.hash(password,10,function(err,hash){
    if(err)throw err;
    user.password=hash;
})


        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'SendGrid',
        auth: {
          user: 'test@gmail.com',
          pass: 'testpassword'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});
router.get('/login',ensureNotAuthenticated, function(req, res, next) {
  res.render('User/login',{title:"login",csrf: req.csrfToken(),error: req.flash("error")});
});


router.post('/login',passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:true}),
function(req, res,next) {
req.flash('success','you are logged in Now');
if(req.session.returnUrl){
// console.log("hello you are logged");

var returnUrl=req.session.returnUrl;
req.session.returnUrl=null;

res.redirect(returnUrl);
}else{
  res.redirect("/users/");
}

});

router.get("/logout",ensureAuthenticated,function(req,res){
  req.logout();
  req.flash("success","You are logged Out");
  res.redirect('/');
});


router.post('/register',function(req,res,next){
var name=req.body.name;
var email=req.body.email;
var username=req.body.username;
var password=req.body.password;
var password1=req.body.password1;

if(req.file){
  console.log(req.file);
  var profileImageOriginalName=req.file.originalname;
  var profileImageName=req.file.filename;
  
  var profileImagePath=req.file.path;
  var profileImageSize=req.file.size;
  var profileImageMime=req.file.mimetype;
console.log(profileImageName);
  
}
else{
  profileImageName="noImage.jpg";
}

req.checkBody('name','name Required').notEmpty();
req.checkBody('username','username Required').notEmpty();
req.checkBody('email','email Required').notEmpty();
req.checkBody('email','email Required').isEmail();
req.checkBody('password','password Required').notEmpty();
req.checkBody('password1','password UnMatch').equals(req.body.password);
User.findOne({ "email" : email }, function(err, doc) {
        if (doc) {
          return res.render("User/register", {info: "Sorry. That email already exists. Try again."});
}
else{
  var errors=req.validationErrors();
if(errors){
  res.render('User/register',{errors:errors,
name:name,
username:username,
password:password,
email:email

});
}
else
{
  var newUser= new User({
 name:name,
username:username,
password:password,
email:email,
image:profileImageName


  });

 User.createUser(newUser,function(err,user){
   if(err)throw err;
    console.log(user);
  });
  req.flash('success','Yor Are Registered , you can log in Now');
  res.location('/');
  res.redirect('/');
}
}})


});


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
   function(username,password,done){
  User.getUserByUsername(username,function(err,user){
    if (err)throw err;
    if(!user){
      console.log("not a user");
      // req.flash('error','Unkonwn username');
      return done(null,false,{message:"Unkonwn username"});
  }
  User.verifyPassword(password,user.password,function(err,isMatch){
  if(err)throw err;
  if(isMatch){
    return done(null,user);
    console.log("good");
  }
  else{
    
    console.log("invalid password")
    return done(null,false,{message:"Sorry no account exists"});
  }
});
});
}
));


router.get('/members',ensureAdmin, function(req, res) {
// if(req.user && req.user.role==="Admin"||req.user.role==="Author"){
  //console.log(req.user.role);
  
        User.find({}, function(err, users) {
          if (err) throw err;
           res.render('User/members', {title:"members",users: users});
        });
})
//else{
//   res.redirect("/");
//   req.flash("danger","YOu are not authorized");
// }  
  //});

    //making available for current user only
router.get('/editAccount/:id/', function(req, res) {
  
  User.getUserById(req.params.id, function(err, user) {
    if(err)throw err;
   res.render('User/userEdit', {title:"edit","user":user,csrf: req.csrfToken()});

  })
  })
// });      

router.post('/editAccount/:id/', function(req, res,next) {
  
User.getUserById(req.params.id, function(err, user) {
    if(err)throw err;
 var name=req.body.name;
  var email=req.body.email;
  var username=req.body.username;
if(req.file){
  if(user.image!="noImage.jpg"){
// var filePath = 'c:/book/discovery.docx'; 
var filePath = './public/uploads/profileImages/'+user.image; 
fs.unlinkSync(filePath);
}
 console.log(req.file);
  var profileImageOriginalName=req.file.originalname;
  var profileImageName=req.file.filename;
  
  var profileImagePath=req.file.path;
  var profileImageSize=req.file.size;
  var profileImageMime=req.file.mimetype;
console.log(profileImageName);
  
}
else{
  profileImageName=user.image;
}

req.checkBody('name','name Required').notEmpty();
 req.checkBody('username','username Required').notEmpty();
req.checkBody('email','email Required').notEmpty();
req.checkBody('email','email Required').isEmail();

var errors=req.validationErrors();
if(errors){
  res.render('User/userEdit',{"errors":errors,
"name":name,
"username":username,
"email":email

});
}
else{
  user.name=name,
  user.username=username,
  user.email=email,
  user.image=profileImageName
user.save(function(err,user){
  if(err){
    throw err
    }
req.flash("success",user.username+" Updated");
  res.redirect("/users/");

});

}


  
});        
  });
  router.get('/changePassword/:id/',ensureAuthenticated, function(req, res) {
  
  User.getUserById(req.params.id, function(err, user) {
    if(err)throw err;

           res.render('User/changePassword', {title:"changePassword",user:user,csrf: req.csrfToken()});
  })
});
router.post('/changePassword/:id/',ensureAuthenticated, function(req, res) {
req.checkBody('password','password Required').notEmpty();
req.checkBody('password1','password UnMatch').equals(req.body.password);

var errors=req.validationErrors();
if(errors){
  res.render('changePassword',{errors:errors});
}
else
{
 User.getUserById(req.params.id, function(err, user) {
    if(err)throw err;
var password= req.body.password;
bcrypt.hash(password,10,function(err,hash){
    if(err)throw err;
    user.password=hash;
    user.save();
    req.flash("success","password Changed");
    res.redirect('/users/');
});
           //res.render('changePassword', {title:"changePassword",user:user});
})}
});      

  router.get('/assignRole/:id/',ensureAdmin, function(req, res) {
 
  User.getUserById(req.params.id, function(err, user) {
    if(err)throw err;
Role.find({}, function(err, roles) {
   if (err) throw err;
   console.log(roles);


res.render('User/assignRole', {title:"AssignRole","user":user,"roles":roles,csrf: req.csrfToken()});
  })
  });
});
router.post('/assignRole/:id/', function(req, res) {
var role= req.body.role;

req.checkBody('role','Role name  Required').notEmpty();


var errors=req.validationErrors();
if(errors){
  res.render('User/assignRole',{errors:errors});
}
else
{
 User.getUserById(req.params.id, function(err, user) {
if(err)throw err;
    user.role=role;
    user.save();
    req.flash("success","Role Changed or Assigned Changed");
    res.redirect('/users/members');

           //res.render('changePassword', {title:"changePassword",user:user});
})}
});      


router.delete('/delete/:id', function(req, res) {
  var query = {"_id": req.params.id};
  User.findOneAndRemove(query, function(err, user){
    console.log(user);
    if(user.image!==null&&user.image!="noImage.jpg"){
    var filePath = './public/uploads/postsImages/'+user.image; 
fs.unlinkSync(filePath);
}
    req.flash('success',"user Deleted")
    res.redirect('/users/members');
  });
});
// router.post('/delete/', function(req, res) {
  
//   User.findById(req.params.id, function(err, user) {
//     if(err)throw err;


// User.remove(user, function (err, place) {
// if(err)throw err;
//   req.flash("success","Deleted")
//   res.redirect("/users/members");
// });        
//   })
// });
// 
// router.delete('/delete/:id', function (req, res) {
//     User.findById(req.params.id)
//         .exec(function(err, doc) {
//             if (err || !doc) {
//                 res.statusCode = 404;
//                 req.flash("error","Error")
                
//             } else {
//                 doc.remove(function(err) {
//                     if (err) {
//                         res.statusCode = 403;
//                         res.send(err);
//                     } else {
//                         res.send({});
//                     }
//                 });
//             }
//         });
// });


module.exports = router;
