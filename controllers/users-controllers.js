const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

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

const signUpUsers = async(req,res,next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input passed, please check again', 422));
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Signup failed, please try again', 500);
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError('User exist already', 422);
        return next(error);
    }

    const createdUser = new User({
        name: name,
        email: email,
        password: password,
        image: '',
        places
    });

    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again!', 500
        );
        return next(error);
    }
    
    res.status(201).json({user: createdUser.toObject({ getters: true })});
};

exports.getUsers = getUsers;
exports.loginUser = loginUser;
exports.signUpUsers = signUpUsers;