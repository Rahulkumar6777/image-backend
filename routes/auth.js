// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User'); // You'll need to create a User model
require('dotenv').config();

// @route   POST /api/auth/register
// @desc    Register a new admin
// @access  Public (In production, restrict this)
// router.post(
//   '/auth/register',
//   [
//     body('email').isEmail().withMessage('Please include a valid email'),
//     body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password } = req.body;

//     try {
//       let user = await User.findOne({ email: email.toLowerCase() });
//       if (user) {
//         return res.status(400).json({ msg: 'User already exists' });
//       }

//       user = new User({
//         email: email.toLowerCase(),
//         password,
//       });

//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(password, salt);

//       await user.save();

//       const payload = {
//         user: {
//           id: user.id,
//         },
//       };

//       jwt.sign(
//         payload,
//         process.env.JWT_SECRET,
//         { expiresIn: '1h' }, // Token validity
//         (err, token) => {
//           if (err) throw err;
//           res.json({ token });
//         }
//       );
//     } catch (err) {
//       console.error('Register error:', err.message);
//       res.status(500).send('Server error');
//     }
//   }
// );

// @route   POST /api/auth/login
// @desc    Authenticate admin and get token
// @access  Public
router.post(
  '/auth/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' }, // Token validity
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
