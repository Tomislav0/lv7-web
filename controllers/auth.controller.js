
const config = require("../config/auth.config");
var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'), // mongo connection
  bodyParser = require('body-parser'), // parses information from POST
  methodOverride = require('method-override'); // used to manipulate POST
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  // Save User to Database
  await mongoose.model('User').create({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      res.format({
        // HTML response will redirect back to the home page
        html: function () {
          res.location("/auth/signin");
          res.redirect("/auth/signin");
        },
        // JSON response will show the newly created project
        json: function () {
          res.json(user);
        }
      })
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = async (req, res) => {
  var user = await mongoose.model('User').findOne({
    email: req.body.email
  });
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  var passwordIsValid = bcrypt.compareSync(
    req.body.password,
    user.password
  );

  if (!passwordIsValid) {
    return res.status(401).send({
      accessToken: null,
      message: "Invalid Password!"
    });
  }

  const token = jwt.sign({ id: user.id },
    config.secret,
    {
      algorithm: 'HS256',
      allowInsecureKeySizes: true,
      expiresIn: 86400, // 24 hours
    });

  res.status(200).send({
    id: user.id,
    name: user.name,
    email: user.email,
    roles: authorities,
    accessToken: token
  });
};