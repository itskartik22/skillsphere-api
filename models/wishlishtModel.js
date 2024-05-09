const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required."],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "Course is required."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;