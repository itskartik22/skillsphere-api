const { promisify } = require("util");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AppError = require("./../utils/appError");
const catchAsync = require("../utils/catchAsync");
const sendEmail = require("../utils/email");

//Token Generation
const signToken = async (id) => {
  const token = await jwt.sign({ id }, process.env.SECRET_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
  return token;
};

//Signup
exports.signup = catchAsync(async (req, res, next) => {
  const userDetail = { ...req.body };
  const existingUser = await User.findOne({ email: userDetail.email });
  if (existingUser) return next(new AppError("User already exist..", 400));
  const newUser = await User.create(req.body);
  const token = await signToken(newUser._id);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    sameSite : "none",
    secure: false,
    httpOnly: true,
  });
  res.status(201).json({
    status: "success",
    userInfo: {
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

//Login
exports.login = catchAsync(async (req, res, next) => {
  const userDetail = { ...req.body };
  const user = await User.findOne({ email: userDetail.email });
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }
  const isValid = await bcrypt.compare(userDetail.password, user.password);
  if (!isValid) {
    return next(new AppError("Invalid email or password", 401));
  }
  const token = await signToken(user._id);

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    sameSite : "none",
    secure: false,
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    userInfo: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

//Logout
exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({
      status: "success",
      message: "You are logged out successfully",
    });
  } catch (error) {
    console.log(error);
    next(new AppError("Failed to logout", 500));
  }
};

//Protect Route Controller
exports.protect = catchAsync(async (req, res, next) => {
  try {
    //1) Check token and check of it's there
    let token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];
    console.log(token);
    if (!token) {
      return next(new AppError("Token not found", 401));
    }
    console.log("token check done");
    //2)Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    console.log("verification done");
    //3) Check if user still exists
    const currUser = await User.findById(decoded.id).select("-password");
    if (!currUser) {
      return next(new AppError("Invalid Token", 401));
    }
    console.log("user check done", currUser);
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
  } catch (error) {
    console.log(error);
    res.clearCookie("jwt");
    return next(new AppError("Session Expired", 401));
  }
});
//Restrict Route Controller
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

//Forget Password
exports.forgetUserPassword = async (req, res, next) => {
  //Check user presence
  if (!req.body.email) {
    return next(new AppError("You are not provided any email!", 404));
  }
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User not found!", 404));
  }
  //created password reset token
  const resetToken = await user.createResetPasswordToken();
  user.save({ validateBeforeSave: false });

  //send mail to user
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetUserPassword/${resetToken}`;
  const message = `Forgot your Password. You can rest your password throught the given url : ${resetURL}. If this is not you then ignore it.`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset URL (expires in 10 minute)",
      message,
    });

    res.status(200).json({
      status: "succes",
      message: "You can reset your password using URL sent to your email.",
    });
  } catch (error) {
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    user.save({ validateBeforeSave: false });
    next(
      new AppError(
        "Failed to create reset password option. Please Try again later.",
        500
      )
    );
  }
};

exports.resetUserPsssword = (req, res, next) => {};
