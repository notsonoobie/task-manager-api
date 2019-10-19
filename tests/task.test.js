const request = require('supertest'); // Express Testing Framework
const app = require('../src/app'); // Application
const Task = require('../src/models/task'); // Task Model
const { _id, futureUser, setupDatabase, taskOne, taskTwo } = require('./fixtures/db');

beforeEach(setupDatabase); // Before each test is run, Delete the User, so the User Creation Test gets passed

test('Should Create a Task for Authenticated User', async () => {  // Test for creating a Task
    const response = await request(app)
                        .post('/task')
                        .set('Authorization', `Bearer ${futureUser.tokens[0].token}`)
                        .send({
                            task: "Learn to Fuck",
                            status: false
                        })
                        .expect(201)
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
});

test('Should Get Tasks for Authenticated User', async () => {  // Test for getting Tasks
    await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${futureUser.tokens[0].token}`)
        .send()
        .expect(200)
});

test('Should Delete Users Tasks for Authenticated User', async () => {  // Test for getting Tasks
    await request(app)
        .delete(`/task/${taskOne._id}`)
        .set('Authorization', `Bearer ${futureUser.tokens[0].token}`)
        .send()
        .expect(200)
});
