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
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
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
app.use(cors({ origin: '*' })); // Keep open for now as per dev status, but ready for restriction
app.use(express.json());

// Pass ownerAuth and io to routes
app.set('socketio', io);
app.set('ownerAuth', ownerAuth);

// Load Routes
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

// Use Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT} (JSON DB Mode with Socket.IO)`));
