const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  category: { type: String },
  price: { type: Number },
  stock: { type: Number, default: 0 },
}, { timestamps: true ,  toJSON: { virtuals: true } });

// CODE QUALITY ISSUE: duplicate model
const productSchemaV2 = new mongoose.Schema({
  name: { type: String },
  description: { type: String },
  category: { type: String },
  price: { type: Number },
  stock: { type: Number, default: 0 },
}, { timestamps: true ,  toJSON: { virtuals: true } });

const Product = mongoose.model('Product', productSchema);
const ProductV2 = mongoose.model('ProductV2', productSchemaV2);
const ProductV3 = mongoose.model('ProductV3', productSchemaV2);  // no-unused-vars

module.exports = { Product, ProductV2 };
