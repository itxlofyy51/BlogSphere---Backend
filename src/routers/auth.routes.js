const authController = require("../controllers/auth.controllers");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload");
const express = require("express");
const authRouter = express.Router();

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register",authController.register);

/**
 * @route POST /api/auth/login
 * @description login an existing user
 * @access Public
 */
authRouter.post("/login",authController.login);

/**
 * @route GET /api/auth/get-me
 * @description Fetch the user details
 * @access Private
 */
authRouter.get("/get-me",authController.getMe)

/**
 * @route GET /api/auth/refresh-token
 * @description generate new accessToken from refreshToken
 * @access Public
 */
authRouter.get("/refresh-token",authController.refreshToken);

/**
 * @route GET /api/auth/verify-email
 * @description verify email through otp based verification
 * @access Private
 */
authRouter.post("/verify-email",authController.verifyEmail);

/**
 * @route Post /api/auth/google
 * @description Login or register user using Google account
 * @access Public
 */
authRouter.post("/google",authController.googleAuth);
/**
 * @route GET /api/auth/logout
 * @description logout user by clearing the refresh token from cookies
 * @access Private
 */
authRouter.get("/logout",authController.logout);

/**
 * @route PUT /api/auth/update-avatar
 * @description Updates user's avatar
 * @access Private
 */
authRouter.put("/update-avatar",authMiddleware,upload.single("avatar"),authController.updateAvatar);

module.exports = authRouter;