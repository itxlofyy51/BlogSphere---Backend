const mongoose = require("mongoose");
const config = require("./config")

async function connectDb(){
    await mongoose.connect(config.MONGO_URI);
    console.log("connected to Database");
}
module.exports = connectDb;