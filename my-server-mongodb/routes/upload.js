const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// POST /upload (Note path relative change: ../../)
router.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.image) return res.status(400).json({ error: 'No file uploaded' });
    const file      = req.files.image;
    const uploadDir = path.resolve(__dirname, '../../my-app/public/assets/roofiimages/Images');
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

module.exports = router;
