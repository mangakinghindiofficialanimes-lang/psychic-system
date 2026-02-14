const mongoose=require('mongoose');
module.exports=mongoose.model('License',new mongoose.Schema({
 key:{type:String,unique:true},
 activatedBy:String,
 isActive:{type:Boolean,default:false},
 revoked:{type:Boolean,default:false}
},{timestamps:true}));