const express = require('express');
const multer = require('multer'); // Multer is used for handeling File Uploads
const sharp = require('sharp');  // Image Processing
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account'); // Email Support
const router = new express.Router(); // Routing Models

const upload = multer({  // The Uploaded File Directory & Limits
    limits : { fileSize : 3000000 },
    fileFilter(req, file, cb){
        // cb(new Error('File must be a PDF'));  // Throwing Error for Non-matched File
        // cb(undefined,true);  // Accepting file without throwing any error
        // cb(undefined,false);  // Silently Rejecting file without throwing any error
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) return cb(new Error('Please Upload an Image'));
        cb(undefined,true);
    } 
});

// CRUD ---> For Users Document - MongoDB

router.post('/users',async (req,res)=>{  // POST REQUEST ---> Creating User
    const user = new User(req.body);
    try{
        await User.init();
        await user.save();
        const token = await user.generateAuthToken(); // Own Method on the Single User Model
        sendWelcomeEmail(user.email, user.name);
        res.status(201).send({ user, token });
    }catch(e){
        res.status(400).send(e);
    }
});

router.post('/users/login',async (req,res) => {  // POST REQUEST ---> Login User
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password); // Setting up Custom Model Method
        const token = await user.generateAuthToken(); // Own Method on the Single User Model
        res.send({ user : user, token });
    }catch(e){
        res.status(400).send('Authentication Failed');
    }
});

router.post('/users/logout', auth, async (req,res) => {  // POST REQUEST ---> LoggingOut User
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send('Error Occured');
    }
});

router.post('/users/logoutAll', auth, async (req,res) => {  // POST REQUEST ---> LoggingOut User from all
    try{
        req.user.tokens = [];
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send('Error Occured');
    }
});

router.get('/users/me', auth, async (req,res)=>{  // GET REQUEST ---> READING Users
    res.send(req.user);
});

// router.get('/users/:id',async (req,res)=>{  // GET REQUEST ---> READING User
//     try{
//         const _id = req.params.id;
//         const user = await User.findById(_id);
//         if(!user){
//             return res.status(400).send('Please Enter a valid User Id!');
//         }
//         res.send(user);
//     }catch(e){
//         res.status(500).send(e);
//     }
// });

router.patch('/users/me', auth, async (req,res)=>{  // PATCH REQUEST ---> UPDATING User's Data
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];
    const isValid = updates.every(elm => allowedUpdates.includes(elm));
    if(!isValid){
        return res.status(400).send({error :'Not Valid'});
    }
    try{
        // const _id = req.user._id;
        // const user = await User.findById(_id);
        updates.forEach((update) => {
            req.user[update] = req.body[update]; // Manually update any field that user wants to update
        });
        await req.user.save();
        // const user = await User.findByIdAndUpdate(_id, req.body,{ new : true, runValidators : true });
        // if(!req.user){
        //     return res.status(404).send();
        // }
        res.send(req.user);
    }catch(e){
        res.status(400).send(e);
    }    
});

router.delete('/user/me', auth, async (req,res)=>{  // DELETE REQUEST ---> DELETING User
    try{
        // const _id = req.user._id;
        // const user = await User.findByIdAndDelete(_id);
        // if(!user){
        //     return res.status(404).send({ error : "Authentication Failed" });
        // }
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.name);
        res.send(req.user);
    }catch(e){
        res.status(500).send(e);
    }
});

// Avatar Upload
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {  // Profile Uploads
    const buffer = await sharp(req.file.buffer).resize({ width : 250, height : 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.status(201).send();
}, (err,req,res,next) => {  // Error Handler for Express App
    res.status(400).send({ error : err.message });
});

// Avatar Delete
router.delete('/users/me/avatar', auth, async (req,res)=>{  // DELETE REQUEST ---> DELETING PROFILE BUFFER DATA
    try{
        if(!req.user.avatar){
            return res.status(400).send({ error : 'Avatar Doesn\'t Exist' });
        }
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    }catch(e){
        res.status(500).send({ error : 'Some Error Occurred' });
    }
});

// View Avatar
router.get('/users/:id/avatar', async (req,res)=>{  // GET REQUEST ---> GETTING PROFILE AVATAR
    try{
        const _id = req.params.id;
        const user = await User.findById(_id);
        if(!user || !user.avatar){
            throw new Error();
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    }catch(e){
        res.status(404).send();
    }
});

module.exports = router;