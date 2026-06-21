const express = require('express');
const router = express.Router();
const { getCollections } = require('../db');
const { stripMongoId, toSlug } = require('../utils');

// GET /blogs
router.get('/', async (req, res) => {
  try {
    const { blogCol } = getCollections();
    const docs = await blogCol.find({}).sort({ CreatedAt: -1 }).toArray();
    res.json({ data: docs.map(stripMongoId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load blogs' });
  }
});

// GET /blogs/:id
router.get('/:id', async (req, res) => {
  try {
    const { blogCol } = getCollections();
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
router.post('/', async (req, res) => {
  try {
    const { blogCol } = getCollections();
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
router.put('/:id', async (req, res) => {
  try {
    const { blogCol } = getCollections();
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
router.delete('/:id', async (req, res) => {
  try {
    const { blogCol } = getCollections();
    const id     = req.params.id;
    const result = await blogCol.deleteOne({ $or: [{ BlogId: id }, { Slug: id }] });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Blog not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

module.exports = router;
