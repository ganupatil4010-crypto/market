const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../client/public/images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpg, jpeg, png) are allowed!'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// @route   GET /api/products
// @desc    Get all products
router.get('/', (req, res) => {
  try {
    const products = db.getProducts();
    res.json(products);
  } catch (err) {
    console.error('GET /api/products error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   POST /api/products
// @desc    Add a product
router.post('/', (req, res, next) => req.app.get('ownerAuth')(req, res, next), (req, res) => {
  try {
    const products = db.getProducts();
    const newProduct = req.body;
    products.push(newProduct);
    db.setProducts(products);
    
    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('products_updated');
    
    res.status(201).json(newProduct);
  } catch (err) {
    console.error('POST /api/products error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product's price
router.put('/:id', (req, res, next) => req.app.get('ownerAuth')(req, res, next), (req, res) => {
  try {
    const products = db.getProducts();
    const productId = parseInt(req.params.id);
    const updates = req.body;
    
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update fields if they exist in the request body
    if (updates.price !== undefined) products[index].price = Number(updates.price);
    if (updates.img !== undefined) products[index].img = updates.img;
    if (updates.name !== undefined) products[index].name = updates.name;
    if (updates.weight !== undefined) products[index].weight = updates.weight;
    if (updates.category !== undefined) products[index].category = updates.category;
    if (updates.type !== undefined) products[index].type = updates.type;
    
    db.setProducts(products);
    
    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('products_updated');
    
    res.json(products[index]);
  } catch (err) {
    console.error('PUT /api/products/:id error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
router.delete('/:id', (req, res, next) => req.app.get('ownerAuth')(req, res, next), (req, res) => {
  try {
    const products = db.getProducts();
    const productId = parseInt(req.params.id);
    const filteredProducts = products.filter(p => p.id !== productId);
    
    if (products.length === filteredProducts.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    db.setProducts(filteredProducts);
    
    // Emit real-time update
    const io = req.app.get('socketio');
    if (io) io.emit('products_updated');
    
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('DELETE /api/products/:id error:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

// @route   POST /api/products/upload-image/:id
// @desc    Upload product image
router.post('/upload-image/:id', (req, res, next) => req.app.get('ownerAuth')(req, res, next), (req, res) => {
  upload.single('productImage')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Multer Error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a file' });
    }

    try {
      const products = db.getProducts();
      const productId = parseInt(req.params.id);
      const index = products.findIndex(p => p.id === productId);

      if (index === -1) {
        // Remove uploaded file if product not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Product not found' });
      }

      // Update image path in DB
      // We store the path relative to the public folder: images/filename
      const oldImagePath = products[index].img;
      products[index].img = `images/${req.file.filename}`;
      db.setProducts(products);

      // Optionally delete old image if it's not a default one
      if (oldImagePath && !oldImagePath.startsWith('http') && !oldImagePath.includes('general.png')) {
          const fullOldPath = path.join(__dirname, '../../client/public', oldImagePath);
          if (fs.existsSync(fullOldPath)) {
              try {
                  fs.unlinkSync(fullOldPath);
              } catch (unlinkErr) {
                  console.warn('Failed to delete old image:', fullOldPath, unlinkErr);
              }
          }
      }

      // Emit real-time update
      const io = req.app.get('socketio');
      if (io) io.emit('products_updated');

      res.json({ 
        success: true, 
        message: 'Image uploaded successfully', 
        product: products[index] 
      });
    } catch (dbErr) {
      console.error('Database update error after upload:', dbErr);
      res.status(500).json({ error: 'Server Error during database update' });
    }
  });
});

module.exports = router;
