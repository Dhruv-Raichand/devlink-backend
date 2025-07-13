const express = require("express");
const app = express();
const { adminAuth, usersAuth } = require("./middlewares/auth");

// GET /users => midlleware chain => request handler

app.use("/admin", adminAuth);
// app.use("/users", usersAuth);

app.get("/admin/getAllData", (req, res) => {
    res.send("All Data Sent");
    //logic to fetching All data
})
app.get("/admin/deleteUser", (req, res) => {
    //logic to fetching All data
    res.send("Deleted a User")
})

app.use("/", (req, res, next) => {
    // res.send("hnji ki chahida");
    next()
});

app.get("/users/login", (req, res) => {
    res.send("login user")
})

app.get("/users", usersAuth, (req, res, next) => {
    res.send("Request Handler 1");
});

app.post("/users", (req, res) => {
    res.send("Hello User POST");
});

app.use("/test", (req, res) => {
    res.send("Hnji Beta")
});

app.listen(3000, () => {
    console.log("Server is successfully listening on port 3000...");
});