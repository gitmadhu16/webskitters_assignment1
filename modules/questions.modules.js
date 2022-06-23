const mongoose = require("mongoose");

var questionsSchema = mongoose.Schema({
    question: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 200
    },
    category_id:{
        type:Object
    },
    createdon_datetime: {type: Number, default:Math.round((new Date()).getTime())}


});
var questionsModel = mongoose.model("questions", questionsSchema);
module.exports = questionsModel;