const Express = require("express");
const requestRouter = Express.Router();
const { userAuth } = require("../middlewares/auth");


//Send Connection Request
requestRouter.post("/sendConnectionRequest", userAuth, (req, res) => {
  try {
    const user = req.user;
    const { firstName } = user;
    res.send(firstName + " sent the Connection Request");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = requestRouter;
