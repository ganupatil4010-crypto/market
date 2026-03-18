const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   POST /api/users/login
// @desc    Simplified login/registration
router.post('/login', (req, res) => {
  try {
    const { phone, name } = req.body;
    const users = db.getUsers();
    
    let user = users.find(u => u.phone === phone);
    
    if (user) {
      return res.json({ msg: 'Returning user', user });
    } else {
      // For simplified step-by-step logic in frontend
      if (name === 'temp') {
        return res.status(404).json({ isNew: true });
      }
      
      const newUser = { phone, name, joinedAt: new Date().toISOString() };
      users.push(newUser);
      db.setUsers(users);
      return res.status(201).json({ msg: 'User registered', user: newUser });
    }
  } catch (err) {
    console.error('POST /api/users/login error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   POST /api/users/owner-login
router.post('/owner-login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.OWNER_USERNAME && password === process.env.OWNER_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

module.exports = router;
