const express = require('express');
const router = express.Router();
const { getCollections } = require('../db');

const ORDER_STATUSES = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

function mapOrder(doc) {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
}

// GET /orders
router.get('/', async (req, res) => {
  try {
    const { orderCol } = getCollections();
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
router.get('/:id', async (req, res) => {
  try {
    const { orderCol } = getCollections();
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
router.post('/', async (req, res) => {
  try {
    const { orderCol } = getCollections();
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
router.put('/:id', async (req, res) => {
  try {
    const { orderCol } = getCollections();
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
router.delete('/:id', async (req, res) => {
  try {
    const { orderCol } = getCollections();
    const result = await orderCol.deleteOne({ OrderId: req.params.id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
