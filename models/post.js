var mongodb= require('mongodb');
var mongoose= require('mongoose');
//mongoose.connect("mongodb://localhost/nodeAuth");
var db=mongoose.connection;
var postSchema= mongoose.Schema({
    title:{type:String,index:true},author:{type:String},body:{type:String},createdAt:{type:Date},
    updatedBy:{type:String},category:{type:String,require},image:{type:String},price:{type:Number},
comments : [
        {
          "name" : String,
            "email" :String,
            "body":String,
             "commentUserImage":String,
             "commentDate":Date
}]

});


var Post= module.exports=mongoose.model('Post',postSchema);

module.exports.getPostById=function(id,callback){
    
  Post.findById(id,callback);

};


module.exports.getPostByTitle=function(title,callback){
    var querry={title:title}
  Post.findOne(querry,callback);

};
module.exports.createPost=function(newPost,callback){
newPost.save(callback);

};


