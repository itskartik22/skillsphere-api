const sharp = require('sharp');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("./../models/userModel");
const Course = require("./../models/courseModel");
const { uploadImageToBlob } = require("../utils/blobStorageHandler");
const Enrollment = require('../models/enrollementModel');

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
exports.getUserInformation = catchAsync(async (req, res, next) => {
  try {
    const user = req.user;
    const userInfo = req.body;
    const data = await User.findById(user._id).select(
      "-password -role -_id -createdAt -updatedAt -coursesEnrolled -cartCourses -__v -passwordChangedAt -passwordResetToken -passwordResetExpires"
    );
    res.status(201).json({
      status: "success",
      data,
    });
  } catch (err) {
    next(new AppError("Information Fetching Failed", 400));
  }
});
exports.updateUserInformation = catchAsync(async (req, res, next) => {
  try {
    const user = req.user;
    const userNewInfo = req.body;
    await User.findByIdAndUpdate(user._id, {
      profile: {
        firstName: userNewInfo.firstName,
        lastName: userNewInfo.lastName,
        gender: userNewInfo.gender,
        contact: userNewInfo.contact,
        country: userNewInfo.country,
        address: userNewInfo.address,
        college: userNewInfo.college,
        coursePersuing: userNewInfo.coursePersuing,
        dateOfBirth: userNewInfo.dateOfBirth,
      },
    });
    const data = await User.findById(user._id).select(
      "-password -role -_id -createdAt -updatedAt -coursesEnrolled -cartCourses -__v"
    );
    // console.log(data);
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (err) {
    // res.status(err.statusCode).json({
    //   status: err.status,
    //   message: err.message,
    // });
    console.log(err);
    next(new AppError("Information Updation Failed.", 400));
  }
});

//Upload Profile Photo
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    const userInfo = req.user;
    const containerName = "profile-photo";
    const resizeBuffer = await sharp(req.file.buffer).resize(500, 500).toFormat('jpeg').jpeg({quality: 90}).toBuffer();
    const blobName = `pp-${userInfo._id}.${req.file.mimetype.split("/")[1]}`;
    const buffer = req.file.buffer;
    const imgUrl = await uploadImageToBlob(containerName, blobName, resizeBuffer);
    console.log(imgUrl)
    await User.findByIdAndUpdate(userInfo._id, {
      profilePhoto: imgUrl,
    });

    res.status(200).json({
      status: "success",
      message: "Profile photo uploaded successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error uploading image");
  }
};
exports.deleteUser = async (req, res, next) => {
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
  // await User.findByIdAndUpdate(user._id, {
  //   $addToSet: { coursesEnrolled: courseId },
  // });
  // await Course.findByIdAndUpdate(courseId, {
  //   $addToSet: { enrolledBy: user._id },
  // });

  if(await Enrollment.findOne({course: courseId, user: user._id})){
    return next(new AppError("Course is already enrolled", 400));
  }
  await Enrollment.create({
    course: courseId,
    user: user._id
  });

  res.status(200).json({
    status: 200,
    message: "Course Enrolled.",
  });
});

exports.addMultipleCoursesToEnrolled = catchAsync(async (req, res, next) => {
  const user = req.user;
  const courseIds = req.body?.courseIds;
  courseIds.forEach(async (courseId) => {
    await Enrollment.create({
      course: courseId,
      user: user._id
    });
  });
  // await User.findByIdAndUpdate(user._id, {
  //   $push: { coursesEnrolled: { $each: courseIds } },
  // });
  res.status(200).json({
    status: 200,
    message: "Courses Enrolled.",
  });
});

exports.getAllEnrolledCourses = catchAsync(async (req, res, next) => {
  const user = req.user;
  // const data = await User.findById(user._id).select("username").populate({
  //   path: "coursesEnrolled",
  //   select: "-__v -enrolledBy -createdAt -updatedAt -password",
  // });

  const courses = await Enrollment.find({user: user._id}).populate({
    path: 'course',
    select: '-__v -enrolledBy -createdAt -updatedAt -password'
  });
  res.status(200).json({
    status: "success",
    data: courses,
  });
});
