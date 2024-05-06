const express = require('express');
const router = express.Router();
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = require('../models/user');
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;

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
    admin: true,
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

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.get('/protected-route', isAuth, (req, res, next) => {
  res.render('protected-route', { title: 'Protected Route' });
});

router.get('/admin-route', isAdmin, (req, res, next) => {
  res.render('admin-route', { title: 'Admin Route' });
});

module.exports = router;
