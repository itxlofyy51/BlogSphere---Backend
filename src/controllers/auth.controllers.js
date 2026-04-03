const userModel = require("../models/user.model");
const config = require("../config/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const {sendEmail} = require("../services/email.service");
const utils = require("../utils/utils");
const otpModel = require("../models/otp.model")
const {OAuth2Client} = require("google-auth-library");

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

/**
 * @name googleAuth
 * @description Login or register user using Google account
 * @access Public
 */
async function googleAuth(req, res) {
  try {
const {token} = req.body;
if(!token){return res.status(400).json({message:"Token is required"})}
const ticket = await client.verifyIdToken({
    idToken:token,
    audience:config.GOOGLE_CLIENT_ID
});
const payload = ticket.getPayload();
const {email,name,picture,sub:googleId}=payload;
let user = await userModel.findOne({email});
if(!user)
user = await userModel.create({
name,
email,
avatar:picture,
googleId,
provider:"google",
verified:true
})
 // Generate JWTs for app
    const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "10m",
    });
    const refreshToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "User logged in with Google",
      user: {
        _id:user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        verified: user.verified
      },
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid Google token" });
}}


/**
 * @name register
 * @description register a new user, expects name,email and password from request body
 * @access Public 
 */
async function register(req,res){
try{
    const {email,name,password} = req.body;
if(!email || !name || !password){
    return res.status(400).json({
        message:"Please fill all fields"
    })}
const existingUser = await userModel.findOne({email});
if (existingUser && existingUser.verified) {
      return res.status(409).json({ message: "User already exists. Please Login." });
    }
const hashedPassword = await bcrypt.hash(password,10);
const user = await userModel.findOneAndUpdate(
      { email },
      { name, password: hashedPassword, verified: false },
      { upsert: true, new: true }
    );
await otpModel.deleteMany({
    email
})
const otp = utils.generateOTP();
const html = utils.getOtphtml(otp);
const otpHash = await bcrypt.hash(otp,10);
await otpModel.create({
    email,
    otpHash,
    user:user._id
})
sendEmail(email,"OTP VERIFICATION", `Your OTP Code is ${otp}`,html)
res.status(201).json({
    message:"user registered successfully",
    user:{
        _id:user._id,
        email:user.email,
        name:user.name,
        verified:user.verified
    }
})
}catch(error){
    res.status(500).json({
        message:"Server error",
        error:error.message
    })
}
}

/**
 * @name login
 * @description login an existing user, expects email and password from request body
 * @access Public 
 */
async function login(req,res){
    const {email,password}=req.body;
    const user = await userModel.findOne({email});
if(!user){
        return res.status(400).json({
        message:"inavalid email or password"
})}
if(!user.verified){
return res.status(403).json({
    message:"email is not verified"
})}
const isPasswordCorrect = await bcrypt.compare(password,user.password);
if(!isPasswordCorrect){
    return res.status(401).json({
        message:"invalid email or password"
    })}
const refreshToken = jwt.sign({id:user._id},config.JWT_SECRET,{expiresIn:"7d"});
const accessToken = jwt.sign({id:user._id},config.JWT_SECRET,{expiresIn:"10m"});
res.cookie("refreshToken",refreshToken,{
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
})
res.status(200).json({
    message:"user logged in successfully",
    user:{
        _id:user._id,
        name:user.name,
        email:user.email,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}` ,
        verified:user.verified
    },
    accessToken})
}

/**
 * @name getMe
 * @description Fetch the user details and return it to the browser
 * @access Private
 */
async function getMe(req,res){
try{
    const token = req.headers.authorization?.split(" ")[1];
if(!token){
    return res.status(401).json({
        message:"token is required"
    })}
const decoded = jwt.verify(token,config.JWT_SECRET);
const user = await userModel.findById(decoded.id);
res.status(200).json({
    message:"user fetched successfully",
    user:{
        _id:user._id,
        name:user.name,
        email:user.email,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.name}` ,
        verified: user.verified
    }
})}catch(error){
res.status(401).json({
message:"Invalid token"
})
}
}

/**
 * @name refreshToken
 * @description Generate new accessToken from refreshToken
 * @access Public
 */
