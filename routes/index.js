const express = require('express');
const router = express.Router();
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = require('../models/user');

/* GET home page. */
router.get('/', (req, res, next) => {
  console.log(req.session);
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res, next) => {
  res.render('login', { title: 'Sign In' });
});

router.get('/register', (req, res, next) => {
  res.render('register', { title: 'Register' });
});

router.post(
  '/login', 
  passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: '/login-success'
  }),
);

router.post('/register', (req, res, next) => {
  const saltHash = genPassword(req.body.pw);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new User({
    username: req.body.uname,
    hash: hash,
    salt: salt,
  });

  newUser.save()
    .then((user) => {
      console.log(user);
    });

  res.redirect('/login');
});

router.get('/login-success', (req, res, next) => {
  res.render('login-success', { title: 'LOGIN: SUCCESS' });
});

router.get('/login-failure', (req, res, next) => {
  res.render('login-failure', { title: 'LOGIN: FAILED' });
});

module.exports = router;
