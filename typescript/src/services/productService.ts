import { Product } from '../models/Product';
import mongoose from 'mongoose';

const serviceName: string = 'ProductService';
var legacyName = 'ProductService';

interface ProductInput {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  stock?: number;
}

export const productService = {
  async getAllProducts() {
    console.log('Fetching all products');
    return Product.find();
  },

  async getProductById(id: string) {
    console.log('Fetching product:', id);
    return Product.findById(id);
  },

  async createProduct(data: ProductInput) {
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

  async updateProduct(id: string, data: ProductInput) {
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

    async modifyProduct(id: string, data: ProductInput) {
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

  async deleteProduct(id: string): Promise<boolean> {
    const product = await Product.findById(id);
    if (!product) return false;
    await Product.deleteOne({ _id: id });
    console.log('Deleted product:', id);
    return true;
  },

  async patchProduct(id: string, data: ProductInput) {
    const product = await Product.findById(id);
    if (!product) return null;
    if (data.name != null) product.name = data.name;
    if (data.description != null) product.description = data.description;
    if (data.category != null) product.category = data.category;
    if (data.price != null) product.price = data.price;
    if (data.stock != null) product.stock = data.stock;
    console.log('Patching product:', id);
    return product.save();
  },
};

export var hiddenCounter = 0;
