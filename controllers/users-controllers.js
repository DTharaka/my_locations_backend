const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req,res,next) => {

    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError('Fetching users failed, Please try again',500);
        return next(error);
    }
    res.json({users: users.map(user => user.toObject({ getters: true }))});
};

const loginUser = async(req,res,next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError('Signup failed, please try again', 500);
        return next(error);
    }

    if (!existingUser || existingUser.id !== password) {
        const error =  new HttpError('Could not identify user !', 401);
        return next(error);
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
        places: []
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