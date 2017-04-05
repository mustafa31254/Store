var express = require('express');
var router = express.Router();
var mongodb=require('mongodb');
var mongoose=require("mongoose");
var paginate = require('paginate')({
    mongoose: mongoose
});
var Category=require('../models/category');

var Post=require('../models/post');
var Order=require('../models/order');

var Cart=require('../models/cart');
/* GET home page. */
// // router.get('/', function(req, res, next) {
  
// //   Post.find({},function(err,posts){
// //     if(err)throw err;
// // // console.log(posts);
// // res.render('index', { title: "Mustafa's App","posts":posts });
// //   });
  
  
// });

// router.get('/', function(req, res, next) {
//     Post.find()
//     .paginate({ page: req.query.page }, function(err, posts) {
//         res.render('index', { title: "Mustafa's App",posts: posts})
//     });
// });
router.get("/",function(req,res,next){
Category.find()
    .paginate({ page: req.query.page }, function(err, categories) {
       res.render("index",{title:"Mustafa's Express App","categories":categories})
    })})



router.get("/addToCart/:id",function(req,res,next){

var postId=req.params.id;
var cart= new Cart(req.session.cart ? req.session.cart : {});
Post.findById(postId,function(err,post){
  if(err)throw err;
  cart.add(post,post._id);
  req.session.cart=cart;
  console.log(req.session.cart);
  res.redirect("/");
})
})
router.get("/shoppingCart",function(req,res,next){

if(!req.session.cart){
  return res.render("cart",{products:null});
}
var cart=new Cart(req.session.cart);
res.render("cart",{products:cart.generateArray(),totalPrice:cart.totalPrice})

})
router.get("/checkOut",ensureAuthenticated,function(req,res,next){

if(!req.session.cart){
  return res.redirect("/shoppingCart");
}
var cart=new Cart(req.session.cart);
res.render("checkOut",{totalPrice:cart.totalPrice})

});
router.post("/checkOut",ensureAuthenticated,function(req,res,next){
if(!req.session.cart){
  return res.redirect("/shoppingCart");

}
var cart=new Cart(req.session.cart);
var stripe = require("stripe")(
  "sk_test_nfegIGafLp6AG6CP9bTpvsIM"
);

stripe.charges.create({
  amount: cart.totalPrice *100,
  currency: "usd",
  source: req.body.stripeToken, // obtained with Stripe.js
  description: "Charge for mustafa@example.com"}, function(err, charge) {
  // asynchronously called
if(err){
req.flash("error",err.message);
return res.redirect("/checkOut");
}
var order= new Order({
  user:req.user,
  cart:cart,
  address:req.body.address,
  name:req.user.name,
  paymentId:charge.id
});
order.save(function(err,result){
if(err)throw err;
req.flash("success","successfully bought product");
req.session.cart=null;
res.redirect("/");

})
});
})

function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated())
  {
  return    next();
}
req.session.returnUrl=req.url;
  res.redirect('/users/login');
}
router.get("/orders",ensureAuthenticated,function(req,res,next){
Order.find({user:req.user},function(err,orders){
  if(err)throw err;
  var cart;
  orders.forEach(function(order){
    cart=new Cart(order.cart);
    order.items=cart.generateArray();
  })
res.render("orders",{orders:orders})

})

})
router.get("/reduce/:id",function(req,res,next){
var id=req.params.id;
var cart= new Cart(req.session.cart ? req.session.cart : {});

cart.reduceByOne(id);
req.session.cart=cart;
res.redirect("/shoppingCart")
});
router.get("/remove/:id",function(req,res,next){
var id=req.params.id;
var cart= new Cart(req.session.cart ? req.session.cart : {});

cart.removeItem(id);
req.session.cart=cart;
res.redirect("/shoppingCart")
});


module.exports = router;
