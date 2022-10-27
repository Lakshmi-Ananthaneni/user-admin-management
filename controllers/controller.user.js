const { securePassword, comparePassword } = require("../config/securePassword");
const User = require("../models/model.user");
const { getRandomString } = require("../utility/generateToken");
const { sendResetEmail } = require("../utility/sendResetEmail");
const { sendVerificationEmail } = require("../utility/sendVerificationEmail");


const loadRegister = async (req,res) => {
    try {
      res.status(200).render("register");
    }catch(error) {
        res.status(500).send({
            message : error.message
        });
    }
};

const registerUser = async (req,res) => {
    const password = req.body.password;
    const hashPassword = await securePassword(password);//secure the password
    try {
        const newUser = new User ({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
        image: req.file.filename,
        isAdmin: 0,
})
const userData = await newUser.save();
  if(userData) {
    sendVerificationEmail(userData.name,userData.email,userData._id); //verify the email
    res.status(201).render("register",
    {message: "Registration successfull.please verify your email address"});
  }else {
    res.status(404).send({message:"route not found"});
  }
}catch(error) {
    res.status(500).send({
        message : error.message
    });
    }
};

const loadLogin = async (req,res) => {
try {
res.status(200).render("login");
}catch(error) {
    res.status(500).send({
            message : error.message
        });
    }
};
const loginUser = async (req,res) => {
    try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email })
    console.log(userData);
      if (userData) {
          //compare the password
          const isMatched = await comparePassword(password,userData.password);
          if (isMatched){ 
            if(userData.isVerify){ //verify the email
              req.session.userId = userData._id; //set the session
              res.redirect("/home");
            }else {
            res.status(404).render("login",{message:"please verify your emial first"});
            }
          } else {
            res.status(404).send({message:"email and password does not match"});
           }
       }else {
         res.status(404).send({message:"user doent exist with this email"});
        }
    }catch(error) {
        res.status(500).send({
                message : error.message
            });
        }
};

const loadHome = async (req,res) => {
    try {
        //for displaying user details
        const user= await User.findOne({_id: req.session.userId});
        //console.log(user);

        res.status(200).render("home", {user: user});
    }catch(error) {
        res.status(500).send({
            message : error.message
        });
    }
};

const logOutUser = async (req,res) => {
    try {
        //destroy the session
        req.session.destroy();

        res.status(200).redirect("/login");
    }catch(error) {
        res.status(500).send({
            message : error.message
        });
    }
};   
const verifyEmail = async (req,res) => {
    try {
        const id = req.query.id;
        const userUpdated = await User.updateOne({_id: id},
            {
                $set: {
                    isVerify : 1
                }
            });
            if (userUpdated){
                res.render("verification", {message:"verrification successful"});  
            }else {
                res.render("verification", {message:"verrification unsuccessful"}); 
            }
       
    }catch(error) {
        res.status(500).send({
            message : error.message
        });
    }
};  
                
const loadResendVerification = async (req,res) => {
    try {
         res.render("resend-verification");               
    }catch(error) {
      res.status(500).send({
        message : error.message
      });
    }
}; 
const resendVerificationLink = async (req,res) => {
    try {
          const email = req.body.email;  
          const userData = await User.findOne({email: email});
          if(userData) {
            sendVerificationEmail(userData.name,userData.email,userData._id); //verify the email
            res.render("resend-verification",{message: "Verification link has been sent to your email",});
          } else {
            res.render("resend-verification", {message: "This email does not exist",});
          }           
    }catch(error) {
      res.status(500).send({
        message : error.message
      });
    }
};                 
const loadForgetPassword = async (req,res) => {
    try {
    res.render("forget-password");
    }catch (error){
        res.status(500).send({
            message : error.message
        });
    }
};
const forgetPassword = async (req,res) => {
    try {
       const email = req.body.email;
       const userData = await User.findOne({ email: email});
       if (userData){
         if(userData.isVerify) {
            //get random string
            const randomstring = getRandomString();
            //console.log(randomstring);
            const updateToken = await User.updateOne({ email: email},
                {
                    $set: {
                        token: randomstring,
                    },
                });
                sendResetEmail(userData.name, userData.email, userData._id, randomstring);
                res.render("forget-password",{
                    message: "please check your email to reset password",
                });
         }else {
            res.render("forget-password",{
                message: "verify your email address",
            });
         }
       }else {
        res.render("forget-password",{
            message: "email does not exit",
        });
       }
    }catch(error) {
         res.status(500).send({
            message : error.message
        });
    }
};
const loadResetPassword = async (req,res) => {
    try {
    const token = req.query.token;
    const userData = await User.findOne({ token: token});
    if(userData)  {
      res.render("reset-password", {userId: userData._id});
    } 
    }catch(error) {
        res.status(500).send({
                message : error.message
            });
        }
    };
const resetPassword = async (req,res) => {
    try {
        const password = req.body.password;
        const userId = req.body.userId;

        const hashPassword = await securePassword(password);
        await User.findByIdAndUpdate({_id: userId},
            {
                $set : {
                    password: hashPassword, 
                     token: "" ,              },
            });
            res.redirect("/login");
    }catch(error) {
      res.status(500).send({
      message : error.message
    });
    }
};

const loadEditProfile = async (req,res) => {
    try {
        const id = req.query.id;
        const user = await User.findById({_id: id});
        if(user) {
            res.status(200).render("edit", {user: user});
        } else {
            res.redirect("/home");
        }
   }catch(error) {
        res.status(500).send({
                message : error.message
            });
        }
    };
const editUserProfile = async (req,res) => {
    try {
      const id = req.body.user_id;
      //console.log(req.body);
      if(req.file) {
        const user= await User.findByIdAndUpdate({_id: id},
            {
               $set: {
                    name: req.body.name,
                    email: req.body.email,
                    image: req.file.filename,
                },
            });
      }else {
        const user= await User.findByIdAndUpdate({_id: id},
            {
               $set: {
                    name: req.body.name,
                    email: req.body.email,
                },
            });
      }
        res.redirect("/home");
    }catch(error) {
        res.status(500).send({
            message : error.message
        });
    }
};

module.exports = {loadRegister,registerUser,
                  loadLogin,loginUser,
                  loadForgetPassword,forgetPassword,
                  loadResetPassword,resetPassword,
                  loadHome,logOutUser,
                  loadResendVerification,resendVerificationLink,
                  verifyEmail,
                  loadEditProfile,editUserProfile};