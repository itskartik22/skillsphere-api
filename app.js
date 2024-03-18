const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// const morgan = require("morgan");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
//Create express app
const app = express();
app.use(cookieParser());

// //logging requests
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

//Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

//Routes Middleware
// app.use("/", (req, res) => {
//   res.send("Hello from server");
// });
const courseRoutes = require("./routes/courseRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/users", userRoutes);

//Route Error Handling
app.all("*", (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server.`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
