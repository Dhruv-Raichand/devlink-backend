const express = require("express");
const app = express();
app.use("/hello/2", (req, res) => {
    res.send("Hello Beta 2 baar")
})
app.use("/hello", (req, res) => {
    res.send("Hello Beta")
})
app.use("/test", (req, res) => {
    res.send("Hnji Beta")
})
// app.use("/", (req, res) => {
//     res.send("hnji ki chahida")
// })
app.listen(3000, () => {
    console.log("Server is successfully listening on port 3000...")
})