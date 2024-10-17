// backend/seedCategories.js
const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

const categories = [
  'recent',
  'popular',
  'featured',
  'random',
  'collections',
  'nature'
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    for (let name of categories) {
      const exists = await Category.findOne({ name: name.toLowerCase() });
      if (!exists) {
        await Category.create({ name: name.toLowerCase() });
        console.log(`Category '${name}' created.`);
      } else {
        console.log(`Category '${name}' already exists.`);
      }
    }

    mongoose.disconnect();
    console.log('Seeding completed.');
  } catch (err) {
    console.error('Error seeding categories:', err);
  }
};

seedCategories();
