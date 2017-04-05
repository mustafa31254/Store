var mongodb= require('mongodb');
var mongoose= require('mongoose');
var express=require('express');

var fs=require("fs");
var router=express.Router();

var Post=require('../models/post');
var Category=require('../models/category');



router.get("/",function(req,res,next){
Category.find()
    .paginate({ page: req.query.page }, function(err, categories) {
       res.render("Category/categories",{title:"categories","categories":categories})
    })

// Category.find({}, function(err, categories) {
//           if (err) throw err;
// console.log(categories);

// res.render("Category/categories",{title:"categories","categories":categories})
       
    

//  });


});

// router.get('/show/:category', function(req, res, next) {
//     Post.find({category:req.params.category}, function(err, posts) {
//           if (err) throw err;
//         })
//     .paginate({ page: req.query.page }, function(err, posts) {
//         res.render('categoryIndex', { title: "Mustafa's App",posts: posts})
//     });
// });
router.get("/show/:category",function(req,res,next){
var category=req.params.category;
Post.find({category:category}).paginate({ page: req.query.page }, function(err, posts) {

res.render("categoryIndex",{category:category,posts:posts})
       
    

 });


});
router.get("/addCategory",function(req,res,next){
    

   
    res.render("Category/addCategory",{"title":"addCategory"})
});
router.post("/addCategory",function(req,res,next){
    var title=req.body.title;

    

req.checkBody('title','title Required').notEmpty();
 if(req.file){
  console.log(req.file);
  var categoryImageOriginalName=req.file.originalname;
  var categoryImageName=req.file.filename;
  
  var categoryImagePath=req.file.path;
  var categoryImageSize=req.file.size;
  var categoryImageMime=req.file.mimetype;
console.log(categoryImageName);
  
}
else{
  categoryImageName="noImage.jpg";
}

var errors=req.validationErrors();
if(errors){
  res.render('Category/addCategory',{errors:errors,
title:title,
image:categoryImageName

});
}
else
{
  var newCategory= new Category({
title:title,
image:categoryImageName
})


Category.createCategory(newCategory,function(err,category){
   if(err)throw err;
    console.log(category);
  });
  req.flash('success','category Added');
  res.location('/categories/');
  res.redirect('/categories/');

}

});

router.get('/categoryEdit/:id/', function(req, res) {
  
  Category.getCategoryById(req.params.id, function(err, category) {
    if(err)throw err;
   console.log(category);

  
  

  res.render('Category/categoryEdit', {title:"categoryEdit","category":category});

  })
  
}); 

router.post('/categoryEdit/:id/', function(req, res) {
var title= req.body.title;


req.checkBody('title','title Required').notEmpty();


var errors=req.validationErrors();
if(errors){
  res.render('Category/categoryEdit',{errors:errors});
}
else
{
 Category.findById(req.params.id, function(err, category) {
if(err)throw err;
if(req.file){
  if(category.image!=null&&category.image!="noImage.jpg"){
// var filePath = 'c:/book/discovery.docx'; 
var filePath = './public/uploads/categoryImages/'+category.image; 
fs.unlinkSync(filePath);
}
 console.log(req.file);
  var categoryImageOriginalName=req.file.originalname;
  var categoryImageName=req.file.filename;
  
  var categoryImagePath=req.file.path;
  var categoryImageSize=req.file.size;
  var categoryImageMime=req.file.mimetype;
console.log(categoryImageName);
  
}
else{
  categoryImageName=category.image;
}


    category.title=title;
    category.image=categoryImageName; 
    category.save();
    req.flash("success","Category Updated Changed");
    res.redirect('/categories/');

           //res.render('changePassword', {title:"changePassword",user:user});
})}
});      

// 0     
// router.post('/categoryEdit/:id/', function(req, res) {
  
  
// Category.findOneAndUpdate({_id:req.params.id}, req.body, function (err, place) {
//   if(err)throw err;
//   req.flash("success","Category is Updated and Managed");
//   res.redirect("/categories/");
// });        
//   });

  router.delete('/categoryDelete/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Category.findOneAndRemove(query, function(err, category){
    if(category.image!==null&&category.image!="noImage.jpg"){
    var filePath = './public/uploads/categoryImages/'+category.image; 
fs.unlinkSync(filePath);
}
    req.flash('success',"user Deleted")
    res.redirect('/categories/');
  });
});










module.exports = router;
