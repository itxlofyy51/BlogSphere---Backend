const jwt = require("jsonwebtoken");
const config = require("../config/config");

const authMiddleware=(req,res,next)=>{
const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided or wrong format" });
    }
    const token = authHeader.split(" ")[1];
if(!token){
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
}
try{
    const decoded = jwt.verify(token,config.JWT_SECRET);
    req.user=decoded;
    next();
}catch(err){
    res.status(403).json({ message: "Invalid or Expired Token" });
    throw err;
}
}
module.exports=authMiddleware;

