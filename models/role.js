
var mongodb= require('mongodb');
var mongoose= require('mongoose');
//mongoose.connect("mongodb://localhost/nodeAuth");
var db=mongoose.connection;
var roleSchema= mongoose.Schema({
    name:{type:String,index:true}
});
var Role= module.exports=mongoose.model('Role',roleSchema);



module.exports.getRoleById=function(id,callback){
    
  Role.findById(id,callback);

};


module.exports.getRoleByname=function(name,callback){
    var querry={name:name}
  User.findOne(querry,callback);

};
module.exports.getAllRoles=function(callback){
    
Role.find({});
};




module.exports.createRole=function(newRole,callback){
newRole.save(callback);


}
