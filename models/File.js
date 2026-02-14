const mongoose=require('mongoose');
module.exports=mongoose.model('File',new mongoose.Schema({
 userId:String,
 telegramFileId:String,
 fileName:String,
 fileSize:Number,
 mimeType:String
},{timestamps:true}));