const express = require("express");
const app = express();

// GET /users => midlleware chain => request handler

app.get("/getUserData", (err, req, res, next) => {
    try{
        //Logic of DB call and get user data //write all db calls in try catch block
        throw new Error("hnji Beta error")
        res.send("User Data Sent");
    } catch(err){
        res.status(500).send("Some Error contact support team")
    }
})

app.use("/", (err, req, res, next) => {
    if (err) {
        //Log your error
        res.status(500).send("Something Went Wrong!!!")
    }
})

app.listen(3000, () => {
    console.log("Server is successfully listening on port 3000...");
});