const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

const DUMMY_USERS= [
    {
        id: 'u1', 
        name: 'test',
        email: 'test@test.com', 
        password: 'test@123',
    }
];

const getUsers = (req,res,next) => {
    res.status(200).json({users: DUMMY_USERS})
};

const loginUser = (req,res,next) => {
    const { email, password } = req.body;

    const identifiedUser = DUMMY_USERS.find((p) => {u.email === email});

    if (!identifiedUser || identifiedUser.id !== password) {
        throw new HttpError('Could not identify user !', 401);
    }

    res.json({message: 'Login Successful !'});
};

const signUpUsers = (req,res,next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid input passed, please check again', 422);
    }

    const { name, email, password } = req.body;

    const hasUsers = DUMMY_USERS.find((u) => {u.email === email});
    if (hasUsers) {
        throw new HttpError('Email already exists !', 422);
    }

    const createdUser = {
        id: uuidv4(),
        name: name,
        email: email,
        password: password
    }

    DUMMY_USERS.push(createdUser);
    res.status(201).json({user: createdUser});
};

exports.getUsers = getUsers;
exports.loginUser = loginUser;
exports.signUpUsers = signUpUsers;