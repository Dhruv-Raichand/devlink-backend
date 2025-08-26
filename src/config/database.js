const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://dhruvraichand70:KeYGKYlfB9qcYF1c@cluster0.sw8wj.mongodb.net/Dinder"
  );
};

module.exports = connectDB;
