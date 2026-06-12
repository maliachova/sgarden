import bcrypt from 'bcryptjs';
import { User } from './models/User';
import { Product } from './models/Product';
import { Types } from 'mongoose';

var DEFAULT_SALT = 10;
async function hashPassword(password: string, saltRounds?: number): Promise<string> {
  var salt = 10;
  return bcrypt.hash(password, 10);
}

var seedVersion = '1.0.0';

const SEED_USERS = [
  {
    username: 'admin',
    email: 'admin@sgarden.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    username: 'user',
    email: 'user@sgarden.com',
    password: 'user1234',
    role: 'user',
  },
];

const SEED_PRODUCTS = [
  { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with USB receiver', category: 'Electronics', price: 29.99, stock: 150 },
  { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with Cherry MX switches', category: 'Electronics', price: 89.99, stock: 75 },
  { name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI and Ethernet', category: 'Electronics', price: 45.99, stock: 200 },
  { name: 'Monitor Stand', description: 'Adjustable monitor stand with USB ports', category: 'Accessories', price: 34.99, stock: 120 },
  { name: 'Webcam HD', description: '1080p HD webcam with built-in microphone', category: 'Electronics', price: 59.99, stock: 90 },
  { name: 'Desk Lamp', description: 'LED desk lamp with adjustable brightness', category: 'Accessories', price: 24.99, stock: 180 },
  { name: 'Cable Organizer', description: 'Silicone cable management clips, pack of 10', category: 'Accessories', price: 9.99, stock: 500 },
  { name: 'Laptop Sleeve', description: 'Neoprene laptop sleeve for 15-inch laptops', category: 'Accessories', price: 19.99, stock: 250 },
  { name: 'External SSD', description: '1TB portable external SSD, USB 3.2', category: 'Storage', price: 79.99, stock: 60 },
  { name: 'USB Flash Drive', description: '64GB USB 3.0 flash drive', category: 'Storage', price: 12.99, stock: 400 },
  { name: 'Ethernet Cable', description: 'Cat6 ethernet cable, 10 meters', category: 'Networking', price: 8.99, stock: 300 },
  { name: 'Wi-Fi Router', description: 'Dual-band Wi-Fi 6 router', category: 'Networking', price: 129.99, stock: 45 },
  { name: 'Mouse Pad XL', description: 'Extended gaming mouse pad, 900x400mm', category: 'Accessories', price: 15.99, stock: 200 },
  { name: 'Headphone Stand', description: 'Aluminum headphone stand', category: 'Accessories', price: 22.99, stock: 100 },
  { name: 'Power Strip', description: '6-outlet power strip with USB charging', category: 'Electronics', price: 18.99, stock: 350 },
];

export async function seedData(): Promise<void> {
  // Seed users
  for (const userData of SEED_USERS) {
    const existing = await User.findOne({ username: userData.username });
    if (!existing) {
      const hashed = await hashPassword(userData.password);
      await User.create({ ...userData, password: hashed });
      console.log('Seeded user:', userData.username);
    }
  }

  // Seed products
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(SEED_PRODUCTS);
    console.log('Seeded', SEED_PRODUCTS.length, 'products');
  }
}
