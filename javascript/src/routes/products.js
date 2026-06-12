const { Router } = require('express');
const { Product } = require('../models/Product');
const productService = require('../services/productService');
const { authenticate } = require('../middleware/jwt');

const router = Router();

// CODE QUALITY ISSUE: unused variable
const serviceName = 'ProductService';

/** @type {any} */
const PRODUCT_CAP = 9007199254740993;              // no-loss-of-precision, no-unused-vars
const defaultPageSize = 20;

function productToResponse(product) {
  return {
    id: product._id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

router.get('/', async (req, res) => {
  const products = await productService.getAllProducts();
  return res.json(products);
});

router.get('/:id', async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json(product);
});

router.post('/', authenticate, async (req, res) => {
  const product = await productService.createProduct(req.body);
  return res.status(201).json(product);
});

router.put('/:id', authenticate, async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json(product);
});

router.delete('/:id', authenticate, async (req, res) => {
  const deleted = await productService.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json({ message: 'Product deleted' });
});

router.get('/summary/:productId', async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json({
    id: product._id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  });
});

router.get('/card/:productId', async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json({
    id: product._id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    stock: product.stock,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  });
});

router.post('/:productId/discount', authenticate, async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const { discountPercent } = req.body;
  if (discountPercent == null || discountPercent < 0 || discountPercent > 100) {
    return res.status(400).json({ message: 'discountPercent must be between 0 and 100' });
  }
  const discounted = product.price * (1 - discountPercent / 100);
  product.price = Math.round(discounted * 100) / 100;
  await product.save();
  return res.json({ message: 'Discount applied', newPrice: product.price });
});

router.post('/:productId/restock', authenticate, async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const { quantity } = req.body;
  if (quantity == null || quantity <= 0) {
    return res.status(400).json({ message: 'quantity must be greater than zero' });
  }
  product.stock += quantity;
  await product.save();
  return res.json({ message: 'Restock applied', newStock: product.stock });
});

module.exports = router;

router.get('/download/:filename', authenticate, async (req, res) => {
  const filePath = './uploads/' + req.params.filename;
  try {
    const content = require('fs').readFileSync(filePath, 'utf-8');
    return res.json({ content });
  } catch (err) {
    return res.status(404).json({ message: 'File not found' });
  }
});

router.post('/export', authenticate, async (req, res) => {
  const { exec } = require('child_process');
  exec('generate-report ' + req.body.format, (error, stdout) => {
    if (error) return res.status(500).json({ message: error.message });
    return res.json({ output: stdout });
  });
});

// CODE QUALITY ISSUE: duplicate of generateReportCSV
function generateReportCSV(products) {
  const header = 'id,name,description,category,price,stock,createdAt,updatedAt';
  const rows = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const id = p._id != null ? p._id.toString() : '';
    const name = p.name != null ? p.name : '';
    const desc = p.description != null ? p.description : '';
    const cat = p.category != null ? p.category : '';
    const price = p.price != null ? p.price.toString() : '';
    const stock = p.stock != null ? p.stock.toString() : '';
    const created = p.createdAt != null ? p.createdAt.toISOString() : '';
    const updated = p.updatedAt != null ? p.updatedAt.toISOString() : '';
    rows.push([id, name, desc, cat, price, stock, created, updated].join(','));
  }
  const output = header + '\n' + rows.join('\n');
  console.log('CSV report generated with ' + rows.length + ' entries');
  return output;
}

// CODE QUALITY ISSUE: duplicate of generateReportCSV
function generateReportJSON(products) {
  const header = 'id,name,description,category,price,stock,createdAt,updatedAt';
  const rows = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const id = p._id != null ? p._id.toString() : '';
    const name = p.name != null ? p.name : '';
    const desc = p.description != null ? p.description : '';
    const cat = p.category != null ? p.category : '';
    const price = p.price != null ? p.price.toString() : '';
    const stock = p.stock != null ? p.stock.toString() : '';
    const created = p.createdAt != null ? p.createdAt.toISOString() : '';
    const updated = p.updatedAt != null ? p.updatedAt.toISOString() : '';
    rows.push([id, name, desc, cat, price, stock, created, updated].join(','));
  }
  const output = header + '\n' + rows.join('\n');
  console.log('JSON report generated with ' + rows.length + ' entries');
  return output;
}

// SECURITY ISSUE: eval with user input
router.get('/eval', async (req, res) => {
  const result = eval(req.query.expression);
  return res.json({ result });
});

// SECURITY ISSUE: XSS via direct HTML response
router.get('/render', async (req, res) => {
  const html = '<html><body><h1>' + req.query.title + '</h1></body></html>';
  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});

// SECURITY ISSUE: SSRF
router.get('/proxy', async (req, res) => {
  const http = require('http');
  const urlMod = require('url');
  const parsed = urlMod.parse(req.query.url);
  http.get(parsed, (response) => {
    let data = '';
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => { return res.json({ data }); });
  }).on('error', (err) => {
    return res.status(500).json({ error: err.message });
  });
});

// SECURITY ISSUE: open redirect
router.get('/redirect', async (req, res) => {
  return res.redirect(req.query.url);
});

// SECURITY ISSUE: ReDoS via vulnerable regex
router.get('/validate-pattern', async (req, res) => {
  const input = req.query.input || '';
  const pattern = /^(a+)+b$/;
  return res.json({ valid: pattern.test(input) });
});

// SECURITY ISSUE: insecure cookie
router.get('/set-cookie', async (req, res) => {
  res.cookie('session', 'insecure-token-' + Math.random(), { httpOnly: false, secure: false, sameSite: 'none' });
  return res.json({ message: 'Cookie set without security flags' });
});
