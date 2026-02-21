const mongoose = require("mongoose");

const connectDB = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGODB_URI);
};

module.exports = connectDB;
export{};
