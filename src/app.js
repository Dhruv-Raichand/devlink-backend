const express = require("express");
const connectDB = require("./config/database");
const User = require("./models/user");
const validate = require("./utils/validate");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

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
    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      throw new Error("Invalid Credentials");
    }
    const Token = jwt.sign({ _id: user._id }, "@DinderBoi123");
    res.cookie("token", Token);
    res.send("login successfull!!");
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

//profile
app.get("/profile", async (req, res) => {
  try {  
  const { token } = req.cookies;
  if (!token) {
    throw new Error("Invalid Token!!!");
  }
  const decoded = jwt.verify(token, "@DinderBoi123");
  const user = await User.findOne({_id: decoded._id});
  if(!user) {
    throw new Error("User not found!!!");
  }
  res.send(user)
} catch (err) {
    res.status(400).send("ERROR: " + err.message);
  };
});

app.get("/user", async (req, res) => {
  const email = req.body.emailId;
  try {
    const user = await User.findOne({ emailId: email });
    if (user.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send("User Found" + user);
    }
  } catch (err) {
    res.status(400).send("Something Went Wrong!!!" + err.message);
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status.send("Something Went Wrong!!!" + err.message);
  }
});

app.get("/userid", async (req, res) => {
  const userid = req.body._id;
  try {
    const user = await User.findById(userid);
    if (!user) {
      res.status(404).send("User not found!!!");
    } else {
      res.send("User Found", user);
    }
  } catch (err) {
    res.status(400).send("Something Went Wrong!!!" + err.message);
  }
});

//Delete a user
app.delete("/user", async (req, res) => {
  const userID = req.body.userID;
  try {
    // await User.findByIdAndDelete(userID);
    await User.findOneAndDelete({ _id: userID });
    res.send("User Deleted Succesfully!!!");
  } catch (err) {
    res.status(400).send("Something Went Wrong" + err.message);
  }
});

//Update a user
app.patch("/user/:userID", async (req, res) => {
  const userID = req.params.userID;
  // const emailID = req.body.emailID;
  const data = req.body;
  try {
    const ALLOWED_UPDATES = [
      "firstName",
      "lastName",
      "gender",
      "about",
      "skills",
      "age",
      "photoUrl",
      "password",
    ];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update Not Allowed!!!");
    }
    if (data?.skills?.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }
    const user = await User.findByIdAndUpdate(userID, data, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!user) {
      res.status(400).send("update failed!!!");
    } else {
      res.send("User Updated!!!" + user);
    }
  } catch (err) {
    res.status(400).send("Something Went Wrong: " + err.message);
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
