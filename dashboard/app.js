require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const helmet=require('helmet');
const cors=require('cors');
const rateLimit=require('express-rate-limit');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const Admin=require('../models/Admin');
const User=require('../models/User');
const License=require('../models/License');

mongoose.connect(process.env.MONGO_URI);

const app=express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({windowMs:15*60*1000,max:100}));
const adminRoutes = require("./routes/admin");

app.use("/api/admin", adminRoutes);

function auth(req,res,next){
 const token=req.headers.authorization?.split(" ")[1];
 if(!token) return res.status(401).json({msg:"Unauthorized"});
 try{
  req.admin=jwt.verify(token,process.env.JWT_SECRET);
  next();
 }catch{res.status(401).json({msg:"Invalid Token"})}
}

app.post("/login",async(req,res)=>{
 const {email,password}=req.body;
 const admin=await Admin.findOne({email});
 if(!admin) return res.status(401).json({msg:"Invalid"});
 const ok=await bcrypt.compare(password,admin.password);
 if(!ok) return res.status(401).json({msg:"Invalid"});
 const token=jwt.sign({id:admin._id,role:admin.role},process.env.JWT_SECRET,{expiresIn:"8h"});
 res.json({token});
});

app.get("/analytics",auth,async(req,res)=>{
 const users=await User.countDocuments();
 const licenses=await License.countDocuments({revoked:false});
 res.json({users,licenses});
});

app.listen(process.env.DASHBOARD_PORT,()=>{
 console.log("Enterprise Dashboard Running");
});
