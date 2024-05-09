const Enrollement = require("../models/enrollementModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Course = require("../models/courseModel");

exports.enrollCourse = catchAsync(async (req, res, next) => {
  const courseId = req.params.courseId;
  const userId = req.user.id;
  if (userId === undefined) {
    return next(new AppError("User not found", 404));
  }
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }
  if (await Enrollment.findOne({ course: courseId, user: user._id })) {
    return next(new AppError("Course is already enrolled", 400));
  }
  await Enrollement.create({
    course: courseId,
    user: userId,
  });
  res.status(200).json({
    status: "success",
    message: "Course Enrolled.",
  });
});

exports.getEnrolledCourses = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const enrolledCourses = await Enrollement.find({ user: userId });
  res.status(200).json({
    status: "success",
    enrolledCourses,
  });
});

exports.checkEnrolled = catchAsync(async (req, res, next) => {
  const courseId = req.params.courseId;
  const userId = req.user._id;
  const enrolledCourse = await Enrollement.findOne({
    course: courseId,
    user: userId,
  });
  if (enrolledCourse) {
    res.status(200).json({
      status: true,
    });
  } else {
    res.status(200).json({
      status: false,
    });
  }
});
