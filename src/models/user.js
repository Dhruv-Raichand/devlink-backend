const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error("Invalid Email!!!")
            }
        }
    },
    password: {
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error("Weak Password")
            }
        }
    },
    age:{
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        enum: ["male", "female", "others"]
        // validate(value) {
        //     if (!["male", "female", "others"].includes(value)){
        //         throw new Error("Not Valid Gender")
        //     }
        // }
    },
    photoUrl: {
        type: String,
        validate(value){
            if (!validator.isURL(value)){
                throw new Error("Invalid photoUrl") 
            }
        }
    },
    about: {
        type: String,
        default: "Hnji beta"
    },
    skills: {
        type: [String]
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);