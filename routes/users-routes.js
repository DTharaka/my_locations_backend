const express = require('express');

const router = express.Router();

const usersControllers = require('../controllers/users-controllers');

router.get('/', usersControllers.getUsers);

router.post('/login', usersControllers.loginUser);

router.post('/signup ', usersControllers.signUpUsers);

module.exports = router;