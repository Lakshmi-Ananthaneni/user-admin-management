//create a schema and model
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
        
    name: {
          type: String,
          required: [true, 'Please enter your name'],
          maxLength: [30, 'Name cannot exceed 30 characters'],
          minLength: [4, 'Name should have more than 4 characters'],
          trim: true,
        },
      email: {
          type: String,
          required: [true, 'Please enter your Email'],
          unique: true,
          //validate: [validator.isEmail, 'Please Enter a valid Email'],
          trim: true,
        },
      
        password: {
          type: String,
          required: [true, 'Please enter your Password'],
          minLength: [4, 'Password should be greater than 4 characters'],
          //select: false,
          
        },
        image: 
        { 
          type: String,
          required: [true, "image is required"]
        },
        isAdmin:
        {
          type: Number,
          required: [true,"isAdmin is required"],
        } ,
        isVerify:
        {
          type: Number,
          default: 0
          
        }, 
        createdAt: {
          type: Date,
          default: Date.now,
        },
        token: {
          type: String,
          default: "",
        },
      })
      
      //export default mongoose.model<UserDocument>('User', userSchema)
      const User = mongoose.model("Users", userSchema);

module.exports = User;
      