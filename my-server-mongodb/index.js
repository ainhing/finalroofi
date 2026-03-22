const express    = require('express');
const app        = express();
const port       = 3003;
const morgan     = require('morgan');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');
const fileUpload = require('express-fileupload');
const { MongoClient, ObjectId } = require('mongodb');

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload());

// ── Static files — serve uploaded images ─────────────────────────────────────
app.use(express.static(path.resolve(__dirname, '../my-app/public')));

// ── MongoDB ──────────────────────────────────────────────────────────────────
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME   = 'Roofi';

let productCol;
let blogCol;
let userCol;
let orderCol;

async function connectDB() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db   = client.db(DB_NAME);
  productCol = db.collection('Product');
  blogCol    = db.collection('Blogs');
  userCol    = db.collection('Users');
  orderCol   = db.collection('Orders');

  await orderCol.createIndex({ OrderId: 1 }, { unique: true });
  await orderCol.createIndex({ UserId: 1 });
  await orderCol.createIndex({ CreatedAt: -1 });

  await productCol.createIndex({ ProductId: 1 }, { unique: true });
  await blogCol.createIndex({ BlogId: 1 },       { unique: true });
  await blogCol.createIndex({ Slug: 1 },         { unique: true, sparse: true });
  await userCol.createIndex({ UserId: 1 }, { unique: true, sparse: true });
  await userCol.createIndex({ Email: 1 }, { unique: true, sparse: true });

  console.log('Connected to MongoDB:', DB_NAME);
}

async function ensureIndex(col, keys, options) {
  try {
    await col.createIndex(keys, options);
  } catch (e) {
    if (e?.code === 86 || e?.codeName === 'IndexKeySpecsConflict') {
      console.warn('[Index warning] conflict, skip:', options?.name || JSON.stringify(keys));
      return;
    }
    throw e;
  }
}

function stripMongoId(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
}

function mapUser(doc) {
  if (!doc) return doc;
  const { _id, Password, ...rest } = doc;
  return rest;
}

function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(String(id));
}

connectDB()
  .then(() => app.listen(port, () => console.log(`Server listening on port ${port}`)))
  .catch(err => { console.error('MongoDB connection failed:', err); process.exit(1); });

app.get('/', (req, res) => res.send('Roofi API - MongoDB'));

// ════════════════════════════════════════════════════════════════════════════
//  PRODUCTS  (MongoDB collection: Product)
// ════════════════════════════════════════════════════════════════════════════

