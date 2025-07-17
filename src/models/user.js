const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    age:{
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "others"].includes(value)){
                throw new Error("Not Valid Gender")
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