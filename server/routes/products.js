const express = require('express');
const router = express.Router();
const db = require('../db');

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

module.exports = router;
