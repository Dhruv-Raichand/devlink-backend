const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
require("dotenv").config();

require("./utils/cronJob");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routers
const authRouter = require("./routes/authRouter");
const profileRouter = require("./routes/profileRouter");
const requestRouter = require("./routes/requestRouter");
const userRouter = require("./routes/userRouter");
const chatRouter = require("./routes/chatRouter");
const initializeSocket = require("./utils/socket");

// Mount routes
app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/requests", requestRouter);
app.use("/users", userRouter);
app.use("/chat", chatRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).send("Not Found");
});

// Create server
const server = http.createServer(app);
initializeSocket(server);

// DB + Start Server
connectDB()
  .then(() => {
    console.log("Database Connection Established.");

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database Connection Failed!!!", err);
  });
