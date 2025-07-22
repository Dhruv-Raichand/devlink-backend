const Express = require("express");
const authRouter = Express.Router();
const User = require("../models/user");
const validate = require("../utils/validate");

//Creating a new instance of the User model
authRouter.post("/signup", async (req, res) => {
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
authRouter.post("/login", async (req, res) => {
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
      res.cookie("token", Token, {
        expires: new Date(Date.now() + 24 * 7 * 3600000),
      });
      res.send("login successfull!!");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

//logout
authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()) });
  res.send("logout successfull!!!");
});

module.exports = authRouter;
