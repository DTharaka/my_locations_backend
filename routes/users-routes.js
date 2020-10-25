const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const usersControllers = require('../controllers/users-controllers');

router.get('/', usersControllers.getUsers);

router.post('/login', usersControllers.loginUser);

router.post('/signup', [
    check('name').not().isEmpty(),
    check('email')
        .normalizeEmail() // Test@test.com => test@test.com
        .isEmail(),
    check('password').isLength({min: 6})
] , usersControllers.signUpUsers);

module.exports = router;