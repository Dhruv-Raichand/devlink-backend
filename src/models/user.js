const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email!!!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Weak Password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: "{VALUE} is not a valid gender",
      },
      // validate(value) {
      //     if (!["male", "female", "others"].includes(value)){
      //         throw new Error("Not Valid Gender")
      //     }
      // }
    },
    photoUrl: {
      type: String,
      default:
        "https://storage.needpix.com/rsynced_images/blank-profile-picture-973460_1280.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid photoUrl");
        }
      },
    },
    about: {
      type: String,
      default: "Hnji beta",
      maxLength: 50,
    },
    skills: {
      type: [String],
      validate(value) {
        if (value.length > 10) {
          throw new Error("Skills cannot be more than 10");
        }
      },
    },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, "@DinderBoi123", {
    expiresIn: "7d",
  });
  return token;
};

userSchema.methods.comparePasswords = async function (passwordByUser) {
  const user = this;
  const passwordHash = user.password;
  const isCorrect = await bcrypt.compare(passwordByUser, passwordHash);
  return isCorrect;
};

module.exports = mongoose.model("User", userSchema);
