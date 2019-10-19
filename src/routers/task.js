const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/auth');
const router = new express.Router(); // Routing Models

// CRUD ---> For Task Document - MongoDB

router.post('/task', auth, async (req,res)=>{  // POST REQUEST ---> Creating Task
    try{
        const task = new Task({ ...req.body, owner : req.user._id });
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.status(400).send(e);
    }
});

router.get('/tasks', auth, async (req,res)=>{  // GET REQUEST ---> READING Tasks
    try{
        let tasks = '';
        let sort = { createdAt : 1};
        if(req.query.sortBy){
            sort = {};
            const parts = req.query.sortBy.split(':'); // ?sortBy=prop:asc/desc
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;  // For Sorting ---> 1 ---> Asc, -1 ---> Desc 
        }

        if(req.query.status){  // Filtering Data
            const bool = req.query.status === 'true';
            tasks = await Task.find({ owner : req.user._id, status : bool },null,{ limit : parseInt(req.query.limit), skip : parseInt(req.query.skip), sort });  // If query '?status=true' or '?status=false' exists, then filter the task for status
        }else{
            tasks = await Task.find({ owner : req.user._id },null,{ limit : parseInt(req.query.limit), skip : parseInt(req.query.skip), sort });  // If no query exists then return all tasks     
        }

        if(!tasks){
            return res.status(404).send({ error : 'Not Found' });
        }
        res.send(tasks);
    }catch(e){
        res.status(500).send(e);
    }
});

router.get('/task/:id', auth, async (req,res)=>{  // GET REQUEST ---> READING Task
    try{
        const _id = req.params.id;
        const task = await Task.findOne({ _id, owner : req.user._id });
        if(!task){
            return res.status(404).send({ error : 'Not Found' });
        }
        res.send(task);
    }catch(e){
        res.status(500).send(e);
    }
});

router.patch('/task/:id', auth, async (req,res)=>{  // PATCH REQUEST ---> UPDATING Task Data
    const updates = Object.keys(req.body);
    const allowedUpdates = ['task','status'];
    const isValid = updates.every(elm => allowedUpdates.includes(elm));
    if(!isValid){
        return res.status(400).send({ error : "PLease enter valid update  details" });
    }
    try{
        const _id = req.params.id;
        const task = await Task.findOne({ _id, owner : req.user._id });
        if(!task){
            return res.status(404).send({ error : 'Not Found' });
        }
        updates.forEach((update) => {  // Manually updating the fields requested by the user
            task[update] = req.body[update];
        });
        await task.save();
        // const task = await Task.findByIdAndUpdate(_id,req.body,{ new : true, runValidators : true });
        res.send(task);
    }catch(e){
        res.status(500).send(e);
    }
});

router.delete('/task/:id', auth, async (req,res)=>{  // DELETE REQUEST ---> DELETING Task
    try{
        const _id = req.params.id;
        const task = await Task.findOneAndDelete({ _id, owner : req.user._id });
        if(!task){
            return res.status(404).send({ error : "PLease enter valid details" });
        }
        res.send(task);
    }catch(e){
        res.status(500).send(e);
    }
});

module.exports = router;