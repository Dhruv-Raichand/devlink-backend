const Express = require('express');
const profileRouter = Express.Router();
const { userAuth } = require("../middlewares/auth");



//profile
profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;