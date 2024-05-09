const Instructor = require('../models/instructorModel');

exports.getAllInstructors = async (req, res) => {
    try {
        const instructors = await Instructor.find();
        res.json({
            status: 'success',
            results: instructors.length,
            data: {
                instructors
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.getInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.params.id);
        res.json({
            status: 'success',
            data: {
                instructor
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.createInstructor = async (req, res) => {
    try {
        const instructor = await Instructor.create(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Instructor created successfully',
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
