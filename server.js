// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const imagesRouter = require('./routes/images');
require('dotenv').config();

const app = express();

// Middleware
const corsOptions ={
  origin: 'https://4kimage.netlify.app',
  methods: ['GET' , 'POST'],
  allowedHeaders: ['Content-Type'],
}

app.use(cors(corsOptions))
app.use(express.json());

// Routes
app.use('/api', imagesRouter);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Connect to MongoDB and Start Server
const PORT = process.env.PORT;
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
