const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const locationRoutes = require('./routes/locationRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');

const app = express();
dotenv.config();
app.use(cors({
  origin: 'https://your-vercel-frontend-url.vercel.app',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/delivery', deliveryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));