// GET /products
app.get('/products', async (req, res) => {
  try {
    const docs = await productCol
      .find({ IsDeleted: { $ne: true } })
      .sort({ CreatedAt: -1 })
      .toArray();
    const data = docs.map(({ _id, ...p }) => p);
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// GET /products/:id
app.get('/products/:id', async (req, res) => {
  try {
    const doc = await productCol.findOne({ ProductId: req.params.id });
    if (!doc) return res.status(404).json({ error: 'Product not found' });
    const { _id, ...product } = doc;
    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load product' });
  }
});

// POST /products
app.post('/products', async (req, res) => {
  try {
    const body = req.body;
    if (!body || !body.ProductId) return res.status(400).json({ error: 'Missing ProductId' });

    if (await productCol.findOne({ ProductId: String(body.ProductId) }))
      return res.status(409).json({ error: 'ProductId already exists' });

    const now = new Date().toISOString();
    const doc = {
      ProductId:     String(body.ProductId),
      CategoryId:    body.CategoryId    || 'C000',
      ProductName:   body.ProductName   || '',
      OriginalPrice: Number(body.OriginalPrice || 0),
      Price:         Number(body.Price         || 0),
      Images:        Array.isArray(body.Images) ? body.Images : [],
      Description:   body.Description  || '',
      StockQuantity: Number(body.StockQuantity || 0),
      // FIX: lưu IsActive và IsFeatured vào database
      IsActive:      body.IsActive  !== undefined ? Boolean(body.IsActive)   : true,
      IsFeatured:    body.IsFeatured !== undefined ? Boolean(body.IsFeatured) : false,
      IsDeleted:     false,
      CreatedAt:     now,
      UpdatedAt:     now,
    };
    await productCol.insertOne(doc);
    const { _id, ...saved } = doc;
    res.status(201).json({ success: true, product: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /products/:id
app.put('/products/:id', async (req, res) => {
  try {
    const body    = req.body || {};
    // FIX: thêm IsActive và IsFeatured vào danh sách allowed fields
    const allowed = [
      'ProductName', 'OriginalPrice', 'Price', 'Images',
      'Description', 'StockQuantity', 'IsDeleted', 'CategoryId',
      'IsActive', 'IsFeatured'
    ];
    const $set = { UpdatedAt: new Date().toISOString() };

    for (const key of allowed) {
      if (body[key] === undefined) continue;
      if (key === 'Images')
        $set[key] = Array.isArray(body[key]) ? body[key] : [];
      else if (['OriginalPrice', 'Price', 'StockQuantity'].includes(key))
        $set[key] = Number(body[key]);
      // FIX: ép kiểu Boolean cho IsActive và IsFeatured
      else if (['IsActive', 'IsFeatured', 'IsDeleted'].includes(key))
        $set[key] = Boolean(body[key]);
      else
        $set[key] = body[key];
    }

    const result = await productCol.findOneAndUpdate(
      { ProductId: req.params.id },
      { $set },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Product not found' });
    const { _id, ...updated } = result;
    res.json({ success: true, product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /products/:id
app.delete('/products/:id', async (req, res) => {
  try {
    const result = await productCol.deleteOne({ ProductId: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
//  BLOGS  (MongoDB collection: blogs)
// ════════════════════════════════════════════════════════════════════════════

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// GET /blogs
app.get('/blogs', async (req, res) => {
  try {
    const docs = await blogCol.find({}).sort({ CreatedAt: -1 }).toArray();
    res.json({ data: docs.map(stripMongoId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load blogs' });
  }
});

// GET /blogs/:id
app.get('/blogs/:id', async (req, res) => {
  try {
    const id  = req.params.id;
    const doc = await blogCol.findOne({ $or: [{ BlogId: id }, { Slug: id }] });
    if (!doc) return res.status(404).json({ error: 'Blog not found' });
    res.json({ success: true, blog: stripMongoId(doc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load blog' });
  }
});

// POST /blogs
app.post('/blogs', async (req, res) => {
  try {
    const body = req.body || {};
    const now  = new Date().toISOString();

    const title = body.Title || body.title || '';
    if (!title) return res.status(400).json({ error: 'Missing Title' });

    const blogId = body.BlogId || `BLOG_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const slug   = body.Slug  || toSlug(title);

    if (await blogCol.findOne({ BlogId: blogId }))
      return res.status(409).json({ error: 'BlogId already exists' });

    const doc = {
      BlogId:      blogId,
      Slug:        slug,
      Title:       title,
      Summary:     body.Summary     || body.summary     || '',
      Content:     body.Content     || body.content     || '',
      Author:      body.Author      || body.author      || '',
      Tags:        Array.isArray(body.Tags) ? body.Tags : [],
      CoverImage:  body.CoverImage  || body.coverImage  || '',
      IsPublished: body.IsPublished !== undefined ? Boolean(body.IsPublished) : true,
      CreatedAt:   now,
      UpdatedAt:   now,
    };

    await blogCol.insertOne(doc);
    const { _id, ...saved } = doc;
    res.status(201).json({ success: true, blog: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// PUT /blogs/:id
app.put('/blogs/:id', async (req, res) => {
  try {
    const body    = req.body || {};
    const allowed = ['Title', 'Summary', 'Content', 'Author', 'Tags', 'CoverImage', 'IsPublished', 'Slug'];
    const $set    = { UpdatedAt: new Date().toISOString() };

    for (const key of allowed) {
      if (body[key] === undefined) continue;
      if (key === 'Tags') $set[key] = Array.isArray(body[key]) ? body[key] : [];
      else if (key === 'IsPublished') $set[key] = Boolean(body[key]);
      else $set[key] = body[key];
    }

    const id = req.params.id;
    const result = await blogCol.findOneAndUpdate(
      { $or: [{ BlogId: id }, { Slug: id }] },
      { $set },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Blog not found' });
    const { _id, ...updated } = result;
    res.json({ success: true, blog: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// DELETE /blogs/:id
app.delete('/blogs/:id', async (req, res) => {
  try {
    const id     = req.params.id;
    const result = await blogCol.deleteOne({ $or: [{ BlogId: id }, { Slug: id }] });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Blog not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
//  UPLOAD  (shared image upload endpoint)
// ════════════════════════════════════════════════════════════════════════════

app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.image) return res.status(400).json({ error: 'No file uploaded' });
    const file      = req.files.image;
    const uploadDir = path.resolve(__dirname, '../my-app/public/assets/roofiimages/Images');
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const name = `${Date.now()}-${file.name}`.replace(/\s+/g, '_');
    const dest = path.join(uploadDir, name);
    file.mv(dest, (err) => {
      if (err) { console.error(err); return res.status(500).json({ error: 'Failed to save file' }); }
      res.json({ success: true, path: `assets/roofiimages/Images/${name}` });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
//  USERS  (MongoDB collection: Users)
// ════════════════════════════════════════════════════════════════════════════

// GET /users
app.get('/users', async (req, res) => {
  try {
    const docs = await userCol.find({}).sort({ CreatedAt: -1 }).toArray();
    res.json({ users: docs.map(mapUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// GET /users/:id
app.get('/users/:id', async (req, res) => {
  try {
    const id  = String(req.params.id);
    const filter = isValidObjectId(id)
      ? { $or: [{ UserId: id }, { _id: new ObjectId(id) }] }
      : { UserId: id };
    const doc = await userCol.findOne(filter);
    if (!doc) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user: mapUser(doc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load user' });
  }
});

// POST /users
app.post('/users', async (req, res) => {
  try {
    const body = req.body || {};
    const now  = new Date().toISOString();

    const email = (body.Email || body.email || '').toLowerCase();
    if (!email) return res.status(400).json({ error: 'Missing Email' });

    if (await userCol.findOne({ Email: email }))
      return res.status(409).json({ error: 'Email already exists' });

    const doc = {
      Email:       email,
      Password:    body.Password    || body.password    || '',
      DisplayName: body.DisplayName || body.fullname    || '',
      Role:        body.Role        || body.role        || 'user',
      Phone:       body.Phone       || body.phone       || '',
      AvatarUrl:   body.AvatarUrl   || body.avatarUrl   || '',
      Provider:    body.Provider    || body.provider    || 'email',
      IsActive:    body.IsActive !== undefined ? Boolean(body.IsActive) : true,
      CreatedAt:   now,
      UpdatedAt:   now,
    };

    const insertResult = await userCol.insertOne(doc);

    // Auto-generate UserId if not provided
    if (!doc.UserId) {
      const generatedId = `USR_${insertResult.insertedId.toString().slice(-8).toUpperCase()}`;
      await userCol.updateOne({ _id: insertResult.insertedId }, { $set: { UserId: generatedId } });
      doc.UserId = generatedId;
    }

    res.status(201).json({ success: true, user: mapUser({ _id: insertResult.insertedId, ...doc }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT /users/:id
app.put('/users/:id', async (req, res) => {
  try {
    const body    = req.body || {};
    const allowed = ['DisplayName', 'Email', 'Password', 'Role', 'Phone', 'IsActive', 'AvatarUrl', 'Provider'];
    const $set    = { UpdatedAt: new Date().toISOString() };

    for (const key of allowed) {
      if (body[key] === undefined) continue;
      if (key === 'Email') $set[key] = String(body[key] || body.email || '').toLowerCase();
      else if (key === 'DisplayName' && body[key] === undefined && body.fullname !== undefined) $set[key] = body.fullname;
      else if (key === 'Role' && body[key] === undefined && body.role !== undefined) $set[key] = body.role;
      else if (key === 'IsActive') $set[key] = !!body[key];
      else if (key === 'AvatarUrl' && body[key] === undefined && body.avatarUrl !== undefined) $set[key] = body.avatarUrl;
      else if (key === 'Provider' && body[key] === undefined && body.provider !== undefined) $set[key] = body.provider;
      else $set[key] = body[key];
    }

    const id = String(req.params.id);
    const filter = isValidObjectId(id)
      ? { $or: [{ UserId: id }, { _id: new ObjectId(id) }] }
      : { UserId: id };

    const result = await userCol.findOneAndUpdate(filter, { $set }, { returnDocument: 'after' });
    if (!result) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true, user: mapUser(result) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// POST /users/upload-avatar
app.post('/users/upload-avatar', async (req, res) => {
  try {
    if (!req.files || !req.files.file) return res.status(400).json({ error: 'No file uploaded' });
    const file      = req.files.file;
    const uploadDir = path.resolve(__dirname, '../my-app/public/assets/roofiimages/Avatars');
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const name = `${Date.now()}-${file.name}`.replace(/\s+/g, '_');
    const dest = path.join(uploadDir, name);
    file.mv(dest, (err) => {
      if (err) { console.error(err); return res.status(500).json({ error: 'Failed to save file' }); }
      res.json({ success: true, path: `assets/roofiimages/Avatars/${name}` });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// DELETE /users/:id
app.delete('/users/:id', async (req, res) => {
  try {
    const id = String(req.params.id);
    const filter = isValidObjectId(id)
      ? { $or: [{ UserId: id }, { _id: new ObjectId(id) }] }
      : { UserId: id };

    const result = await userCol.deleteOne(filter);
    if (result.deletedCount === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
//  ORDERS  (MongoDB collection: Orders)
// ════════════════════════════════════════════════════════════════════════════

const ORDER_STATUSES = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

function mapOrder(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
}

// GET /orders
app.get('/orders', async (req, res) => {
  try {
    const { status, userId, email } = req.query;
    const filter = {};
    if (status) filter.Status = status;
    if (userId) filter.UserId = userId;
    if (email)  filter.Email  = email.toLowerCase();

    const docs = await orderCol.find(filter).sort({ CreatedAt: -1 }).toArray();
    res.json({ data: docs.map(mapOrder) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

// GET /orders/:id
app.get('/orders/:id', async (req, res) => {
  try {
    const id  = String(req.params.id);
    const doc = await orderCol.findOne({ OrderId: id });
    if (!doc) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order: mapOrder(doc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load order' });
  }
});

// POST /orders
app.post('/orders', async (req, res) => {
  try {
    const body = req.body || {};
    const now  = new Date().toISOString();

    const email = (body.Email || body.email || '').toLowerCase();
    if (!email) return res.status(400).json({ error: 'Missing Email' });
    if (!Array.isArray(body.Items) || body.Items.length === 0)
      return res.status(400).json({ error: 'Missing Items' });

    const orderId = body.OrderId || `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const doc = {
      OrderId:         orderId,
      UserId:          body.UserId    || body.userId    || '',
      Email:           email,
      FullName:        body.FullName  || body.fullName  || '',
      Phone:           body.Phone     || body.phone     || '',
      ShippingAddress: body.ShippingAddress || body.shippingAddress || '',
      Items:           body.Items,
      SubTotal:        Number(body.SubTotal   || body.subTotal   || 0),
      Discount:        Number(body.Discount   || body.discount   || 0),
      ShippingFee:     Number(body.ShippingFee || body.shippingFee || 0),
      TotalAmount:     Number(body.TotalAmount || body.totalAmount || 0),
      PaymentMethod:   body.PaymentMethod || body.paymentMethod || 'cod',
      Status:          'pending',
      Note:            body.Note || body.note || '',
      CreatedAt:       now,
      UpdatedAt:       now,
    };

    await orderCol.insertOne(doc);
    res.status(201).json({ success: true, order: mapOrder({ ...doc }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /orders/:id
app.put('/orders/:id', async (req, res) => {
  try {
    const body    = req.body || {};
    const allowed = ['Status', 'Note', 'FullName', 'Phone', 'ShippingAddress', 'PaymentMethod'];
    const $set    = { UpdatedAt: new Date().toISOString() };

    for (const key of allowed) {
      const val = body[key] ?? body[key.charAt(0).toLowerCase() + key.slice(1)];
      if (val === undefined) continue;
      if (key === 'Status') {
        if (!ORDER_STATUSES.includes(val))
          return res.status(400).json({ error: `Invalid status. Allowed: ${ORDER_STATUSES.join(', ')}` });
        $set[key] = val;
      } else {
        $set[key] = val;
      }
    }

    const result = await orderCol.findOneAndUpdate(
      { OrderId: req.params.id },
      { $set },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order: mapOrder(result) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /orders/:id
app.delete('/orders/:id', async (req, res) => {
  try {
    const result = await orderCol.deleteOne({ OrderId: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});