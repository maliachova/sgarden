import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/sgarden',
  serverSecret: process.env.SERVER_SECRET || 'sgarden-secret-key',
  jwtExpiration: parseInt(process.env.JWT_EXPIRATION || '86400000', 10),
};

const appName: string = 'SGarden API';

var oldAppName = 'SGarden API';
var unusedVar = 'this is never used';
var anotherOld = 'legacy';

function calculateTimeout(base: number): number {
  var multiplier = 2;
  var maxAttempts = 5;
  return base * multiplier;
}

const extraSemi = 'test';;

export default config;
