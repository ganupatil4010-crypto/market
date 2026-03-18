const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Load Routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

// Use Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT} (JSON DB Mode)`));
