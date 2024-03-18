const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
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
    profilePhoto: {
      type: String,
      default:
        "https://skillspherestorage.blob.core.windows.net/profile-photo/skillsphere-pp-default.png",
    },
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
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
    return JWTTimestamp < changedTimestmmap;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
