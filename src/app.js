const cookieParser = require("cookie-parser");
const express = require("express");
const morgan = require("morgan");
const app = express();
const authRouter = require("./routers/auth.routes");
const cors = require("cors");
const blogRouter = require("./routers/blog.routes");

app.use(cors({
    origin:"*",
    credentials:true
}))
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none"); 
  next();
});

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));


app.use("/api/auth",authRouter);
app.use("/api/blog",blogRouter);

module.exports = app;