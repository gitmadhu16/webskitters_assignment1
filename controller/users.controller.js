var base64 = require("base-64");
var utf8 = require("utf8");
const connectToDatabase = require("../db");
const jwt = require("jsonwebtoken");
const async = require("async");


const usersModel = require("../modules/users.modules");
const categoriesModel = require("../modules/categories.modules");
const questionsModel = require("../modules/questions.modules");
const { Mongoose, default: mongoose } = require("mongoose");

var headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
};
var crypto = require("crypto"),
  algorithm = "aes-256-ctr",
  password = "d6F3Efeq";

function encrypt(text) {
  var cipher = crypto.createCipher(algorithm, text);
  var crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
}

function decrypt(text) {
  var decipher = crypto.createDecipher(algorithm, text);
  var dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
}

// /user/add

module.exports.usercreate = async (req, res) => {
  req.body.password = encrypt(req.body.password);

  let newuser = new usersModel({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  connectToDatabase().then(() => {
    usersModel.findOne({ email: req.body.email },
      function (err, user) {
        if (err) {
          return res.json({
            // headers: headers,
            statusCode: 200,
            status: false,
            msg: err,
          });
        }
        else {
          if (user) {
            return res.json({
              status: false,
              msg: "user already exists",
            });
          }
          else {
            usersModel.create(newuser).then(data => {
              return res.json({
                // headers: headers,
                statusCode: 200,
                status: true,
                item: newuser,
              });

            }

            );
          }
        }
      }
    )
  })
};
// /user/login

module.exports.login = (req, res) => {
  console.log(req.body);
  req = req.body;

  connectToDatabase().then(() => {
    usersModel.findOne(
      { email: req.email },
      "name email password type status",
      function (err, user) {
        if (err) {
          return res.json({
            // headers: headers,
            statusCode: 200,
            status: false,
            msg: err,
          });
        } else {
          let decryptval = encrypt(req.password);
          if (user == null) {
            console.log("4");
            return res.json({
              // headers: headers,
              statusCode: 200,
              status: false,
              msg: "Email-Id Is Invalid.",
            });
          }
          if (decryptval != user.password) {
            return res.json({
              // headers: headers,
              statusCode: 200,
              status: false,
              msg: "Password Does Not Match.",
            });
          } else {
            // login checking passed
            let jwtSecretKey = process.env.JWT_SECRET_KEY;
            let data = {
              time: Date(),
              userId: user._id,
            };

            const token = jwt.sign(data, jwtSecretKey);

            return res.json({
              // headers: headers,
              statusCode: 200,
              status: true,
              msg: "Login Sucess",
              item: user,
              token: token,
            });
          }
        }
      }
    );
  });
};

module.exports.viewUser = (req, res) => {
  let { id } = req.params;
  connectToDatabase()
    .then(() => {
      usersModel.findOne(
        { _id: id },
        "name email password type status",
        function (err, user) {
          if (err) {
            return res.json({
              // headers: headers,
              statusCode: 200,
              status: false,
              msg: "Data does not Exist",
            });
          }
          return res.json({
            // headers: headers,
            statusCode: 200,
            status: true,
            item: user,
          });
        }
      );
    })
    .catch((err) => {
      return res.status(401).json({ msg: "Internal server Error!" });
    });
};

module.exports.updateUser = (req, res) => {
  let { id } = req.params;
  let { name, email, password, status } = req.body;
  if (password) {
    password = encrypt(password);
  }

  let fileUploadName = req.fileUploadName;
  let updateData = { name, email, password, status };
  if (fileUploadName) {
    updateData.profilePic = fileUploadName;
    console.log(fileUploadName);
  }
  connectToDatabase()
    .then(() => {
      usersModel
        .updateOne({ _id: id }, updateData)
        .then((data) => {
          return res.json({
            // headers: headers,
            statusCode: 200,
            status: true,
            item: data,
          });
        })
        .catch((err) => {
          return res.status(401).json({ msg: "Internal server Error!" });
        });
    })
    .catch((err) => {
      return res.status(401).json({ msg: "Internal server Error!" });
    });
};

module.exports.listAllCategories = (req, res) => {
  connectToDatabase()
    .then(() => {
      categoriesModel
        .find({})
        .then((data) => {
          return res.json({
            // headers: headers,
            statusCode: 200,
            status: true,
            item: data,
          });
        })
        .catch((err) => {
          return res.status(401).json({ msg: "Internal server Error!" });
        });
    })
    .catch((err) => {
      return res.status(401).json({ msg: "Internal server Error!" });
    });
};

module.exports.listQuestionsByCategory = (req, res) => {
  let { id } = req.params;
  connectToDatabase()
    .then(() => {
      questionsModel
        .find({ category_id: mongoose.Types.ObjectId(id) })
        .then((data) => {
          return res.json({
            // headers: headers,
            statusCode: 200,
            status: true,
            item: data,
          });
        })
        .catch((err) => {
          return res.status(401).json({ msg: "Internal server Error!" });
        });
    })
    .catch((err) => {
      return res.status(401).json({ msg: "Internal server Error!" });
    });
};

var csvtojson = require("csvtojson");

module.exports.addBulkQuestion = async (req, res) => {
  let fileUploadName = req.fileUploadName;

  const csvfilepath = `${__dirname}/../uploads/${fileUploadName}`;
  console.log(csvfilepath);
  csvtojson()
    .fromFile(csvfilepath)
    .then((csvData) => {
      let csvCategories = Object.keys(csvData[0]);
      let newdata = [];
      csvCategories.map((cat) => {
        let arrData = []
        csvData.map((data) => {
          arrData.push(data[`${cat}`]);
        });
        newdata.push({ [`${cat}`]: arrData })
      });
      console.log(newdata)
      let questionsDataAll = []
      connectToDatabase()
        .then(() => {
          async.each(
            newdata,
            (key, callback) => {
              (async () => {
                categoriesModel.create({ category_name: Object.keys(key)[0] })
                  .then((categoryData) => {
                    key[Object.keys(key)[0]].map((arrData) => {
                      if (arrData != '') {
                        questionsDataAll.push({
                          question: arrData,
                          category_id: categoryData._id
                        })
                      }

                    });
                    callback();
                  })

              })();
            },
            async (err) => {
              console.log(questionsDataAll);
              questionsModel.create(questionsDataAll).then(() => {
                return res.json({
                  // headers: headers,
                  statusCode: 200,
                  status: true,
                  item: newdata,
                });
              })
            }
          );

        })

        .catch((err) => {
          return res.status(401).json({ msg: err });
        });

    });
};

