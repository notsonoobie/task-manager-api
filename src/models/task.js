const mongoose = require('mongoose'); // Mongoose Library

const taskSchema = new mongoose.Schema({  // Defining Task Schema
    task: {
        type: String,
        required : true,
        trim : true
    },
    status: {
        type: Boolean,
        required : false,
        default : false,
        trim : true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'  // Defining Relation betwn User Model and Task Model 
    }
}, { strict : true, timestamps : true });

const Task = mongoose.model('Task', taskSchema); // Creating Model

module.exports = Task;