const express = require('express');
const router = express.Router();
const passport = require('passport');
const genPassword = require('../util/passwordUtils').genPassword;
const connection = require('../config/database');
const User = require('../models/user');
const Post = require('../models/post');
const { isAuth, isAdmin } = require('../util/authUtils')
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

require('dotenv').config();

/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {
  const allPosts = await Post.find().sort({ added: -1 }).exec();
  res.render("pages/index", {
    title: "Members Only!",
    posts: allPosts,
    user: req.user,
  });
}));

router.post(
  '/delete/:postId',
  asyncHandler(async (req, res, next) => {
    await Post.findByIdAndDelete(req.params.postId).exec();
    res.redirect('/');
  }),
);

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

router.post('/register', [
  body('firstname')
    .exists()
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('You must input a first name with at least 1 character.')
    .isAlphanumeric()
    .withMessage('First name must only have alphanumeric characters.'),
  body('lastname')
    .exists()
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('You must input a last name with at least 1 character.')
    .isAlphanumeric()
    .withMessage('Last name must only have alphanumeric characters.'),
  body('uname')
    .exists()
    .withMessage('You must input a username.')
    .trim()
    .isEmail()
    .normalizeEmail()
    .escape()
    .withMessage('Username must be a valid email.'),
  body('pw')
    .exists()
    .withMessage('You must type a password.')
    .isLength({ min: 2 })
    .withMessage('Password must be at least 2 characters.'),
  body('pwconfirm')
    .exists()
    .withMessage('You must confirm the password.')
    .custom((value, {req}) => {
      if (value !== req.body.pw) {
        throw new Error('Confirmation password must match the password.')
      }
      return true;
    }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const saltHash = await genPassword(req.body.pw);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.uname,
      hash: hash,
      salt: salt,
      admin: req.body.pwadmin === process.env.ADMIN_PASSWORD,
      member: false,
    });

    console.log(`newUser: ${newUser}`);

    if (!errors.isEmpty()) {
      res.render('pages/register', {
        title: 'Register',
        errors: errors.array(),
      });
      return;
    } else {
      await newUser.save()
        .then((user) => {
          console.log(user);
        });

      res.redirect('/login');
    }
  }),
]);

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

router.get(
  "/protected-route",
  isAuth,
  asyncHandler(async (req, res, next) => {
    res.render("pages/protected-route", { title: "Protected Route" });
  })
);

router.get(
  "/admin-route",
  isAdmin,
  asyncHandler(async (req, res, next) => {
    res.render("pages/admin-route", { title: "Admin Route" });
  })
);

router.get(
  "/create-post",
  isAuth,
  asyncHandler(async (req, res, next) => {
    res.render("pages/create-post", {
      title: "Create Post",
      user: res.locals.currentUser.username,
    });
  })
);

router.post('/create-post', asyncHandler(async (req, res, next) => {
  const newPost = new Post({
    firstname: res.locals.currentUser.firstname,
    lastname: res.locals.currentUser.lastname,
    username: res.locals.currentUser.username,
    title: req.body.title,
    text: req.body.posttext,
    added: new Date(),
  });

  console.log(`newPost: ${newPost}`);

  await newPost.save()
    .then((postText) => {
      console.log(postText);
    });

  res.redirect('/');

}));

router.get('/membership', asyncHandler((req, res, next) => {
  res.render('pages/membership', { title: 'Membership'});
}));

router.post('/membership', [
  body('pwmember')
    .exists()
    .withMessage('You must enter the password for membership.'),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (req.body.pwmember !== process.env.MEMBER_PASSWORD) {
      console.log('wrong password');
      res.redirect('/');
      return;
    }

    const user = new User({
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      username: req.user.username,
      hash: req.user.hash,
      salt: req.user.salt,
      admin: req.user.admin,
      member: true,
      _id: req.user._id,
    });

    console.log(`updated user: ${user}`);

    if (!errors.isEmpty()) {
      res.render('pages/membership', {
        title: 'Membership',
        errors: errors.array(),
      });
      return;
    } else {
      await User.findByIdAndUpdate(req.user._id, user, {})
      res.redirect('/');
    }
  }),
])

module.exports = router;
