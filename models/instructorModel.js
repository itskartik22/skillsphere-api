const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Instructor name is required."]
    },
    bio: {
        type: String,
        required: [true, "Instructor bio is required."]
    },
    image: {
        type: String,
        // required: [true, "Instructor image is required."]
    }
});

const Instructor = mongoose.model("Instructor", instructorSchema);

module.exports = Instructor;