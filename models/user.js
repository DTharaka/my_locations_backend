const mongoose = require('mongoose');
const uniqueVlidator = require('mongoose-unique-validator');

const Schema =  mongoose.Schema;

const userShema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, minlength: 6},
    image: {type: String, required: true},
    places: [{type: mongoose.Types.ObjectId, required: true, ref: 'Place'}]
});

userShema.plugin(uniqueVlidator);

module.exports = mongoose.model('User', userShema);