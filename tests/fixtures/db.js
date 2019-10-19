const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Task = require('../../src/models/task'); // Task Model
const User = require('../../src/models/user'); // User Model

const _id = new mongoose.Types.ObjectId(); // Mongooses Object Id

const futureUser = {
    _id,
    name: "Raj Gupta",
    email: "vijaydatta57@gmail.com",
    password: "Raj@123",
    age: 15,
    tokens: [
        {
            token: jwt.sign({ _id }, process.env.JWT_SECRET_KEY)
        }
    ]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    task: "Learn Node.JS",
    status: true,
    owner: futureUser._id
}
const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    task: "Learn Electron.JS",
    status: false,
    owner: futureUser._id
}

const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    const user = new User(futureUser);
    await user.save();
    
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
}

module.exports = {
    _id,
    futureUser,
    setupDatabase,
    taskOne,
    taskTwo
}