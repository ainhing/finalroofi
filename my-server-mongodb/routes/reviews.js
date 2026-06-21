const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getCollections } = require('../db');
const { isValidObjectId } = require('../utils');

// Helper specific to reviews since mapReview was defined in original index.js.
// We also defined mapReview in utils.js? Wait, did we?
// Let's check: we exported stripMongoId, mapUser, isValidObjectId, toSlug.
// But we didn't export mapReview from utils.js!
// Let's write mapReview right here in reviews.js or write it in utils.js.
// Since it's only used for reviews, writing it right here is very clean.
function mapReview(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  rest.id = String(_id);
  return rest;
}

// GET /reviews
router.get('/', async (req, res) => {
  try {
    const { reviewCol } = getCollections();
    const { productName, productId, isApproved } = req.query;
    const filter = {};
    if (productName) filter.productName = productName;
    if (productId) filter.productId = productId;
    if (isApproved !== undefined) {
      const value = String(isApproved).toLowerCase();
      filter.isApproved = value === 'true' || value === '1' || value === 'yes';
    }

    const docs = await reviewCol.find(filter).sort({ createdAt: -1 }).toArray();
    res.json(docs.map(mapReview));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load reviews' });
  }
});

// POST /reviews
router.post('/', async (req, res) => {
  try {
    const { reviewCol } = getCollections();
    const body = req.body || {};
    const now  = new Date().toISOString();

    const doc = {
      productName: body.productName || '',
      productId:   body.productId   || '',
      userName:    body.userName    || 'Anonymous',
      rating:      Number(body.rating || 0),
      comment:     body.comment     || '',
      date:        body.date        || now,
      imageUrls:   Array.isArray(body.imageUrls) ? body.imageUrls : [],
      isApproved:  body.isApproved !== undefined ? !!body.isApproved : true,
      createdAt:   now,
      updatedAt:   now,
    };

    const result = await reviewCol.insertOne(doc);
    res.status(201).json({ success: true, review: mapReview({ _id: result.insertedId, ...doc }) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// PUT /reviews/:id
router.put('/:id', async (req, res) => {
  try {
    const { reviewCol } = getCollections();
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid review id' });

    const body = req.body || {};
    const updateFields = {};
    const allowed = ['productName', 'productId', 'userName', 'rating', 'comment', 'date', 'imageUrls', 'isApproved'];

    for (const key of allowed) {
      if (body[key] === undefined) continue;
      if (key === 'rating') updateFields[key] = Number(body[key]);
      else if (key === 'imageUrls') updateFields[key] = Array.isArray(body[key]) ? body[key] : [];
      else if (key === 'isApproved') updateFields[key] = Boolean(body[key]);
      else updateFields[key] = body[key];
    }

    updateFields.updatedAt = new Date().toISOString();

    const result = await reviewCol.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    // Original code checks result.value or result based on mongodb version.
    // In mongodb v5/v6, findOneAndUpdate returns the document directly if returnDocument: 'after' is passed.
    // Let's verify how index.js did it:
    // 764:     if (!result.value) return res.status(404).json({ error: 'Review not found' });
    // 765:     res.json({ success: true, review: mapReview(result.value) });
    // Wait, let's keep the check clean and robust by checking both:
    const doc = result.value !== undefined ? result.value : result;
    if (!doc) return res.status(404).json({ error: 'Review not found' });
    res.json({ success: true, review: mapReview(doc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE /reviews/:id
router.delete('/:id', async (req, res) => {
  try {
    const { reviewCol } = getCollections();
    const id = req.params.id;
    if (!isValidObjectId(id)) return res.status(400).json({ error: 'Invalid review id' });

    const result = await reviewCol.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Review not found' });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;
