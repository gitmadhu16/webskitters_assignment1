var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require('body-parser')
var app = express();
var usersRoute = require("./router/users");
const dotenv = require('dotenv');

dotenv.config();
var jsonParser = bodyParser.json()
app.use(bodyParser.urlencoded({extended:false}));

app.use(jsonParser)

// app.use(useragent.express());


// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: "50mb" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});


app.use("/users", usersRoute);

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    });

app.listen(3000);