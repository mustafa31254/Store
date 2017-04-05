var mongodb= require('mongodb');
var mongoose= require('mongoose');
var express=require('express');


var router=express.Router();

var Role=require('../models/role');
// var Category=require('../models/category');


router.get("/",function(req,res,next){


Role.find({}, function(err, roles) {
          if (err) throw err;
console.log(roles);

res.render("Roles/roles",{title:"roles","roles":roles})
       
    

 });


});
router.get("/addRole",function(req,res,next){
    res.render("Roles/addRole",{"title":"addRole"})
});
router.post("/addRole",function(req,res,next){
    var name=req.body.name;
    

req.checkBody('name','name Required').notEmpty();
 
var errors=req.validationErrors();
if(errors){
  res.render('Roles/addRole',{"errors":errors,
"name":name

});
}
else
{
  var newRole= new Role({
name:name
})


Role.createRole(newRole,function(err,role){
   if(err)throw err;
    console.log(role);
  });
  req.flash('success','role Added');
  res.location('/roles/');
  res.redirect('/roles/');

}

});

router.get('/roleEdit/:id/', function(req, res) {
  
  Role.getRoleById(req.params.id, function(err, role) {
    if(err)throw err;
   console.log(role);

  
  

  res.render('Roles/roleEdit', {title:"RoleEdit",role:role});

  })
  
});      
router.post('/roleEdit/:id/', function(req, res) {
  
  
Role.findOneAndUpdate({_id:req.params.id}, req.body, function (err, place) {
  if(err)throw err;
  req.flash("success","Role is Updated and Managed");
  res.redirect("/roles/");
});        
  });

  router.delete('/roleDelete/:id', function(req, res) {
  var query = {"_id": req.params.id};
  Role.findOneAndRemove(query, function(err, role){
    console.log(role);
    req.flash('success',"user Deleted")
    res.redirect('/Admin/members');
  });
});






module.exports = router;
