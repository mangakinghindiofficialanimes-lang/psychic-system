const mongoose=require('mongoose');
module.exports=mongoose.model('Filter',new mongoose.Schema({
 keyword:String,
 reply:String
}));