const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME   = 'Roofi';

const collections = {};

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db   = client.db(DB_NAME);

  collections.productCol = db.collection('Product');
  collections.blogCol    = db.collection('Blogs');
  collections.userCol    = db.collection('Users');
  collections.orderCol   = db.collection('Orders');
  collections.reviewCol  = db.collection('Reviews');

  // Ensure indexes
  await collections.orderCol.createIndex({ OrderId: 1 }, { unique: true });
  await collections.orderCol.createIndex({ UserId: 1 });
  await collections.orderCol.createIndex({ CreatedAt: -1 });

  await collections.productCol.createIndex({ ProductId: 1 }, { unique: true });
  await collections.blogCol.createIndex({ BlogId: 1 },       { unique: true });
  await collections.blogCol.createIndex({ Slug: 1 },         { unique: true, sparse: true });
  await collections.userCol.createIndex({ UserId: 1 }, { unique: true, sparse: true });
  await collections.userCol.createIndex({ Email: 1 }, { unique: true, sparse: true });

  await collections.reviewCol.createIndex({ productId: 1 });
  await collections.reviewCol.createIndex({ productName: 1 });

  console.log('Connected to MongoDB:', DB_NAME);
}

function getCollections() {
  return collections;
}

module.exports = {
  connectDB,
  getCollections
};
