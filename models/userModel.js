const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    coursesEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    cartCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // Additional fields (customizable based on your requirements):
    profile: {
      firstName: {
        type: String,
        default: "",
      },
      lastName: {
        type: String,
        default: "",
      },
      contact: {
        type: Number,
      },
      address: String,
      country: String,
      dateOfBirth: Date,
      gender: String,
      coursePersuing: String,
      college: String,
      // More profile details (e.g., address, contact information, etc.)
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestmmap = parseInt(this.passwordChangedAt / 1000, 10);
    console.log(changedTimestmmap, JWTTimestamp);
    return JWTTimestamp < changedTimestmmap;
  }
  return false;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
