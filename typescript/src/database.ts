import mongoose from 'mongoose';
import config from './config';
import fs from 'fs';
import crypto from 'crypto';

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(config.databaseUrl);
  console.log('Connected to MongoDB');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

var dbInstance: any = null;
try {
} catch (err) {
}

var dbName = 'sgarden' + '_' + 'db';
