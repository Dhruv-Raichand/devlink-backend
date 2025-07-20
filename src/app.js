const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const validate = require("./utils/validate");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

const app = express();
app.use(express.json());
app.use(cookieParser());

//Creating a new instance of the User model
app.post("/signup", async (req, res) => {
  const { firstName, lastName, emailId, password } = req.body;
  try {
    //validate user data
    validate(req.body);
    //hashing user password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashedPassword,
    });
    await user.save();
    res.send("User Added Successfully!" + user);
  } catch (err) {
    res.status(400).send("Error in saving the user: " + err.message);
  }
});

//login user
app.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isCorrect = await user.comparePasswords(password);
    if (isCorrect) {
      //create JWT token
      const Token = await user.getJWT();
      //Add the token to cookie and send the response back to user
      res.cookie("token", Token, {expires: new Date(Date.now() + 24 * 7 * 3600000)});
      res.send("login successfull!!");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

//profile
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//Send Connection Request
app.post("/sendConnectionRequest", userAuth, (req, res) => {
  try {
    const user = req.user;
    const { firstName } = user;
    res.send(firstName + " sent the Connection Request");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database Connection Established....");
    app.listen(3000, () => {
      console.log("Server is successfully listening on port 3000...");
    });
  })
  .catch((err) => {
    console.error("Database Connection Failed!!!");
  });
