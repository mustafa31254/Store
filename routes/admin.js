var mongodb= require('mongodb');
var mongoose= require('mongoose');
var express=require('express');
//Requiring Models
var User = require('../models/user');
var fs = require('fs');

var Post=require('../models/post');
var Category=require('../models/category');
var Post=require('../models/post');
var Category=require('../models/category');
var Role = require('../models/role');
var bcrypt=require('bcryptjs');

var router=express.Router();
//start Region User Management


router.get('/members', function(req, res) {
        User.find({}, function(err, users) {
          if (err) throw err;
           res.render('Admin/members', {title:"members",users: users});
        });
    });
router.get('/userEdit/:id/', function(req, res) {
  
  User.getUserById(req.params.id, function(err, user) {
    if(err)throw err;
 res.render('Admin/userEdit', {title:"edit","user":user});
  })
  });


router.post('/userEdit/:id/', function(req, res,next) {
   
 User.getUserById(req.params.id, function(err, user) {
    if(err){
    throw err;
  }
 var name=req.body.name;
  var email=req.body.email;
  var username=req.body.username;
if(req.file){
  console.log(req.file);
   if(user.image!=="noImage.jpg"){
// var filePath = 'c:/book/discovery.docx'; 
var filePath = './public/uploads/profileImages/'+user.image; 
fs.unlinkSync(filePath);
}
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
  res.render('Admin/userEdit',{errors:errors,
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
req.flash("success",user.username+" is Updated and Managed");
  res.redirect("/admin/members");

});

}


  
});        
  });



  router.get('/changePassword/:id/', function(req, res) {
  
  User.getUserById(req.params.id, function(err, user) {
    if(err)throw err;

           res.render('Admin/changePassword', {title:"changePassword",user:user});
  })
});
router.post('/changePassword/:id/', function(req, res) {

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
    res.redirect('/admin/members');
});
           //res.render('changePassword', {title:"changePassword",user:user});
})}
});  

    

  router.get('/assignRole/:id/', function(req, res) {



  
  User.getUserById(req.params.id, function(err, user) {
    if(err)throw err;
Role.find({}, function(err, roles) {
   if (err) throw err;
   console.log(roles);


res.render('Admin/assignRole', {title:"AssignRole","user":user,"roles":roles});
  })
  });
});
router.post('/assignRole/:id/', function(req, res) {
var role= req.body.role;

req.checkBody('role','Role name  Required').notEmpty();


var errors=req.validationErrors();
if(errors){
  res.render('Admin/assignRole',{errors:errors});
}
else
{
 User.getUserById(req.params.id, function(err, user) {
if(err)throw err;
    user.role=role;
    user.save();
    req.flash("success","Assigned "+user.role);
    res.redirect('/admin/members');

})}
});      

router.delete('/userDelete/:id', function(req, res) {
  var query = {"_id": req.params.id};
  User.findOneAndRemove(query, function(err, user){
    console.log(user);
    req.flash('success',"user Deleted")
    res.redirect('/Admin/members');
  });
});
//End Region User Management

//Post Region
router.get("/posts",function(req,res,next){


Post.find({}, function(err, posts) {
          if (err) throw err;
console.log(posts);

res.render("Admin/posts",{title:"Posts","posts":posts})
       
    

 });


});
router.delete('/deletePost/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Post.getPostById(query, function(err, post){
    if(post.image!=="noImage.jpg"||null){
    var filePath = './public/uploads/postsImages/'+post.image; 
fs.unlinkSync(filePath);
    console.log(post);
  }
 Post.remove({ _id: post._id }, function(err, post){
    req.flash('success',"post Deleted")
    res.redirect('/admin/posts/');
  })

    
  });
});




module.exports = router;