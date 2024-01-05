const Router = require("express").Router();
const {
  getAllCourses,
  createCourse,
} = require("../controllers/courseController");
const authController = require("./../controllers/authController");

Router.route("/")
  .get(getAllCourses)
  .post(
    authController.protect,
    authController.restrictedTo("admin"),
    createCourse
  );

Router.route('/enroll/:courseId').post()

module.exports = Router;
