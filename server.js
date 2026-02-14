require('dotenv').config();
const TelegramBot=require('node-telegram-bot-api');
const OpenAI=require('openai');
const {v4:uuidv4}=require('uuid');
const connectDB=require('./config/db');
const User=require('./models/User');
const License=require('./models/License');
const Filter=require('./models/Filter');
const File=require('./models/File');
const validator=require('validator');

connectDB();

const bot=new TelegramBot(process.env.BOT_TOKEN,{polling:true});
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

async function validLicense(user){
 if(!user.licenseKey) return false;
 const lic=await License.findOne({key:user.licenseKey,isActive:true,revoked:false});
 return !!lic;
}

bot.on("message",async(msg)=>{
 try{
  const userId=String(msg.from.id);
  let user=await User.findOne({telegramId:userId});
  if(!user) user=await User.create({telegramId:userId,username:msg.from.username});

  if(user.isBlocked) return;

  if(msg.document){
    await File.create({
      userId,
      telegramFileId:msg.document.file_id,
      fileName:msg.document.file_name,
      fileSize:msg.document.file_size,
      mimeType:msg.document.mime_type
    });
    return bot.sendMessage(msg.chat.id,"File stored.");
  }

  const filters=await Filter.find();
  if(msg.text){
    for(const f of filters){
      if(msg.text.toLowerCase().includes(f.keyword.toLowerCase()))
        return bot.sendMessage(msg.chat.id,f.reply);
    }
  }
 }catch(e){console.error(e)}
});

bot.onText(/\/activate (.+)/,async(msg,match)=>{
 const key=match[1];
 const lic=await License.findOne({key,revoked:false});
 if(!lic) return bot.sendMessage(msg.chat.id,"Invalid License");
 lic.isActive=true;
 lic.activatedBy=String(msg.from.id);
 await lic.save();
 const user=await User.findOne({telegramId:String(msg.from.id)});
 user.licenseKey=key;
 await user.save();
 bot.sendMessage(msg.chat.id,"License Activated");
});

bot.onText(/\/code (.+)/,async(msg,match)=>{
 const user=await User.findOne({telegramId:String(msg.from.id)});
 if(!await validLicense(user))
  return bot.sendMessage(msg.chat.id,"Valid License Required");
 const prompt=match[1];
 if(!validator.isLength(prompt,{min:5}))
  return bot.sendMessage(msg.chat.id,"Invalid Prompt");
 const res=await openai.chat.completions.create({
   model:"gpt-4o-mini",
   messages:[{role:"user",content:prompt}],
   max_tokens:800
 });
 user.tokenUsage+=res.usage.total_tokens;
 await user.save();
 bot.sendMessage(msg.chat.id,res.choices[0].message.content);
});

console.log("Enterprise SaaS Bot Running - NITIN SOFTWARE PVT.LTD");
