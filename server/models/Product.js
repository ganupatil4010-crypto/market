const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }, // keeping the original int ids for frontend compatibility
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true },
  weight: { type: String, required: true },
  type: { type: String, required: true }, // "family" or "budget"
});

module.exports = mongoose.model('Product', ProductSchema);
