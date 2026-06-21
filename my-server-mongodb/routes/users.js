const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const { getCollections } = require('../db');
const { mapUser, isValidObjectId } = require('../utils');

// GET /users
router.get('/', async (req, res) => {
  try {
    const { userCol } = getCollections();
    const docs = await userCol.find({}).sort({ CreatedAt: -1 }).toArray();
    res.json({ users: docs.map(mapUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// POST /users/login
router.post('/login', async (req, res) => {
  try {
    const { userCol } = getCollections();
    const body = req.body || {};
    const email = (body.email || body.Email || '').toLowerCase();
    const password = body.password || body.Password || '';

    console.log(`[Login Attempt] Email: ${email}`);

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập Email và Mật khẩu' });
    }

    const user = await userCol.findOne({
      $or: [
        { Email: email, Password: password },
        { email: email, password: password }
      ]
    });

    if (!user) {
      console.log(`[Login Failed] Incorrect credentials for: ${email}`);
      return res.status(401).json({ success: false, error: 'Email hoặc Mật khẩu không đúng' });
    }

    const isActive = user.IsActive !== undefined ? user.IsActive : (user.isActive !== undefined ? user.isActive : true);
    if (!isActive) {
      return res.status(403).json({ success: false, error: 'Tài khoản của bạn đã bị khóa' });
    }

    console.log(`[Login Success] User: ${user.DisplayName || user.Email}`);
    res.json({ success: true, user: mapUser(user) });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ success: false, error: 'Lỗi hệ thống khi đăng nhập' });
  }
});

// GET /users/:id
router.get('/:id', async (req, res) => {
  try {
    const { userCol } = getCollections();
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
router.post('/', async (req, res) => {
  try {
    const { userCol } = getCollections();
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
router.put('/:id', async (req, res) => {
  try {
    const { userCol } = getCollections();
    const body    = req.body || {};
    const allowed = ['DisplayName', 'Email', 'Password', 'Role', 'Phone', 'IsActive', 'AvatarUrl', 'Provider', 'DateOfBirth', 'Gender'];
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

// POST /users/upload-avatar (Note path relative change: ../../)
router.post('/upload-avatar', async (req, res) => {
  try {
    if (!req.files || !req.files.file) return res.status(400).json({ error: 'No file uploaded' });
    const file      = req.files.file;
    const uploadDir = path.resolve(__dirname, '../../my-app/public/assets/roofiimages/Avatars');
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
router.delete('/:id', async (req, res) => {
  try {
    const { userCol } = getCollections();
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

module.exports = router;
