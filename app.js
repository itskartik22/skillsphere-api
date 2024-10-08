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
    origin: [process.env.CLIENT_URL1, process.env.CLIENT_URL2],
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
const orderRoutes = require("./routes/orderRoutes");
const instructorRoutes = require("./routes/instructorRoutes");

app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/users", (req, res, next) => {
//   res.send("Hello from server");
// });
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/payment", orderRoutes);
app.use("/api/v1/instructors", instructorRoutes);

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
