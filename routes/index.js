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

require('dotenv').config();

/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {
  console.log(req.session);
  res.render('pages/index', { title: 'Express' });
}));

router.get('/login', asyncHandler(async (req, res, next) => {
  res.render('pages/login', { title: 'Sign In' });
}));

router.get('/register', asyncHandler(async (req, res, next) => {
  res.render('pages/register', { title: 'Register' });
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
    admin: req.body.pwadmin === process.env.ADMIN_PASSWORD,
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
  res.render('pages/login-success', { title: 'LOGIN: SUCCESS' });
}));

router.get('/login-failure', asyncHandler(async (req, res, next) => {
  res.render('pages/login-failure', { title: 'LOGIN: FAILED' });
}));

router.get('/logout', asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
}));

router.get('/protected-route', isAuth, asyncHandler(async (req, res, next) => {
  res.render('pages/protected-route', { title: 'Protected Route' });
}));

router.get('/admin-route', isAdmin, asyncHandler(async (req, res, next) => {
  res.render('pages/admin-route', { title: 'Admin Route' });
}));

router.get('/create-post', isAuth, asyncHandler(async (req, res, next) => {
  res.render('pages/create-post', { title: 'Create Post', user: res.locals.currentUser.username });
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
