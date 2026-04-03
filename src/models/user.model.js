const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String
    },
    googleId:{
        type:String
    },
    avatar:{
        type:String
    },
    provider:{
        type:String,
        enum:["local","google"],
        default:"local"
    },
    verified:{
        type:Boolean,
        default:false
    },
    blogs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"blog"
    }]
},{
    timestamps:true
})
const userModel = mongoose.model("user",userSchema);
module.exports = userModel;