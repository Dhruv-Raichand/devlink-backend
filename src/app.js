const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user")


app.post("/signup", async (req, res) => {
    const user = new User({
        firstName: "John",
        lastName: "Marston",
        emailId: "johnmarston911@email.com",
        password: "johnmarston",
    });
    try{
      await user.save();
      res.send("User Added Successfully!")
    } catch(err) {
      res.status(400).send("Error in saving the user: "+ err.message)
    }
})

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
