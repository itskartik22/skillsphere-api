const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find();
  res.status(200).json({
    status: "success",
    courses,
  });
});
exports.getCourse = catchAsync(async (req, res, next) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  // console.log(course);
  res.status(200).json({
    status: "success",
    course,
  });
});

exports.createCourse = catchAsync(async (req, res, next) => {
  const data = await Course.create(req.body);
  console.log(data);
  res.status(200).json({
    status: "success",
    data,
  });
});


