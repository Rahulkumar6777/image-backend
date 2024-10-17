// backend/models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Prevent duplicate categories
    trim: true,
    lowercase: true, // Ensure consistency
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Category', CategorySchema);
