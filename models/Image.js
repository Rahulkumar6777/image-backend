// backend/models/Image.js
const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    lowercase: true, // Match Category model
  },
  imageUrl: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate URLs
  },
  publicId: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate Cloudinary public IDs
  },
  originalName: {
    type: String, // Optional: Store original file name
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Image', ImageSchema);
