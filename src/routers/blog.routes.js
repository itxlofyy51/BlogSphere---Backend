const express = require("express");
const blogRouter = express.Router();
const blogControllers = require("../controllers/blog.controllers");
const upload = require("../middlewares/upload");
const authMiddleware = require("../middlewares/auth.middleware");

/**
 * @route POST /api/blog/create
 * @description Create a new blog
 * @access Public
 */
blogRouter.post("/create-blog",authMiddleware,upload.single("image"),blogControllers.createBlog);

/**
 * @route DELETE /api/blog/delete-blog
 * @description delete an existing blog
 * @access Public
 */
blogRouter.delete("/delete-blog/:id",authMiddleware,blogControllers.deleteBlog);

/**
 * @route PUT /api/blog/update-blog
 * @description updates an existing blog
 * @access Public
 */
blogRouter.put("/update-blog/:id", authMiddleware,upload.single("image"), blogControllers.updateBlog);

/**
 * @route GET /api/blog/get-blogs
 * @description  get all blogs
 * @access Public
 */
blogRouter.get("/get-blogs", blogControllers.getBlogs);

/**
 * @route GET /api/blog/:id
 * @description  get a specific blog by ID
 * @access Public
 */
blogRouter.get("/:id",authMiddleware,blogControllers.getBlog);

module.exports=blogRouter;