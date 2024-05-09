const Router = require("express").Router();
const {
  getAllCourses,
  createCourse,
  getCourse,
} = require("../controllers/courseController");
const authController = require("./../controllers/authController");
const enrollementController = require("../controllers/enrollementController");

Router.route("/")
  .get(getAllCourses)
  .post(
    authController.protect,
    authController.restrictedTo("admin"),
    createCourse
  );

Router.route("/:courseId").get(getCourse);
Router.route("/enroll/:courseId")
  .get(authController.protect, enrollementController.checkEnrolled)
  .post(authController.protect, enrollementController.enrollCourse);

module.exports = Router;
