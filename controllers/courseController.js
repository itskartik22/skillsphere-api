const Course = require("../models/courseModel");
const catchAsync = require("../utils/catchAsync");

exports.getAllCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find();
  res.status(200).json({
    status: "success",
    courses,
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


