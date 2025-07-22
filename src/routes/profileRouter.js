const Express = require("express");
const profileRouter = Express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateUserEdit } = require("../utils/validate");

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
      res.json({ message: `${firstName}, your profile is updated successfully!!`, data: loggedInUser });
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});
//forget password
profileRouter.patch("profile/password", async (req, res) => {
  
})


module.exports = profileRouter;
