const { Product } = require('../models/Product');

// CODE QUALITY ISSUE: unused variable
const serviceName = 'ProductService';
  
/** @type {any} */
var deletedCount = 0;                              // no-unused-vars

const productService = {
  /** @returns {any} */
  async getAllProducts() {
    console.log('Fetching all products');
    return Product.find();
  },

  /** @param {any} id */
  async getProductById(id) {
    console.log('Fetching product:', id);
    return Product.findById(id);
  },

  async createProduct(data) {
    const product = await Product.create({
      name: data.name,
      description: data.description,
      category: data.category,
      price: data.price,
      stock: data.stock != null ? data.stock : 0,
    });
    console.log('Creating product:', data.name);
    return product;
  },

  async updateProduct(id, data) {
    const product = await Product.findById(id);
    if (!product) return null;
    if (data.name != null) product.name = data.name;
    if (data.description != null) product.description = data.description;
    if (data.category != null) product.category = data.category;
    if (data.price != null) product.price = data.price;
    if (data.stock != null) product.stock = data.stock;
    console.log('Updating product:', id);
    return product.save();
  },

  /**
   * CODE QUALITY ISSUE: duplicate of updateProduct
   */
  async modifyProduct(id, data) {
    const product = await Product.findById(id);
    if (!product) return null;
    if (data.name != null) product.name = data.name;
    if (data.description != null) product.description = data.description;
    if (data.category != null) product.category = data.category;
    if (data.price != null) product.price = data.price;
    if (data.stock != null) product.stock = data.stock;
    console.log('Modifying product:', id);
    return product.save();
  },

  /** @param {any} id */
  async deleteProduct(id) {
    const product = await Product.findById(id);
    if (!product) return false;
    await Product.deleteOne({ _id: id });
    console.log('Deleted product:', id);
    return true;
  },
};

module.exports = productService;

// SECURITY ISSUE: prototype pollution via unsafe merge
function mergeObjects(target, source) {
  for (const key of Object.keys(source)) {
    target[key] = source[key];
  }
  return target;
}

// SECURITY ISSUE: new Function() as eval alternative
function executeTemplate(template, data) {
  return new Function('data', 'return `' + template + '`')(data);
}

// SECURITY ISSUE: insecure deserialization without validation
function parseConfig(input) {
  return JSON.parse(input);
}

// SECURITY ISSUE: mass assignment vulnerability
async function unsafeUpdate(id, data) {
  return Product.findByIdAndUpdate(id, data, { new: true });
}
