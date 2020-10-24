const { v4: uuidv4 } = require('uuid');
const HttpErrot = require('../models/http-error');

let DUMMY_PLACES = [
    {
        id: 'p1', 
        title: 'Eiffel Tower',
        description: 'One of the most higher ower made with iron', 
        imageUrl: 'https://static1.squarespace.com/static/58fbfecf725e25a3d1966494/5902947920099eda52c5ac82/5a01f46bd63352b3be374974/1554667940303/?format=1500w',
        address: 'Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France',
        creator: 'u1',
        location: {
            lat: 48.8584,
            lng: 2.2945   
        }
    }
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;

    const place = DUMMY_PLACES.find((p) => {
        return p.id === placeId
    });

    if (!place) {
        // return res.status(404).json({message: 'Could not find a place for provided id'});

        const error = new Error('Could not find a place for provided id');
        error.code = 404;
        return next(error);
    }

    res.json({place: place}); // OR res.json({place});
};


const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;

    const places = DUMMY_PLACES.filter((p) => {
        return p.creator === userId;
    });

    if (!places || places.length == 0) {
        // return res.status(404).json({message: 'Could not find a place for provided user id'});

        // const error = new Error('Could not find a place for provided user id');
        // error.code = 404;
        // throw error;

        throw new HttpError('Could not find places for provided user id', 404);
    }

    res.json({place: places});
};


const createPlace = (res, req, next) => {
    const { title, description, address, creator, location } = req.body; 

    const createdPlace = {
        id: uuidv4(),
        title: title,
        description: description,
        address: address,
        creator: creator,
        location: location
    };

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({place: createdPlace});
};

const updatePlace = ((req, res, next) => {
    const { title, description } = req.body; 
    const placeId = req.params.pid;

    const updatedPlace = {...DUMMY_PLACES.find(p => (p.id === placeId))};
    const placeIndex = DUMMY_PLACES.findIndex(p => (p.id === placeId));
    updatePlace.title = title;
    updatePlace.description = description;

    DUMMY_PLACES[placeIndex] = updatePlace;

    res.status(200).json({place: updatePlace});
});

const deletePlace = ((req, res, next) => {
    const placeId = req.params.pid;
    DUMMY_PLACES = DUMMY_PLACES.filter((p) => {
        p.pid !== placeId;
    });

    res.status(200).json({message: 'Place deleted'});
});

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace= deletePlace;
