const express = require('express');
const router = express.Router();
const { getCollections } = require('../db');

// GET /products
router.get('/', async (req, res) => {
  try {
    const { productCol } = getCollections();
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
router.get('/:id', async (req, res) => {
  try {
    const { productCol } = getCollections();
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
router.post('/', async (req, res) => {
  try {
    const { productCol } = getCollections();
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
router.put('/:id', async (req, res) => {
  try {
    const { productCol } = getCollections();
    const body    = req.body || {};
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
router.delete('/:id', async (req, res) => {
  try {
    const { productCol } = getCollections();
    const result = await productCol.deleteOne({ ProductId: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
