const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
},{
    timestamps:true
})
const blogModel = mongoose.model("blog",blogSchema);
module.exports = blogModel;