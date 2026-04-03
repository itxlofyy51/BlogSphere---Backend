const blogModel = require("../models/blog.model");
const userModel = require("../models/user.model");
const cloudinary = require("cloudinary").v2;

async function createBlog(req,res){
    console.log("1. BODY:", req.body);
  console.log("2. FILE:", req.file);
  console.log("3. USER FROM TOKEN:", req.user)
try{    
const {title,description}=req.body;
const image = req.file?.path;
const userId = req.user.id;
const blog = await blogModel.create({
    title,
    description,
    image,
    user:userId
})
await userModel.findByIdAndUpdate(userId,{
    $push:{blogs:blog._id}
})
return res.status(201).json({
    message:"Blog is created",
    blog:{
        ...blog._doc,
        _id:blog._id,
    }
})
}catch(err){
    res.status(500).json({
        message:err.message
    })
}
}
async function deleteBlog(req,res){
try{
const { id } = req.params; 
const userId = req.user.id; // ✅ Extract id from URL
const blog = await blogModel.findById(id); // ✅ Get blog from DB
if(!blog){
      return res.status(404).json({ message:"Blog not found" });
}
if(blog.user.toString() !== userId){
    return res.status(403).json({message:"Unauthorized"});
}
if(blog.image){
    const publicId = blog.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`blog-images/${publicId}`)
}
await blogModel.findByIdAndDelete(id);
await userModel.findByIdAndUpdate(userId,{
    $pull:{blogs:blog._id}
})
res.status(200).json({
    message:"blog deleted successfully"
})
}catch(err){
        return res.status(500).json({
            message:err.message
        })
}
}
async function updateBlog(req,res){
try{
const userId = req.user.id;
const {id} = req.params;
const {title,description}=req.body;
const blog = await blogModel.findById(id);
if(!blog){
return res.status(404).json({
    message:"Blog not found"
})}    
if(blog.user.toString() !== userId){
    return res.status(403).json({message:"unauthorized"})
}
if(req.file){
    if(blog.image){
        const publicId = blog.image.split("/").pop().split(".")[0]
        await cloudinary.uploader.destroy(`blog-images/${publicId}`);
    }
    blog.image = req.file.path;
}
if(title) blog.title = title;
if(description) blog.description = description;
await blog.save();
return res.status(200).json({
message:"Blog updated successfully",
blog:{
    title:blog.title,
    _id:blog._id,
    description:blog.description,
    image:blog.image
}
})

}catch(err){
    return res.status(500).json({
            message:err.message
})}
}
async function getBlogs(req,res){
    try{
        const blogs = await blogModel.find().populate("user","name avatar");
        res.status(200).json({
    message:"blogs fetched successfully",
    blogs
})
    }catch(err){
        return res.status(500).json({
            message:err.message
        })
}
}
async function getBlog(req,res){
    try{
        const {id}=req.params;
        const blog = await blogModel.findById(id).populate("user","name avatar _id");
        if(!blog){
            return res.status(404).json({
                message:"Blog not found"
            })}
        res.status(200).json({
        message:"Blog found successfully",
        blog:{
    title:blog.title,
    _id:blog._id,
    description:blog.description,
    image:blog.image,
    user:blog.user
        }
    })
    }catch(err){
        console.log(err);
        res.status(500).json({ message: err.message });
    }
}
module.exports = {createBlog,deleteBlog,updateBlog,getBlogs,getBlog}