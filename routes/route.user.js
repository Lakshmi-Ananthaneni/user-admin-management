const express = require("express");
const session = require('express-session');
const { dev } = require("../config");
const { loadRegister, registerUser, loadLogin, loginUser, userProfile, loadForgetPassword, forgetPassword, loadHome, logOutUser, verifyEmail, loadResendVerification, resendVerificationLink, loadResetPassword, resetPassword, loadEditProfile, editUserProfile } = require("../controllers/controller.user");
const { isLoggedIn, isLoggedOut } = require("../middleware/auth");
const { upload } = require("../middleware/fileUpload");

const userRoute = express(); //app

//use the session
userRoute.use(session({
    secret: dev.app.secret_key,
    resave: false,
    saveUninitialized: true,
}));
userRoute.use(express.static("public"));

userRoute.get("/register",isLoggedOut, loadRegister);
userRoute.post("/register", upload.single("image"), registerUser);
userRoute.get ("/login",isLoggedOut, loadLogin);
userRoute.post ("/login", loginUser);
userRoute.get ("/home",isLoggedIn, loadHome);
userRoute.get ("/logout",isLoggedIn, logOutUser);

userRoute.get ("/verify", isLoggedOut,verifyEmail);
userRoute.get ("/resend-verification", isLoggedOut,loadResendVerification);
userRoute.post ("/resend-verification",isLoggedOut, resendVerificationLink);

userRoute.get ("/forget-password", isLoggedOut,loadForgetPassword);
userRoute.post ("/forget-password",isLoggedOut, forgetPassword);
userRoute.get ("/reset-password", isLoggedOut,loadResetPassword);
userRoute.post ("/reset-password", isLoggedOut,resetPassword);

userRoute.get ("/edit", isLoggedIn,loadEditProfile);
userRoute.post("/edit", upload.single("image"), editUserProfile);


module.exports = userRoute;