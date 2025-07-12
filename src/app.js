const express = require("express");
const app = express();

// GET /users => midlleware chain => request handler

app.get("/admin/getAllData", (req, res) => {
    //Check if request is authorized
    //logic to fetching All data
    res.send("All Data Sent")
})

app.use("/", (req, res, next) => {
    // res.send("hnji ki chahida");
    next()
});

app.get("/users", (req, res, next) => {
    // res.send("Request Handler 1");
    next();
});

app.get("/users", (req, res, next) => {
    res.send("Request Handler 2");
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