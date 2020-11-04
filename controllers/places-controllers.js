const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const getCoordinatesForAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');
const HttpError = require('../models/http-error');
const mongooseUniqueValidator = require('mongoose-unique-validator');


const getPlaceById = async(req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong! Could not find a place', 500)
    }

    if (!place) {
        // return res.status(404).json({message: 'Could not find a place for provided id'});
        const error = new HttpError('Could not find a place for provided id', 404);
        return next(error);
    }

    res.json({place: place.toObject({getters: true})}); // OR res.json({place});
};


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    // let places;
    let userWithPlaces;
    try {
        // places = await Place.find({ creator: userId});
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new Error('Fetching places failed, please try again.', 500);
        return next(error);
    }

    // if (!places || places.length === 0){}
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        // return res.status(404).json({message: 'Could not find a place for provided user id'});

        // const error = new Error('Could not find a place for provided user id');
        // error.code = 404;
        // throw error;

        throw new HttpError('Could not find places for provided user id', 404);
    }

    res.json({places: userWithPlaces.places.map((place) => {place.toObject({ getters: true })})});
};


const createPlace = async (res, req, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input passed, please check again', 422));
    }

    const { title, description, address, creator } = req.body; 

    let coordinates;
    try {
        coordinates = await getCoordinatesForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title: title,
        description: description,
        address: address,
        location: coordinates,
        image: 'https://static1.squarespace.com/static/58fbfecf725e25a3d1966494/5902947920099eda52c5ac82/5a01f46bd63352b3be374974/1554667940303/?format=1500w',
        creator: creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating place failed, Try again !', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Can not find user!', 404);
        return next(error);
    }
    // Here we want to save the user and add palceId to relevant user 
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess});
        user.places.push(createdPlace);
        await user.save({ session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating place failed, Please try again !', 500
        );
        return next(error);
    }
    res.status(201).json({place: createdPlace});
};

const updatePlace = async(req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input passed, please check again', 422));
    }

    const { title, description } = req.body; 
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new Error('Something went wrong, please try again.', 500);
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new Error('Something went wrong, can not update.', 500);
        return next(error);
    }

    res.status(200).json({place: place.toObject({ getters: true })});
};

const deletePlace = async(req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new Error('Something went wrong, can not delete.', 500);
        return next(error);
    }

    if (!place) {
        const error = new Error('Could not find place for given id', 404);
        return next(error);
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        place.remove({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new Error('Something went wrong, can not delete.', 500);
        return next(error);
    }

    res.status(200).json({message: 'Place deleted'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace= deletePlace;
