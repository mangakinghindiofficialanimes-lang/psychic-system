const mongoose=require('mongoose');
module.exports=mongoose.model('User',new mongoose.Schema({
 telegramId:{type:String,unique:true},
 username:String,
 licenseKey:String,
 tokenUsage:{type:Number,default:0},
 isBlocked:{type:Boolean,default:false}
},{timestamps:true}));