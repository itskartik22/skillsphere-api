const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Course is required.']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required.']
    },
    orderId: {
        type: String,
        required: [true, 'Order ID is required.']
    },
    paymentId: {
        type: String,
        required: [true, 'Payment ID is required.']
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    }
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

module.exports = Enrollment;