const Router = require("express").Router();
const multer = require("multer");
const upload = multer();

const {
  getAllCourses,
  createCourse,
  getCourse,
  addCourseModule,
  uploadModuleVideo,
  getCourseModules,
  updateCourse,
  searchCourse,
  topFiveCourses,
} = require("../controllers/courseController");
const authController = require("./../controllers/authController");
const enrollementController = require("../controllers/enrollmentController");
const { Route } = require("express");
const cloudinaryUpload = require("../utils/cloudinaryUploadHandler");

Router.route("/")
  .get(getAllCourses)
  .post(
    authController.protect,
    authController.restrictedTo("admin"),
    upload.single("image"),
    createCourse
  );

Router.route("/update/:courseId").patch(
  authController.protect,
  authController.restrictedTo("admin"),
  upload.single("image"),
  updateCourse
);

Router.route("/module").post(
  authController.protect,
  authController.restrictedTo("admin"),
  addCourseModule
);
Router.route("/module/upload").post(
  authController.protect,
  authController.restrictedTo("admin"),
  cloudinaryUpload.single("video"),
  uploadModuleVideo
);
// Router.route("/module/upload").post(
//   authController.protect,
//   authController.restrictedTo("admin"),
//   // upload.single("video"), //cloudinary
//   upload.single("video"), //multer
//   uploadModuleVideo
// );

Router.route("/module/:courseId").get(
  authController.protect,
  authController.restrictedTo("admin"),
  getCourseModules
);

Router.route("/search").get(searchCourse);
Router.route("/top-5").get(topFiveCourses);
Router.route("/:courseId").get(getCourse);

Router.route("/enroll/:courseId")
  .get(authController.protect, enrollementController.checkEnrolled)
  .post(authController.protect, enrollementController.enrollCourse);

module.exports = Router;
