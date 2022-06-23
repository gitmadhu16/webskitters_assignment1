const jwt = require('jsonwebtoken');

module.exports.validateToken = async (req, res, next) => {
    let token = req.headers["authorization"];
    if (token && typeof token !== "undefined") {
      verifyToken(token, async (err, data) => {
        if (err) {
          return res.status(401).json({msg:"Invalid Token"});
        }
        next();
      });
    } else {
      return res.status(401).json({msg:"Invalid Token"});
    }
};
async function verifyToken (token, cb){
    try {
      let data = jwt.verify(token, process.env.JWT_SECRET_KEY);
      cb(null, data);
    } catch (error) {
        console.log(error)
      cb(error, null);
    }
  };