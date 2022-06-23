const mongoose = require("mongoose");

var usersSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 12
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email required']
    },
    password: {
        type: String,
        maxlength: 50,
        required: true
    },
    profilePic:{
        type: String,
    },
    createdon_datetime: {type: Number, default:Math.round((new Date()).getTime())}


});
var usersModel = mongoose.model("Users", usersSchema);
console.log(usersModel, 'created student database successfully')

module.exports = usersModel;