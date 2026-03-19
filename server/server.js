const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  allowEIO3: true // Allow compatibility with older clients if needed
});

app.get('/api/test-socket', (req, res) => {
  const io = req.app.get('socketio');
  io.emit('settings_updated', { whatsappNumber: 'TEST_SUCCESS' });
  res.send('Socket event emitted');
});

// Simple Security Middleware
const ownerAuth = (req, res, next) => {
  const isOwner = req.headers['x-user-role'] === 'owner';
  if (isOwner) {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied: Owner only' });
  }
};

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Prevent API caching
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Pass ownerAuth and io to routes
app.set('socketio', io);
app.set('ownerAuth', ownerAuth);

// Load Routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cartRoutes = require('./routes/cart');
const settingsRoutes = require('./routes/settings');

// Use Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/settings', settingsRoutes);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT} (JSON DB Mode with Socket.IO)`));
