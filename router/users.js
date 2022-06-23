var express = require("express");
var router = express.Router();
const {usercreate,login,viewUser,updateUser,listAllCategories,listQuestionsByCategory,addBulkQuestion} = require('../controller/users.controller')
const {validateToken} = require("../auth")
var multer = require('multer');
  
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        let fileName = file.fieldname + '_' + Date.now()
        req.fileUploadName = fileName
        cb(null,fileName)
    }
});
  
var upload = multer({ storage: storage });




// All routes
router.post('/add',usercreate); // JWT validation not implemented for testing purposes
router.post('/login',login)
router.get('/viewUser/:id',validateToken,viewUser)
router.post('/updateUser/:id',validateToken,upload.fields([
    {
      name: "ProfilePic",
      maxCount: 1,
    },
  ]),updateUser)
  
router.get('/listAllCategories',validateToken,listAllCategories)
router.get('/listQuestionsByCategory/:id',validateToken,listQuestionsByCategory)
router.post('/addBulkQuestion',validateToken,upload.fields([
    {
      name: "bulkQuestion",
      maxCount: 1
    },
  ]),addBulkQuestion)
  
  

module.exports = router; 

