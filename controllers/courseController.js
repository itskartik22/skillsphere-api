const Course = require("../models/courseModel");
const { uploadVideoToBlob } = require("../utils/blobStorageHandler");
const catchAsync = require("../utils/catchAsync");

const streamifier = require("streamifier");
const { uploadPhoto } = require("../utils/uploadPhoto");
const cloudinary = require("./../utils/cloudinaryConfig");
const { v4: uuid4 } = require("uuid");
const User = require("../models/userModel");
const Enrollment = require("../models/enrollmentModel");

exports.getAllCourses = catchAsync(async (req, res, next) => {
  try {
    const courses = await Course.find().populate("instructor", "name");
    res.status(200).json({
      status: "success",
      data: courses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
});
exports.getCourse = catchAsync(async (req, res, next) => {
  const courseId = req.params.courseId;
  const course = await Course.findById(courseId);
  res.status(200).json({
    status: "success",
    course,
  });
});

exports.searchCourse = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  try {
    const courses = await Course.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
      ],
    }).select("-__v -chapters -enrolledBy -reviews -createdAt -updatedAt");
    res.status(200).json({
      status: "success",
      data: courses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
});

exports.topFiveCourses = catchAsync(async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "name")
      .sort({ createdAt: 1 })
      .limit(5)
      .select("-__v -chapters -enrolledBy -reviews -createdAt -updatedAt");
    res.status(200).json({
      status: "success",
      data: courses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
});

exports.createCourse = catchAsync(async (req, res, next) => {
  const formData = req.body;
  const courseData = {
    title: formData.title,
    description: formData.description,
    price: formData.price,
    // duration: formData.duration,
    status: formData.status,
    price: formData.price,
    instructor: formData.instructorId,
    category: formData.category,
    chapters: [],
    enrolledBy: [],
  };

  try {
    const course = await Course.create(courseData);
    if (!req.file) {
      return res.status(200).json({
        status: "success",
        message: "Course created successfully",
        course: course,
      });
    }
    const response = await uploadPhoto(
      course._id,
      "course-thumbnails",
      req.file,
      req.file.buffer
    );
    if (response.status === "fail") {
      return res.status(200).json({
        status: "success",
        message: "Course created but failed to upload thumbnail!",
        course: course,
      });
    }
    course.image = response.imgUrl;
    course.save();
    res.status(200).json({
      status: "success",
      course: course,
      message: "Course created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
});

exports.updateCourse = catchAsync(async (req, res, next) => {
  const formData = req.body;
  const course = {
    title: formData.title,
    courseDescription: formData.description,
    price: formData.price,
    status: formData.status,
    price: formData.price,
    instructorId: formData.instructorId,
    category: formData.category,
    thumbnail: formData.thumbnail,
  };
  try {
    const data = await Course.create(course);
    console.log(data);
    res.status(200).json({
      status: "success",
      courseId: data._id,
      message: "Course created successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
});

exports.getCourseModules = catchAsync(async (req, res, next) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    res.status(200).json({
      status: "success",
      modules: course.chapters,
      message: "Modules fetched successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
});

exports.addCourseModule = catchAsync(async (req, res, next) => {
  const { courseId } = req.body;
  const module = {
    title: req.body.title,
    description: req.body.description,
    videoUrl: req.body.videoUrl,
    // videoUrl:
    //   "https://skillspherestorage.blob.core.windows.net/module-videos/1723128183971-1.%20Intro.mp4",
  };
  try {
    const course = await Course.findById(courseId);
    course.chapters.push(module);
    await course.save();
    res.status(200).json({
      status: "success",
      message: "Module added successfully",
      module,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
});

exports.uploadModuleVideo = catchAsync(async (req, res) => {
  try {
    const { courseId } = req.body;
    const blobName =
      courseId + "-" + uuid4() + "-" + req.file.originalname.split(".")[0];
    const stream = streamifier.createReadStream(req.file.buffer);
    const videoUrl = await uploadVideoToBlob(
      "module-videos",
      blobName,
      stream,
      req.file.size
    );
    res.status(200).json({
      status: "success",
      videoUrl,
      message: "Video uploaded successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }

  // try {
  //   const { courseId } = req.body;
  //   const videoDetails = req.file;
  //   res.status(200).json({
  //     status: "success",
  //     // videoUrl: hslResult.secure_url,
  //     videoUrl: videoDetails.path,
  //     message: "Video uploaded successfully",
  //   });
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).json({
  //     status: "fail",
  //     message: "Something went wrong!",
  //   });
  // }
});
