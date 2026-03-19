const express = require('express');
const router = express.Router();
const db = require('../db');

// @route   GET /api/settings
// @desc    Get global settings
router.get('/', (req, res) => {
  try {
    const settings = db.getSettings();
    res.json(settings);
  } catch (err) {
    console.error('GET /api/settings error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   POST /api/settings
// @desc    Update global settings (Owner only)
router.post('/', (req, res, next) => req.app.get('ownerAuth')(req, res, next), (req, res) => {
  try {
    const newSettings = req.body;
    db.setSettings(newSettings);
    
    // Optional: emit socket event if you want real-time update of WhatsApp number
    const io = req.app.get('socketio');
    if (io) {
      const clientCount = io.engine.clientsCount;
      console.log(`Emitting settings_updated to ${clientCount} clients:`, newSettings);
      io.emit('settings_updated', newSettings);
    } else {
      console.error('Socket.IO instance not found in req.app');
    }
    
    res.json({ success: true, settings: newSettings });
  } catch (err) {
    console.error('POST /api/settings error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
