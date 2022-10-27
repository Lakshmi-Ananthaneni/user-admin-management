const bcrypt = require("bcrypt");
const saltRounds = 10;

//secure the passwword
exports.securePassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};
//comparre the password when login
exports.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
