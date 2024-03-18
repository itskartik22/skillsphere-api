const { promisify } = require("util");
const crypto = require("crypto");
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
    sameSite: "none",
    secure: true,
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
  //Check if email and password is provided or not
  const userDetail = { ...req.body };
  const user = await User.findOne({ email: userDetail.email });
  if (!user) {
    return next(new AppError("Invalid email or password", 401));
  }
  //Check if password is correct or not
  const isValid = await bcrypt.compare(userDetail.password, user.password);
  if (!isValid) {
    return next(new AppError("Invalid email or password", 401));
  }
  const token = await signToken(user._id);
  //Send token in cookie
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    sameSite: "none",
    secure: true,
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
    res.clearCookie("jwt", { path: "/", secure: true, sameSite: "none" });
    res.status(200).json({
      status: "success",
      message: "You are logged out successfully",
    });
  } catch (error) {
    next(new AppError("Failed to logout", 500));
  }
};

//Protect Route Controller
exports.protect = catchAsync(async (req, res, next) => {
  try {
    //1) Check token and check of it's there
    let token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new AppError("Token not found", 401));
    }

    //2)Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.SECRET_KEY);

    //3) Check if user still exists
    const currUser = await User.findById(decoded.id).select("-password");
    if (!currUser) {
      return next(new AppError("Invalid Token", 401));
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
  } catch (error) {
    res.clearCookie("jwt", { path: "/", secure: true, sameSite: "none" });
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
  await user.save({ validateBeforeSave: false });

  //send mail to user
  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  const message = 'Reset your password using this link sent on your email. URL expires in 10 minutes.';

  //Send response in development mode
  if (process.env.NODE_ENV === "development") {
    return res.status(200).json({
      status: "success",
      resetURL,
      message,
    });
  }
  //Send response in production mode
  try {
    await sendEmail({
      email: user.email,
      url: resetURL,
      subject: "Password reset URL (expires in 10 minute)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "You can reset your password using URL sent to your email.",
    });
  } catch (error) {
    //If any error occured then reset the token and expires
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    next(
      new AppError(
        "Failed to create reset password option. Please Try again later.",
        500
      )
    );
  }
};

exports.resetUserPsssword = async (req, res, next) => {
  try {
    const token = req.params.resetToken;
    //Check if token received or not
    if (!token) return next(new AppError("Invalid token", 400));

    //Check if token is valid or not
    const hashedToken = await crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(new AppError("Token is invalid or expired", 400));
    }

    //Update password
    const newPasword = req.body.auth.password;
    user.password = newPasword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    //send response
    res.status(200).json({
      status: "success",
      message: "Password reset successfully",
    });
  } catch (error) {
    //Response if any error occured
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    res.status(500).json({
      status: "fail",
      message: "Failed to reset password. Try again later!",
    });
  }
};
