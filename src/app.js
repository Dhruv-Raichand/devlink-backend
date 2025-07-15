const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");


app.use(express.json())

app.post("/signup", async (req, res) => {
  //Creating a new instance of the User model
    const user = new User(req.body);
    try{
      await user.save();
      res.send("User Added Successfully!")
    } catch(err) {
      res.status(400).send("Error in saving the user: "+ err.message)
    }
})

app.get("/user", async (req, res) => {
  const email = req.body.emailId;
  try{
    const user = await User.findOne({ emailId: email });
    if (user.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch(err){
    res.status(400).send("Something Went Wrong!!!")
  }
});

app.get("/feed", async (req, res) => {
  try{
    const users = await User.find();
    res.send(users);
  } catch(err) {
    res.status.send("Something Went Wrong!!!")
  }
});

app.get("/userid", async (req, res) => {
  const userid = req.body._id;
  try{
    const user = await User.findById(userid);
    res.send(user);
  } catch(err){
    res.status(400).send("Something Went Wrong!!!")
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
