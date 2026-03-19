const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/cart
// @desc    Get cart for logged-in user
router.get('/', (req, res) => {
  try {
    const phone = req.query.phone; // In a full JWT setup, this would come from the verified token
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const carts = db.getCarts();
    const userCart = carts[phone] || [];
    res.json(userCart);
  } catch (err) {
    console.error('GET /api/cart error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   POST /api/cart
// @desc    Update/Sync cart for logged-in user
router.post('/', (req, res) => {
  try {
    const { phone, cart } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    
    const carts = db.getCarts();
    carts[phone] = cart;
    db.setCarts(carts);
    
    res.json({ success: true, cart: carts[phone] });
  } catch (err) {
    console.error('POST /api/cart error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
