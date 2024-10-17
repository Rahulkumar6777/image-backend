// backend/routes/images.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const { cloudinary, storage } = require('../config/cloudinaryConfig');
const Image = require('../models/Image');
const Category = require('../models/Category');
const { body, validationResult } = require('express-validator');
const NodeCache = require('node-cache');

const authRoutes = require('./auth');

// Initialize cache with 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

const upload = multer({ storage });

// @route   POST /api/images/upload
// @desc    Upload an image
// @access  Private
router.post(
  '/images/upload',
  auth,
  upload.single('image'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  async (req, res) => {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded image from Cloudinary if validation fails
      if (req.file && req.file.path) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, category } = req.body;

    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }

      // Validate category
      const categoryExists = await Category.findOne({ name: category.toLowerCase() });
      if (!categoryExists) {
        // Delete uploaded image from Cloudinary
        await cloudinary.uploader.destroy(req.file.filename);
        return res.status(400).json({ msg: 'Invalid category' });
      }

      const { path: imageUrl, originalname, filename } = req.file;

      // Check for duplicate imageUrl
      const duplicateImage = await Image.findOne({ imageUrl });
      if (duplicateImage) {
        // Delete uploaded image from Cloudinary
        await cloudinary.uploader.destroy(req.file.filename);
        return res.status(400).json({ msg: 'Image already exists' });
      }

      // Create a new image instance
      const newImage = new Image({
        title,
        category: category.toLowerCase(),
        imageUrl, // Cloudinary URL
        publicId: filename, // Cloudinary public_id
        originalName: originalname,
      });

      await newImage.save();

      // Clear cache for images if needed
      cache.del('images');

      res.status(201).json({ msg: 'Image uploaded successfully', image: newImage });
    } catch (err) {
      console.error('Error uploading image:', err);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const cachedCategories = cache.get('categories');
    if (cachedCategories) {
      return res.json(cachedCategories);
    }

    const categories = await Category.find().sort({ name: 1 }).select('name');
    cache.set('categories', categories);
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/images
// @desc    Get all images with pagination, filtering, and searching
// @access  Public
router.get('/images', async (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;

  // Build query object
  let query = {};

  if (category && category !== '') {
    query.category = category.toLowerCase();
  }

  if (search && search !== '') {
    // Search by title
    query.title = { $regex: search, $options: 'i' }; // Case-insensitive
  }

  try {
    const images = await Image.find(query)
      .sort({ uploadedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select('-__v'); // Exclude __v field

    res.json(images);
  } catch (err) {
    console.error('Error fetching images:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/images/:id
// @desc    Delete an image
// @access  Private
router.delete('/images/:id', auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Delete from MongoDB
    await image.remove();

    // Clear cache for images if needed
    cache.del('images');

    res.json({ msg: 'Image deleted successfully' });
  } catch (err) {
    console.error('Error deleting image:', err.message);
    res.status(500).send('Server error');
  }
});

router.use('/', authRoutes);

module.exports = router;
