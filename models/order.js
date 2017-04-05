var mongodb= require('mongodb');
var mongoose= require('mongoose');
var Schema=mongoose.Schema;
//mongoose.connect("mongodb://localhost/nodeAuth");
var db=mongoose.connection;
var orderSchema= mongoose.Schema({
    user:{type:Schema.Types.ObjectId,ref:"User"},
    cart:{type:Object,required:true},
    address:{type:String,required:true},
    paymentId:{type:String,required:true},
    // name:{type:String,required:true}

});


var Order= module.exports=mongoose.model('Order',orderSchema);
