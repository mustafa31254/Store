var mongodb= require('mongodb');
var mongoose= require('mongoose');
//mongoose.connect("mongodb://localhost/nodeAuth");
var db=mongoose.connection;
var categorySchema= mongoose.Schema({
    title:{type:String,index:true}
    ,image:{type:String}
});


var Category= module.exports=mongoose.model('Category',categorySchema);

module.exports.getCategoryById=function(id,callback){
    
  Category.findById(id,callback);

};


module.exports.getCategoryByTitle=function(title,callback){
    var querry={title:title}
  Category.findOne(querry,callback);

};
module.exports.createCategory=function(newCategory,callback){
newCategory.save(callback);

};
