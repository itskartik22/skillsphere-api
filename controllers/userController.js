const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");

exports.getAllUser = catchAsync(async (req, res, next) => {
  const data = await User.find();
  const allUser = data.map((user) => {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
    };
  });
  res.status(200).json({
    status: "success",
    data: allUser,
  });
});

exports.createUser = async (req, res, next) => {
  try {
    const data = await User.create(req.body);
    res.status(201).json({
      status: "success",
      data,
    });
    next();
  } catch (err) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  // const data = User.create(req.)
  res.send("User deleted");
  next();
};

//Controller for Cart Courses
exports.addCourseInCart = catchAsync(async (req, res, next) => {
  const user = req.user;
  const courseId = req.params.courseId;
  const { cartCourses } = await User.findById(user._id);
  if (cartCourses.includes(courseId)) {
    return next(new AppError("Course is already in Cart", 400));
  }
  await User.findByIdAndUpdate(user._id, {
    $addToSet: { cartCourses: courseId },
  });
  res.status(200).json({
    status: 200,
    message: "Course added to cart.",
  });
});
exports.deleteCourseFromCart = catchAsync(async (req, res, next) => {
  const user = req.user;
  const courseId = req.params.courseId;
  await User.findByIdAndUpdate(user._id, {
    $pull: { cartCourses: courseId },
  });
  res.status(200).json({
    status: 200,
    message: "Course remove from cart.",
  });
});

exports.getAllCartCourses = catchAsync(async (req, res, next) => {
  const user = req.user;
  const data = await User.findById(user._id).select("username").populate({
    path: "cartCourses",
    select: "-__v -enrolledBy -createdAt -updatedAt -password",
  });
  res.status(200).json({
    status: "success",
    data: data,
  });
});

exports.deleteAllCartCourses = catchAsync(async (req, res, next) => {
  const user = req.user;
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: { cartCourses: [] },
    },
    { multi: true }
  );
  next();
});

//Controllers for Enrolled Courses
exports.addCourseToEnrolled = catchAsync(async (req, res, next) => {
  const user = req.user;
  const courseId = req.params.courseId;
  await User.findByIdAndUpdate(user._id, {
    $addToSet: { coursesEnrolled: courseId },
  });
  res.status(200).json({
    status: 200,
    message: "Course Enrolled.",
  });
});
exports.addMultipleCoursesToEnrolled = catchAsync(async (req, res, next) => {
  const user = req.user;
  const courseIds = req.body?.courseIds;
  await User.findByIdAndUpdate(user._id, {
    $push: { coursesEnrolled: { $each: courseIds } },
  });
  res.status(200).json({
    status: 200,
    message: "Courses Enrolled.",
  });
});

exports.getAllEnrolledCourses = catchAsync(async (req, res, next) => {
  const user = req.user;
  const data = await User.findById(user._id).select("username").populate({
    path: "coursesEnrolled",
    select: "-__v -enrolledBy -createdAt -updatedAt -password",
  });
  res.status(200).json({
    status: "success",
    data: data,
  });
});
