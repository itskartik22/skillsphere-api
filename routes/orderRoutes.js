const Router = require("express").Router();
const authController = require("../controllers/authController");
const orderController = require("../controllers/orderController");

Router.post(
  "/order",
  authController.protect,
  orderController.createOrder
);
Router.route("/capture/:paymentId").post(
  authController.protect,
  orderController.capturePayment
);
Router.route("/success").post(
  authController.protect,
  orderController.paymentSuccess
);

module.exports = Router;
