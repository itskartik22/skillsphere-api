const Router = require("express").Router();
const userController = require("./../controllers/userController");
const authController = require("../controllers/authController");
const multer = require("multer");
const upload = multer();

Router.post("/signup", authController.signup);
Router.post("/login", authController.login);
Router.post("/forgotUserPassword", authController.forgetUserPassword);
Router.post("/resetUserPassword", authController.resetUserPsssword);
Router.route("/")
  .get(
    authController.protect,
    authController.restrictedTo("admin"),
    userController.getAllUser
  )
  .post(authController.protect, userController.createUser)
  .delete(
    authController.protect,
    authController.restrictedTo("admin"),
    userController.deleteUser
  );
Router.post(
  "/upload",
  authController.protect,
  upload.single("image"),
  userController.uploadProfilePhoto
);
//User course managing route
Router.route("/cart-course/:courseId")
  .patch(authController.protect, userController.addCourseInCart)
  .delete(authController.protect, userController.deleteCourseFromCart);

Router.route("/cart-courses")
  .get(authController.protect, userController.getAllCartCourses)
  .delete(authController.protect, userController.deleteAllCartCourses);

Router.route("/enrolled-courses").get(
  authController.protect,
  userController.getAllEnrolledCourses
);

//route to enroll single course
Router.route("/enroll-course/:courseId").patch(
  authController.protect,
  userController.addCourseToEnrolled
);
//route to enroll multiple course
Router.route("/enroll-courses").patch(
  authController.protect,
  userController.deleteAllCartCourses,
  userController.addMultipleCoursesToEnrolled
);

Router.route("/user-profile")
  .get(authController.protect, userController.getUserInformation)
  .patch(authController.protect, userController.updateUserInformation);
// Router.route("/:id")
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = Router;
