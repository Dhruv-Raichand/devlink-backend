const adminAuth = (req, res, next) => {
    //Logic of checking if request is authorized
    console.log("Admin auth is getting checked!!!");
    let token = "xyz";
    let isAuthrized = token === "xyz";
    if (!isAuthrized) {
        res.status(401).send("Unauthorized");
    } else {
        next();
    }
};
const usersAuth = (req, res, next) => {
    //Logic of checking if request is authorized
    console.log("Users auth is getting checked!!!");
    let token = "xyz";
    let isAuthrized = token === "xyz";
    if (!isAuthrized) {
        res.status(401).send("Unauthorized");
    } else {
        next();
    }
};
module.exports = {
    adminAuth,
    usersAuth,
}