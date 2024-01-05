const { promisify } = require("util");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AppError = require("./../utils/appError");
const catchAsync = require("../utils/catchAsync");

const signToken = async (id) => {
  const token = await jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
  return token;
};

exports.signup = catchAsync(async (req, res, next) => {
  const userDetail = { ...req.body };
  console.log(userDetail);
  const existingUser = await User.findOne({ email: userDetail.email });
  if (existingUser) return next(new AppError("User already exist..", 400));
  const newUser = await User.create(req.body);
  const token = await signToken(newUser._id);
  res.status(201).json({
    status: "success",
    userInfo: {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
    token,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const userDetail = { ...req.body };
  console.log(userDetail);
  const user = await User.findOne({ email: userDetail.email });
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }
  const isValid = await bcrypt.compare(userDetail.password, user.password);
  if (!isValid) {
    return next(new AppError("Invalid email or password", 401));
  }
  const token = await signToken(user._id);
  res.status(200).json({
    status: "success",
    userInfo: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) Check token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return next(new AppError("Token not found", 401));
    }
  } else {
    return next(new AppError("Token not found", 401));
  }
  //2)Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
  //3) Check if user still exists
  const currUser = await User.findById(decoded.id).select("-password");
  if (!currUser) {
    return next(new AppError("User no more exist. Please login again!", 401));
  }
  //4) Check if user changed password after jwt toekn was issue
  const checkUpdate = currUser.changedPasswordAfter(decoded.iat);
  if (checkUpdate) {
    throw new AppError(
      "Password is changed after token generated. Login again!",
      401
    );
  }
  //5) GrantAccess to protectect route
  req.user = {
    _id: currUser._id,
    email: currUser.email,
    username: currUser.username,
    role: currUser.role,
  };
  next();
});

exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.userRole)) {
      return next(
        new AppError("You don't have permission to perform this action.", 403)
      );
    }
    next();
  };
};
