const { securePassword, comparePassword } = require("../config/securePassword");
const User = require("../models/model.user");
const { getRandomString } = require("../utility/generateToken");
const { sendResetEmail } = require("../utility/sendResetEmail");
const { sendVerificationEmail } = require("../utility/sendVerificationEmail");


const loadLoginView = async (req,res) => {
    try {
        res.status(200).render("login");
    }catch(error) {
        res.status(500).send({
                message : error.message
            });
        }
};
const loginAdmin = async (req,res) => {
    try {
    const email = req.body.email;
    const password = req.body.password;
    const adminData = await User.findOne({ email: email })
    //console.log(adminData);
    if (adminData) {
        //compare the password
        const isMatched = await comparePassword(password,adminData.password);
       if (isMatched){ 
        if(adminData.isVerify){ //verify the email
           req.session.adminId = adminData._id; //set the session
           res.redirect("/admin/home");
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
const loadHomeView = async (req,res) => {
    try {
     //for displaying user details
      const admin= await User.findOne({_id: req.session.adminId});
     //console.log(admin);
      res.status(200).render("home", {admin: admin});
     
    }catch(error) {
        res.status(500).send({
          message : error.message
        });
        }
};
const logOutAdmin = async (req,res) => {
    try {
        //destroy the session
        req.session.destroy();
        res.status(200).redirect("/admin/login");
    }catch(error) {
        res.status(500).send({
            message : error.message
        });
    }
};  
const loadDashboardView = async (req,res) => {
    try {
          let search = req.query.search ? req.query.search : "";
          //pagination
          const { page=1, limit=2 } = req.query;
          const usersCount = await User.find({ isAdmin: 0 ,
            $or: [
                {name : {$regex : ".*" + search + ".*", $options:"i"}},
                {email : {$regex : ".*" + search + ".*", $options:"i"}},
            ]
          }).countDocuments();
          const users = await User.find({isAdmin: 0,
            $or: [
                {name : {$regex : ".*" + search + ".*", $options:"i"}},
                {email : {$regex : ".*" + search + ".*", $options:"i"}},
            ]
         })
           .limit(limit)
           .skip((page -1) * limit);
         res.status(200).render("dashboard", {
            users: users,
            totalPages: Math.ceil(usersCount / limit),
            currentPage: page,
            nextPage: page + 1,
            prevPage : page - 1 ,
         });
        }catch(error) {
          res.status(500).send({
            message : error.message
          });
    }
};
const  deleterUser = async (req,res) => {
    try {
      const userData=await User.findByIdAndDelete({_id: req.query.id});
      if(userData) {
        res.redirect("/admin/dashboard");
      }else {
        res.send("user not deleted");
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
       const adminData = await User.findOne({ email: email});
       if (adminData){
         if(adminData.isVerify) {
            //get random string
            const randomstring = getRandomString();
            //console.log(randomstring);
            const updateToken = await User.updateOne({ email: email},
                {
                    $set: {
                        token: randomstring,
                    },
                });
                sendResetEmail(adminData.name, adminData.email, adminData._id, randomstring);
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
    const adminData = await User.findOne({ token: token});
    if(adminData)  {
      res.render("reset-password", {adminId: adminData._id});
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
        const adminId = req.body.adminId;

        const hashPassword = await securePassword(password);
        await User.findByIdAndUpdate({_id: adminId},
            {
                $set : {
                    password: hashPassword, 
                     token: "" ,              },
            });
            res.redirect("/admin/login");
    }catch(error) {
      res.status(500).send({
      message : error.message
    });
    }
};
const loadEditProfile = async (req,res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({_id: id});
        if(userData) {
            res.status(200).render("edit", {user: userData});
        } else {
            res.status(404).send({
                message: `user doee not exist with this id`,
            });
        }
   }catch(error) {
        res.status(500).send({
                message : error.message
            });
        }
    };
const editAdminProfile = async (req,res) => {
    try {
      const id = req.query.id;
      if(req.file) {
        const user= await User.findByIdAndUpdate({_id: id},
            {
               $set: {
                    name: req.body.name,
                    email: req.body.email,
                    isVerify: req.body.verify,
                    image: req.file.filename,
                },
            });
      }else {
        const user= await User.findByIdAndUpdate({_id: id},
            {
               $set: {
                    name: req.body.name,
                    email: req.body.email,
                    isVerify: req.body.verify,
                },
            });
      }
        res.redirect("/admin/dashboard");
    }catch(error) {
        res.status(500).send({
            message : error.message
        });
    }
};
const loadNewUser = async (req,res) => {
try {
    res.status(200).render("new-user");
}catch(error) {
    res.status(500).send({
            message : error.message
        });
    }
};

const addNewUser = async (req,res) => {
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
console.log(userData);
  if(userData) {
    sendVerificationEmail(userData.name,userData.email,userData._id); //verify the email
    res.status(201).render("new-user",
    {message: "Added new user.please verify your email address"});
  }else {
    res.status(404).send({message:"route not found"});
  }
}catch(error) {
    res.status(500).send({
        message : error.message
    });
    }
};

    
module.exports = 
    { loadLoginView,loginAdmin,
      loadHomeView ,logOutAdmin,
      loadDashboardView, deleterUser,
      loadForgetPassword ,forgetPassword,
      loadResetPassword, resetPassword,
      loadEditProfile, editAdminProfile ,
      loadNewUser ,addNewUser      
    };