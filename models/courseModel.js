const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course name should be there!"],
    },
    description: String,
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
    },
    coverImg: String,
    image: String,
    category: {
      type: String,
      required: [true, "Category is required."],
    },
    chapters: [
      {
        id: Number,
        name: {
          type: String,
          required: [true, "Chapter name is required."],
        },
        description: {
          type: String,
          required: [true, "Chapter description is required."],
        },
        video: {
          type: String,
          required: [true, "Video link is required."],
        },
      },
    ],
    attachments: [
      {
        id: Number,
        name: {
          type: String,
          required: [true, "Attachment name is required."],
        },
        link: {
          type: String,
          required: [true, "Attachment link is required."],
        },
      },
    ],
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
