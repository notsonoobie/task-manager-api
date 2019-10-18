const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();  // Starting the express app
const port = process.env.PORT;  // Port on which the app will run

// app.use((req,res,next) => { // MIDDLEWARE ---> For Maintainance
//     res.status(503).send('Server is Temporarily Shutdown - Under Maintainance');
// });

app.use(express.json()); // Parse the incomming JSON

app.use(userRouter);
app.use(taskRouter);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});