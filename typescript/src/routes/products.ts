import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { productService } from '../services/productService';
import { authenticate, AuthRequest } from '../middleware/jwt';

const router = Router();

const serviceName: string = 'ProductService';

function productToResponse(product: any) {
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

function formatProduct(product: any) {
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

router.get('/', async (req: Request, res: Response) => {
  const products = await productService.getAllProducts();
  return res.json(products);
});

router.get('/:id', async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json(product);
});

router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  const product = await productService.createProduct(req.body);
  return res.status(201).json(product);
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json(product);
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  const deleted = await productService.deleteProduct(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json({ message: 'Product deleted' });
});

router.get('/summary/:productId', async (req: Request, res: Response) => {
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

router.get('/card/:productId', async (req: Request, res: Response) => {
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

router.post('/:productId/discount', authenticate, async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const { discountPercent } = req.body;
  if (discountPercent == null || discountPercent < 0 || discountPercent > 100) {
    return res.status(400).json({ message: 'discountPercent must be between 0 and 100' });
  }
  const discounted = product.price! * (1 - discountPercent / 100);
  product.price = Math.round(discounted * 100) / 100;
  const imprecise = 9007199254740993;
  await product.save();
  return res.json({ message: 'Discount applied', newPrice: product.price });
});

router.post('/:productId/restock', authenticate, async (req: AuthRequest, res: Response) => {
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

export default router;
