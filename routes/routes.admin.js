const express = require("express");
const session = require('express-session');
const { dev } = require("../config");
const { loadLoginView, loginAdmin, loadHomeView, logOutAdmin, loadDashboardView, deleterUser, loadForgetPassword, forgetPassword, loadResetPassword, resetPassword, editAdminProfile, loadEditProfile, loadNewUser, newUser, addNewUser } = require("../controllers/controller.admin");

const { isLoggedIn, isLoggedOut } = require("../middleware/adminAuth");
const { upload } = require("../middleware/fileUpload");

const adminRoute = express(); //app

//use the session
adminRoute.use(session({
    secret: dev.app.secret_key,
    resave: false,
    saveUninitialized: true,
}));
adminRoute.set("views","./views/admin");
adminRoute.use(express.static("public"));

adminRoute.get("/login",loadLoginView);
adminRoute.post ("/login", loginAdmin);
adminRoute.get ("/home",isLoggedIn,loadHomeView);
adminRoute.get ("/logout",isLoggedIn, logOutAdmin);
adminRoute.get ("/dashboard",isLoggedIn, loadDashboardView);
adminRoute.get ("/delete-user",isLoggedIn, deleterUser);

adminRoute.get ("/forget-password", isLoggedOut,loadForgetPassword);
adminRoute.post ("/forget-password",isLoggedOut, forgetPassword);
adminRoute.get ("/reset-password", isLoggedOut,loadResetPassword);
adminRoute.post ("/reset-password", isLoggedOut,resetPassword);

adminRoute.get ("/edit-user", isLoggedIn,loadEditProfile);
adminRoute.post("/edit-user", upload.single("image"), editAdminProfile);

adminRoute.get("/add-newUser",loadNewUser);
adminRoute.post("/add-newUser", upload.single("image"), addNewUser);

module.exports = adminRoute;