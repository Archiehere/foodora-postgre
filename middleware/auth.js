const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    let token = req.header("Authorization");
    // console.log(token);
    if (!token) return res.status(401).json({ msg: "Please login before proceeding any further !" });
    token = token.replace(/^Bearer\s+/, "");
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(402).json({ msg: "Invalid Authentication" });

      req.user = user;
      next();
    })
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = auth;