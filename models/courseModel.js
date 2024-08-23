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
    image: String,
    category: {
      type: String,
      required: [true, "Category is required."],
    },
    // chapters: [
    //   {
    //     id: Number,
    //     name: {
    //       type: String,
    //       // required: [true, "Chapter name is required."],
    //     },
    //     description: {
    //       type: String,
    //       // required: [true, "Chapter description is required."],
    //     },
    //     video: {
    //       type: String,
    //       // required: [true, "Video link is required."],
    //     },
    //   },
    // ],
    status: Boolean,
    chapters: [
      {
        id: Number,
        title: {
          type: String,
          // required: [true, "Module name is required."],
        },
        description: {
          type: String,
          // required: [true, "Module description is required."],
        },
        videoUrl: {
          type: String,
          // required: [true, "Video link is required."],
        },
      },
    ],
    attachments: [
      {
        id: Number,
        name: {
          type: String,
          // required: [true, "Attachment name is required."],
        },
        link: {
          type: String,
          // required: [true, "Attachment link is required."],
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
    rating: {
      type: Number,
      default: 0,
    },
    review: [String],
    enrolledBy: [
      {
        type: String,
        // type: mongoose.Schema.Types.ObjectId,
        //   ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
