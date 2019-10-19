const request = require('supertest'); // Express Testing Framework
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app'); // Application
const User = require('../src/models/user'); // User Model
const { _id, futureUser, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase); // Before each test is run, Delete the User, so the User Creation Test gets passed

test('Should Signup a new User', async ()=>{  // Test for Creating User
    const response = await request(app).post('/users').send({
        name: "Ramesh Gupta",
        email: "swastikmedical94@gmail.com",
        password: "Ramesh@123",
        age: 21
    }).expect(201)

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull(); // Checking If Id Recieved is same as Id stored in DB

    expect(user.password).not.toBe('Ramesh@123') // Checking if Password is stored RAW or HASHED
});

test('Should Login Exisiting User', async () => {  // Test for Logging-in User
    const response = await request(app).post('/users/login').send({
        email: futureUser.email,
        password: futureUser.password
    }).expect(200)

    const user = await User.findById(futureUser._id);
    expect(user.tokens[1].token).toBe(response.body.token);
});

test('Should not Login Non-Existent User', async () => {  // Test for Non-Existent User or Wrong Credentials
    await request(app).post('/users/login').send({
        email: futureUser.email,
        password: "randomPassword"
    }).expect(400)
});

test('Should get Profile for a User', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${futureUser.tokens[0].token}`)
        .send()
        .expect(200)
});

test('Should not get Profile for Unauthenticated User', async () => {  // Test for Unauthenticated User Profile Access
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
});

test('Should Delete User Account for Authenticated User', async () => {  // Test for Authenticated User Profile Delete
    await request(app)
        .delete('/user/me')
        .set('Authorization', `Bearer ${futureUser.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(futureUser._id);
    expect(user).toBeNull() // Testing if the User is Properly Deleted or Not
});

test('Should Not Delete User Account for Unauthenticated User', async () => {  // Test for Unauthenticated User Profile Delete
    await request(app)
        .delete('/user/me')
        .send()
        .expect(401)
});

test('Accepting Avatar for Authenticated User', async () => {  // Test for Accepting User Avatar for AUthenticated User
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${futureUser.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/test_img.jpg')
        .expect(201)
    const user = await User.findById(futureUser._id);
    expect(user.avatar).toEqual(expect.any(Buffer))
});

test('Updating Valid User Fields', async () => {  // Test for Updating Valid User Fields
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${futureUser.tokens[0].token}`)
        .send({
            name: "KMANA gupta"
        })
        .expect(200)
    const user = await User.findById(futureUser._id);
    expect(user.name).toEqual('KMANA gupta')
});

test('Updating inValid User Fields', async () => {  // Test for Updating inValid User Fields
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${futureUser.tokens[0].token}`)
        .send({
            invalidProp: "random string"
        })
        .expect(400)
});