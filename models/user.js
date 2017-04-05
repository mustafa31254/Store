
var mongodb= require('mongodb');
var mongoose= require('mongoose');
mongoose.connect("mongodb://localhost/nodeAuth");
var bcrypt=require('bcryptjs');
var db=mongoose.connection;
var userSchema= mongoose.Schema({
    username:{type:String,index:true},email:{type:String},name:{type:String},password:{type:String,require:true,bcrypt:true}
    ,image:{type:String},role:{type:String},
    resetPasswordToken:{type: String},
  resetPasswordExpires:{type: Date}
});
var User= module.exports=mongoose.model('User',userSchema);

module.exports.verifyPassword=function(userPassword,hash,callback){
    bcrypt.compare(userPassword,hash,function(err,isMatch){
if(err) return callback(err) ;
callback(null,isMatch)
    });
  
    
}


module.exports.getUserById=function(id,callback){
    
  User.findById(id,callback);

};


module.exports.getUserByUsername=function(username,callback){
    var querry={username:username}
  User.findOne(querry,callback);

};

module.exports.createUser=function(newUser,callback){
bcrypt.hash(newUser.password,10,function(err,hash){
    if(err)throw err;
newUser.password=hash;

newUser.save(callback);

});
}

// module.exports.getAllUsers=function(callback){
// User.find({});
// };





