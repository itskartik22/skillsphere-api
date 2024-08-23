const Razorpay = require("razorpay");
const Course = require("../models/courseModel");
const User = require("../models/userModel");
const Enrollment = require("../models/enrollmentModel");

exports.createOrder = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    const options = {
      amount: course.price * 100,
      currency: "INR",
      payment_capture: 1,
    };

    const response = await razorpay.orders.create(options);
    res.status(200).json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err) {
    res.status(400).send("Not able to create order. Please try again!");
  }
};

exports.payment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const generated_signature = await crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    res.send("Payment Verified");
  } else {
    res.status(400).send("Invalid Signature");
  }
};

exports.capturePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const response = await razorpay.payments.capture(paymentId);
    res.status(200).json({
      message: "Payment is captured",
      response,
    });
  } catch (err) {
    res.status(400).send("Not able to capture payment. Please try again!");
  }
};

exports.paymentSuccess = async (req, res) => {
  try {
    const userInfo = req.user;
    await Enrollment.create({
      course: req.body.courseId,
      user: userInfo._id,
      orderId: req.body.orderId,
      paymentId: req.body.paymentId,
    });

    res.status(200).json({
      status: "success",
      message: "Payment successful. Now you are enrolled to the course.",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
        status: "fail",
        message: "Payment failed. Please try again.",
    });
  }
};
