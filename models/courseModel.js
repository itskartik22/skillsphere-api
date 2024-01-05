const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course name should be there!"],
    },
    courseDescription: String,
    instructor: {
      instructorName: {
        type: String,
        required: [true, "Instructor detail required."],
      },
      instructorBio: {
        type: String,
        required: [true, "Instructor detail required."],
      },
    },
    duration: {
      startDate: { type: Date },
      endDate: { type: Date },
    },
    coverImg: String,
    image: String,
    discount: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
    },
    rating: Number,
    review: [String],
    enrolledBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
