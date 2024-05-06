const express = require('express');
const router = express.Router();
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = require('../models/user');
const Post = require('../models/post');
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;
const asyncHandler = require('express-async-handler');

/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {
  console.log(req.session);
  res.render('index', { title: 'Express' });
}));

router.get('/login', asyncHandler(async (req, res, next) => {
  res.render('login', { title: 'Sign In' });
}));

router.get('/register', asyncHandler(async (req, res, next) => {
  res.render('register', { title: 'Register' });
}));

router.post(
  '/login', 
  passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: '/login-success'
  }),
);

router.post('/register', asyncHandler(async (req, res, next) => {
  const saltHash = await genPassword(req.body.pw);

  const salt = saltHash.salt;
  const hash = saltHash.hash;

  const newUser = new User({
    username: req.body.uname,
    hash: hash,
    salt: salt,
    admin: false,
    member: false,
  });

  console.log(`newUser: ${newUser}`);

  await newUser.save()
    .then((user) => {
      console.log(user);
    });

  res.redirect('/login');
}));

router.get('/login-success', asyncHandler(async (req, res, next) => {
  res.render('login-success', { title: 'LOGIN: SUCCESS' });
}));

router.get('/login-failure', asyncHandler(async (req, res, next) => {
  res.render('login-failure', { title: 'LOGIN: FAILED' });
}));

router.get('/logout', asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
}));

router.get('/protected-route', isAuth, asyncHandler(async (req, res, next) => {
  res.render('protected-route', { title: 'Protected Route' });
}));

router.get('/admin-route', isAdmin, asyncHandler(async (req, res, next) => {
  res.render('admin-route', { title: 'Admin Route' });
}));

router.get('/create-post', isAuth, asyncHandler(async (req, res, next) => {
  res.render('create-post', { title: 'Create Post', user: res.locals.currentUser.username });
}));

router.post('/create-post', asyncHandler(async (req, res, next) => {
  const newPost = new Post({
    username: res.locals.currentUser.username,
    text: req.body.posttext,
    added: new Date(),
  });

  console.log(`newPost: ${newPost}`);

  await newPost.save()
    .then((postText) => {
      console.log(postText);
    });

  res.redirect('/protected-route');

}));

module.exports = router;
