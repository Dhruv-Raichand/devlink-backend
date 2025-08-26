const Express = require("express");
const profileRouter = Express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateUserEdit } = require("../utils/validate");
const bcrypt = require("bcrypt");
const validator = require("validator");

//profile
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
//edit
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateUserEdit(req.body)) {
      throw new Error("Invalid update request");
    } else {
      let loggedInUser = req.user;
      Object.keys(req.body).forEach(
        (key) => (loggedInUser[key] = req.body[key])
      );
      await loggedInUser.save();
      const firstName = loggedInUser.firstName;
      res.json({
        message: `${firstName}, your profile is updated successfully!!`,
        data: loggedInUser,
      });
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
//change password
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    if (!password || !newPassword) {
      throw new Error("current password and new password is required");
    } else if (password === newPassword) {
      throw new Error("new password should not be same as current password");
    } else if (!validator.isStrongPassword(newPassword)) {
      throw new Error("new password is weak");
    }
    const loggedInUser = req.user;
    const isCorrect = await bcrypt.compare(password, loggedInUser.password);
    if (isCorrect) {
      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      loggedInUser.password = newPasswordHash;
      await loggedInUser.save();
      res.json({
        message: "password update successfully",
        data: loggedInUser,
      });
    } else {
      throw new Error("password is not matched");
    }
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

module.exports = profileRouter;
