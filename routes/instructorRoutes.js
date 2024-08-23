const Router = require("express").Router();
const { protect, restrictedTo } = require("../controllers/authController");
const instructorController = require("../controllers/instructorController");

Router.route("/")
  .get(protect, restrictedTo("admin"), instructorController.getAllInstructors)
  .post(protect, restrictedTo("admin"), instructorController.createInstructor);

Router.route("/search").get(instructorController.searchInstructor);
Router.route("/:id").get(instructorController.getInstructor);

module.exports = Router;
