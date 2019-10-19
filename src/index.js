const app = require('./app'); // Application

const port = process.env.PORT;  // Port on which the app will run


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});