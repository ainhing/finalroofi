const express    = require('express');
const app        = express();
const port       = 3003;
const morgan     = require('morgan');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');
const fileUpload = require('express-fileupload');
const { connectDB } = require('./db');

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload());

// ── Static files — serve uploaded images ─────────────────────────────────────
app.use(express.static(path.resolve(__dirname, '../my-app/public')));

app.get('/', (req, res) => res.send('Roofi API - MongoDB'));

// ── Routers ──────────────────────────────────────────────────────────────────
const productsRouter = require('./routes/products');
const blogsRouter    = require('./routes/blogs');
const usersRouter    = require('./routes/users');
const ordersRouter   = require('./routes/orders');
const reviewsRouter  = require('./routes/reviews');
const uploadRouter   = require('./routes/upload');

app.use('/products', productsRouter);
app.use('/blogs', blogsRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);
app.use('/reviews', reviewsRouter);
app.use(uploadRouter); // Generic root /upload endpoint

// ── Connect DB & Start Server ────────────────────────────────────────────────
connectDB()
  .then(() => app.listen(port, () => console.log(`Server listening on port ${port}`)))
  .catch(err => { 
    console.error('MongoDB connection failed:', err); 
    process.exit(1); 
  });
