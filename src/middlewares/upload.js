const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.js");

if(!process.env.CLOUDINARY_CLOUD_NAME){
    throw new Error("CLOUDINARY_CLOUD_NAME  is not defined in environmental variables")
}
if(!process.env.CLOUDINARY_API_KEY){
    throw new Error("CLOUDINARY_API_KEY  is not defined in environmental variables")
}
if(!process.env.CLOUDINARY_API_SECRET){
    throw new Error("CLOUDINARY_API_SECRET  is not defined in environmental variables")
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog-images",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;