var mongodb= require('mongodb');
var mongoose= require('mongoose');
var express=require('express');
var db=mongoose.connection;
var fs = require('fs');

// var multer  = require('multer')
// var upload = multer({ dest: 'uploads/postsImages/' })
var router=express.Router();

var Post=require('../models/post');
var Category=require('../models/category');


router.get("/",function(req,res,next){


Post.find({}, function(err, posts) {
          if (err) throw err;
console.log(posts);

res.render("Post/posts",{title:"Posts","posts":posts})
       
    

 });


});
router.get("/show/:id",function(req,res,next){
Post.findById(req.params.id,function(err,post){
  if(err)throw err;
  res.render("Post/show",{"post":post});
})

});

function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated())
  {
   return next();
  }
  res.redirect('/users/login');
}

//var requireRole = function(role) {
//   return function(req, res, next) {
//     if('user' in req.session && req.session.user.role === role)
//       next();
//     else
//       res.send(403);
//   }
// };
function ensureAdmin(req,res,next){
  if(req.user&&req.user.role==="Admin")
  {
   return next();
  }
  req.flash("success","You are not Authorized")
  res.redirect('/users/login');
}



router.get("/addPost",ensureAuthenticated,function(req,res,next){
    Category.find({}, function(err, categories) {
   if (err) throw err;
console.log(categories);
   
    res.render("Post/addPost",{"title":"Add Post","categories":categories})
});
});
router.post("/addPost",ensureAuthenticated,function(req,res,next){
    var title=req.body.title;
    var category=req.body.category;
    var body=req.body.body;
    var author=req.user.username;
    var price=req.body.price;
    var createdAt= new Date();

if(req.file){

  var imageOriginalName=req.file.originalname;
  var imageName=req.file.filename;
  
  var imagePath=req.file.path;
  var imageSize=req.file.size;
  var imageMime=req.file.mimetype;
}
else{
  imageName="noImage.jpg";
}

req.checkBody('title','title Required').notEmpty();
req.checkBody('body','body Required').notEmpty();
// req.checkBody('author','author Required').notEmpty();
req.checkBody('category','category Required').notEmpty();
console.log(createdAt);
var errors=req.validationErrors();
if(errors){
  res.render('Post/addPost',{"errors":errors,
"title":title,
"body":body,
"price":price,
"author":author,
"createdAt":createdAt,
"category":category

});
}
else
{
  var newPost= new Post({
title:title,
body:body,
price:price,
author:author,
createdAt:new Date(),
category:category,
image:imageName,



})


Post.createPost(newPost,function(err,post){
   if(err)throw err;
    console.log(post);
  });
  req.flash('success','Post Added');
  res.location('/');
  res.redirect('/');

}

});
router.post("/addComment",ensureAuthenticated,function(req,res,next){
    var postId=req.body.postId;
    var name=req.user.username;
    var email=req.user.email;
    var body=req.body.body;
    var commentDate=new Date();
    var commentUserImage=req.user.image;

//req.checkBody('name','Name Required').notEmpty();
req.checkBody('body','body Required').notEmpty();
//req.checkBody('email','email Required').notEmpty();
//req.checkBody('email','correct Email please').isEmail();

var errors=req.validationErrors();
if(errors){

  Post.findById(postId,function(err,post){
  res.render('Post/show',{"errors":errors,
"post":post

})
  })

}
else
{
  var comment= {
"name":name,
"email":email,
"body":body,
"commentDate":commentDate,
"commentUserImage":commentUserImage
};


Post.update({"_id":postId},{
  $push:{"comments":comment}
},function(err,doc){
  if(err){
  throw err;
  }
  else{
req.flash('success','Comment Added');
  res.location('/posts/show/'+postId);
  res.redirect('/posts/show/'+postId);

  }
})
  
}

});


router.get('/postEdit/:id/', function(req, res) {
  
  Post.getPostById(req.params.id, function(err, post) {
    if(err)throw err;
   Category.find({}, function(err, categories) {
   if (err) throw err;
   console.log(categories);

  
  

  res.render('Post/postEdit', {title:"edit","post":post,"categories":categories});

  })
  })
});      


router.post('/postEdit/:id/', function(req, res,next) {
  


Post.getPostById(req.params.id, function(err, post) {
    if(err)throw err;
    var title=req.body.title;
    var category=req.body.category;
    var body=req.body.body;
    var price=req.body.price;
    var updatedBy=req.user.username;

if(req.file){
   if(post.image!=="noImage.jpg"){
// var filePath = 'c:/book/discovery.docx'; 
var filePath = './public/uploads/postsImages/'+post.image; 
fs.unlinkSync(filePath);
}
// console.log(req.file);
  var imageOriginalName=req.file.originalname;
  var imageName=req.file.filename;
  
  var imagePath=req.file.path;
  var imageSize=req.file.size;
  var imageMime=req.file.mimetype;
// console.log(imageName);
  
}
else{
  imageName=post.image;
}

// 
req.checkBody('title','title Required').notEmpty();
req.checkBody('body','body Required').notEmpty();
// req.checkBody('author','author Required').notEmpty();
req.checkBody('category','category Required').notEmpty();
req.checkBody('price','price Required').notEmpty();

var errors=req.validationErrors();
if(errors){
  res.render('Post/postEdit',{"errors":errors,
"title":title,
"body":body,
"price":price,
"category":category

});
}
else{
  post.title=title,
  post.category=category,
  post.updatedBy=updatedBy,
  post.body=body,
  post.price=price,
  post.image=imageName
post.save(function(err,post){
  if(err){
    throw err
    }
req.flash("success",post.title+" is Updated and Managed");
  res.redirect("/posts/");

});

}


  
});        
  });


  

// router.delete('/deletePost/:id', function(req, res) {
//   var query = {"_id": req.params.id};
//   Post.getPostById(query, function(err, post){
//     if(post.image!=="noImage.jpg"||null){
//     var filePath = './public/uploads/postsImages/'+post.image; 
// fs.unlinkSync(filePath);
//     console.log(post);
//   }
//  Post.remove({ _id: post._id }, function(err, post){
//     req.flash('success',"post Deleted")
//     res.redirect('/posts/');
//   })

    
//   });
// });


module.exports = router;
