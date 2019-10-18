const mongoose = require('mongoose'); // Mongoose Library
const validator = require('validator'); // Library for Validation
const bcrypt = require('bcryptjs'); // bcrypt hashing algorithm
const jwt = require('jsonwebtoken'); // JWT
const Task = require('./task'); // Task Model

const userSchema = new mongoose.Schema({  // Defining User Schema
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        trim : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid');
            }
        }
    },
    age : {
        type : Number,
        default : 1
    },
    password : {
        type : String,
        required : true,
        trim : true,
        minlength : 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Try a better password');
            }
        }
    },
    tokens : [{
        token : {
            type : String,
            required : true
        }
    }],
    avatar : {
        type : Buffer
    }
}, { strict : true, timestamps : true });

userSchema.virtual('tasks',{  // RELATION :---> USER MODEL ---(relating)---> TASK MODEL ---(data)---> _id ---(field)---> owner
    ref : 'Task', // Model to be Referenced
    localField : '_id', // Which local data is stored
    foreignField : 'owner' // Name of the field on which the data is stored
});

userSchema.statics.findByCredentials = async (email,password)=>{  // Defining Own Methods for Model
    const user = await User.findOne({ email });
    if(!user){
        throw new Error('Unable to Login');
    }
    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error('Unable to Login');
    }
    return user;
};

userSchema.methods.generateAuthToken = async function(){  // Defining own Methods for document
    const user = this;
    const token = jwt.sign({ _id : user._id.toString() }, process.env.JWT_SECRET_KEY);

    user.tokens = user.tokens.concat({ token }); // Adding token to the user documents as array of objects
    await user.save();

    return token;
};

userSchema.methods.toJSON = function(){  // Defining What not to send as JSON
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    if(user.avatar) delete userObject.avatar;
    
    return userObject;
}

// Hash the Plain Text Password Using Bcryptjs before saving
userSchema.pre('save', async function(done){  // Using Middleware Before the execution of userSchema
    const user = this; // this refers to the document being saved
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8); // Hashing the password with bcryptjs for 8rounds(safe & fast)
    }
    done(); // When the pre-save work is done, done() -->[ done is provided by pre/post function ] is called to continue the saving of documents in DB 
});

userSchema.pre('remove', async function(done){ // Deleting all the task associated to User before the User Account is Deleted 
    const user = this;
    await Task.deleteMany({ owner : user._id });
    done();
})

const User = mongoose.model('User',userSchema);

module.exports = User;