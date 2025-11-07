import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (mongoose) => {
      console.log('MongoDB Connected');
      
      // Remove old unique index on enderecoIP if it exists (legacy field)
      try {
        const db = mongoose.connection.db;
        if (db) {
          const ipsCollection = db.collection('ips');
          const indexes = await ipsCollection.indexes();
          const enderecoIPIndex = indexes.find((idx: any) => 
            idx.name === 'enderecoIP_1' || 
            (idx.key && idx.key.enderecoIP !== undefined)
          );
          
          if (enderecoIPIndex && enderecoIPIndex.name) {
            console.log('Removing legacy enderecoIP_1 index...');
            await ipsCollection.dropIndex(enderecoIPIndex.name);
            console.log('Legacy index removed successfully');
          }
        }
      } catch (indexError: any) {
        // Ignore errors if index doesn't exist or can't be dropped
        if (indexError.code !== 27 && indexError.code !== 26) {
          console.warn('Warning: Could not drop legacy index:', indexError.message);
        }
      }
      
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