async function refreshToken(req,res){
try{
const refreshToken = req.cookies.refreshToken;
if(!refreshToken){
    return res.status(401).json({
        message:"unauthorized access"
    })}
const decoded = jwt.verify(refreshToken,config.JWT_SECRET);
const accessToken = jwt.sign({id:decoded.id},config.JWT_SECRET,{expiresIn:"10m"});
const newRefreshToken = jwt.sign({id:decoded.id},config.JWT_SECRET,{expiresIn:"7d"});
res.cookie("refreshToken",newRefreshToken,{
    httpOnly:true,
    secure:true,
    sameSite:'strict',
    maxAge:7*24*60*60*1000
})
res.status(200).json({
    message:"accessToken generated successfullyy",
    accessToken
})


}catch(error){
res.status(401).json({
message:"Invalid token"
})}
}

/**
 * @name verifyEmail
 * @description verify email through otp based verification
 * @access Private
 */
// async function verifyEmail(req,res){
//     const {otp,email}=req.body;
//     const otpDoc = await otpModel.findOne({email});
//     console.log("--- DEBUG START ---");
//     console.log("Email from Frontend:", email);
//     console.log("OTP from Frontend:", otp);
//     console.log("OTP Doc found in DB:", otpDoc ? "YES" : "NO");
//     if(!otpDoc){
//         return res.status(401).json({
//             message:"invalid otp"
//         })}
//     const isOtpCorrect = await bcrypt.compare(otp, otpDoc.otpHash);
//     if (!isOtpCorrect) {
//       return res.status(401).json({ message: "Invalid OTP" });
//     }
//     const user = await userModel.findByIdAndUpdate(otpDoc.user,{
//         verified:true
//     },{new:true});
//     const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, {
//             expiresIn: "10m",
//         });
//     await otpModel.deleteMany({
//         email
//     })
//     res.status(200).json({
//         message:"Email verified successfully",
//         user:{
//             _id:user._id,
//             name:user.name,
//             email:user.email,
//             verified:user.verified
//         },accessToken})
// }
async function verifyEmail(req, res) {
    const { otp, email } = req.body;

    // 1. Force the email to be clean
    const cleanEmail = email.trim().toLowerCase();
    
    // 2. Find the doc
    const otpDoc = await otpModel.findOne({ email: cleanEmail });

    if (!otpDoc) {
        return res.status(401).json({ message: "Invalid OTP: No record found." });
    }

    // 3. FORCE EVERYTHING TO STRINGS FOR BCRYPT
    // Sometimes 'otp' comes from React as a number, which breaks bcrypt.compare
    const inputOtp = otp.toString().trim();
    const isOtpCorrect = await bcrypt.compare(inputOtp, otpDoc.otpHash);

    console.log("Input OTP:", inputOtp);
    console.log("Stored Hash:", otpDoc.otpHash);
    console.log("Match Result:", isOtpCorrect);

    if (!isOtpCorrect) {
        return res.status(401).json({ message: "Invalid OTP" });
    }
const user = await userModel.findByIdAndUpdate(
  otpDoc.user,
  { verified: true },
  { returnDocument: 'after' }
);
const accessToken = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: "10m" });
await otpModel.deleteMany({ email: cleanEmail });

res.status(200).json({
  message: "Email verified successfully",
  user: { _id: user._id, name: user.name, email: user.email, verified: user.verified },
  accessToken,
});
    // ... your success logic (update user to verified: true)
}
/**
 * @name logout
 * @description logout user by clearing the refresh token from cookies
 * @access Private
 */

async function logout(req,res){
const refreshToken = req.cookies.refreshToken;
// if(!refreshToken){
//     return res.status(400).json({
//         message:"refresh token not found"
// })}
res.clearCookie("refreshToken",{
    httpOnly: true,
    secure: true,
    sameSite: "strict"
});
res.status(200).json({
    message:"user logout successfully"
})
}

/**
 * @name updateAvatar
 * @description update user's avatar
 * @access Private
 */
async function updateAvatar(req,res){
    try{
        const userId = req.user.id;
        const avatar = req.file.path;
        const user = await userModel.findByIdAndUpdate(userId,{avatar},{new:true});
        res.status(200).json({
            message:"Avatar updates",
            user:{
                _id:user._id,
                name:user.name,
                email:user.email,
                avatar:user.avatar
            }
        })
    }catch(err){
        console.log(err);
    }
}

module.exports = {register,getMe,refreshToken,login,verifyEmail,googleAuth,logout,updateAvatar}
