const { TokenExpiredError } = require("jsonwebtoken");
const AppError = require("../utils/appError");

const handleJWTWebTokenError = (err) => new AppError(err.message, 401);
const handleJwTTokenExpireError = (err) => new AppError(err.message, 401);
const handleCourseValidationError = (err) => new AppError(err.message, 400);
const handleCastError = (err) => new AppError("Invalid Id", 400);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Operational : trusted error
  if (err.isOperational === true) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming or unknown error
  } else {
    console.error("ERROR !💣", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.name = err.name;
    error.message = err.message;
    // if (error.kind === 'ObjectId') error = handleObjectIdErrorDb(error);
    if (error.code === 11000) error = handleDuplicateKeyDb(error);
    if (error.name === "JsonWebTokenError") {
      error = handleJWTWebTokenError(error);
    }
    if (error.name === "CastError") {
      error = handleCastError(error);
    }
    if (error.name === "TokenExpiredError")
      error = handleJwTTokenExpireError(error);
    if (error._message === "Course validation failed")
      error = handleCourseValidationError(error);
    sendErrorProd(error, res);
  }
  //   console.log(err);
};
