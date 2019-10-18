const mongoose = require('mongoose'); // Mongoose Library

// const mongooseConnectionURL = 'mongodb://127.0.0.1:27017/task-manager-api'; // Localhost DB connection using mongodb protocols

mongoose.connect(process.env.MONGO_DB_URL,{ useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true/*,useFindAndModify:false*/ });