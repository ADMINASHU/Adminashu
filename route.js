const express = require("express");
const route = express.Router();
const cors = require("cors");
const whiteList = ["http://localhost:3000", "http://localhost:4000"];
const corsOption = {
  origin: (origin, callback) => {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by cors"));
    }
  },
  optionsSuccessStatus: 200,
};
route.use(cors(corsOption));
route.use(express.json());
route.use(express.urlencoded({ extended: false }));
const userModel = require("./userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwtVerify = require("./jwtVerify");
// const bodyParser = require("body-parser");

route.post("/register", async (req, res) => {
  const { uname, email, password, cPassword } = req.body;
  if (!uname || !email || !password || !cPassword)
    return res.status(400).json({ error: "please fill all field" });
  if (password != cPassword)
    return res.status(412).json({ error: "Confirm password not matched" });
  try {
    const userExist = await userModel.findOne({ uname: uname });
    if (userExist) return res.status(409).json({ error: "User already exist" });
    const user = new userModel({ uname, email, password });
    await user.save();
    res.status(201).json({ msg: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "User registration failed" });
  }
});

route.post("/signin", async (req, res) => {
  try {
    const { uname, password } = req.body;
    if (!uname || !password)
      return res.status(400).json({ error: "Please fill all field" });
    const dbUser = await userModel.findOne({ uname: uname });
    if (!dbUser) return res.status(401).json({ error: "invalid credentials" });
    const isMatch = await bcrypt.compare(password, dbUser.password);
    if (isMatch) {
      // create jwt
      const accessToken = jwt.sign(
        { username: dbUser.uname },
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: "10m" }
      );
      const refreshToken = jwt.sign(
        { username: dbUser.uname },
        process.env.REFRESH_SECRET_KEY,
        { expiresIn: "1d" }
      );
      // save token to DB
      const updateUser = async (id) => {
        try {
          await userModel.findByIdAndUpdate(
            { _id: id },
            {
              $set: { token: refreshToken },
            },
            {
              new: true,
              useFindAndModify: false,
            }
          );
        } catch (error) {
          console.log(error);
        }
      };
      await updateUser(dbUser._id);

      //save refreshToken in cookies
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // send user data to front-end
      res.status(200).json({
        username: dbUser.uname,
        email: dbUser.email,
        role: dbUser.token,
        accessToken: accessToken,
      });
    } else {
      res.status(401).json({ error: "invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "User SignIn failed" });
  }
});

// Verify jwt token
// route.use(jwtVerify);

route.get("/users", async (req, res) => {
  try {
    const users = await userModel.find();
    // send user data to front-end
    // const userData = { username: users.uname, role: users.role };
    res.send(users);
    // console.log(userData);
  } catch (error) {
    console.log(error);
  }
});

module.exports = route;
