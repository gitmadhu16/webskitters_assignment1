const mongoose = require("mongoose");

var categoriesSchema = mongoose.Schema({
    category_name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 20
    },
    createdon_datetime: {type: Number, default:Math.round((new Date()).getTime())}


});
var categoriesModel = mongoose.model("categories", categoriesSchema);
module.exports = categoriesModel;