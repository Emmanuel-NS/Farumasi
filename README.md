# Farumasi Pharmacy Platform

Farumasi is a full-stack web application for medicine ordering, prescription management, pharmacy administration, and real-time delivery tracking. It connects users with nearby pharmacies, supports both manual and prescription-based orders, and includes admin controls for pharmacy/product/order/customer management.

---

## 🚀 Tech Stack

| Layer      | Technology         |
|------------|-------------------|
| Frontend   | React, Tailwind CSS, Chart.js, React-Leaflet |
| Backend    | Node.js, Express, SQLite3, Multer, Axios     |
| Auth       | JWT (JSON Web Token)                         |
| Payment    | MTN MoMo API                                 |

---

## 📦 Features

- 🌍 Location-aware pharmacy assignment
- 📋 Prescription-based or manual product ordering
- 📄 File uploads (prescriptions)
- 🧾 Insurance-based discounts
- 📱 MoMo payment API integration
- 👨‍⚕️ Admin review for prescription orders
- 🏥 Pharmacy/product/order/customer management (admin)
- 📊 Modern dashboard with statistics and charts
- 📍 Real-time delivery tracking (map)
- Responsive UI for desktop and mobile

---

## 🗂️ Project Structure

```
Farumasi/
├── Backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   ├── pharmacy.db
│   ├── API_Documentation.md
│   ├── README.md
│   └── .env
├── farumasi-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── README.md
│   └── .env
```

---

## 🛠️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/farumasi.git
cd Farumasi
```

### 2. Backend Setup

```bash
cd Backend
npm install
# Create .env file with required environment variables (see below)
node server.js
```

#### .env Example (Backend)

```
PORT=5000
DB_PATH=./pharmacy.db
MOMO_BASE_URL=...
MOMO_SUBSCRIPTION_KEY=...
MOMO_TARGET_ENV=...
MOMO_API_USER=...
MOMO_API_KEY=...
JWT_SECRET=your_jwt_secret
```

### 3. Frontend Setup

```bash
cd farumasi-frontend
npm install
npm start
```

#### .env Example (Frontend)

```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🧑‍💻 Usage

- **User:** Register, login, browse products, upload prescription, place orders, track orders, manage profile.
- **Admin:** Login, manage pharmacies/products/orders/customers, review prescriptions, view dashboard statistics, track deliveries.

---

## 📡 API Overview

See [`Backend/API_Documentation.md`](../Backend/API_Documentation.md) for full details.

### Main Endpoints

- `/api/auth` - User registration, login, location update
- `/api/pharmacies` - Pharmacy CRUD
- `/api/products` - Product CRUD
- `/api/orders` - Order CRUD, prescription review
- `/api/locations` - Get/update user/pharmacy locations
- `/api/payment` - MoMo payment integration

---

## 🖥️ Frontend Overview

- **React SPA** with routing (`react-router-dom`)
- **Tailwind CSS** for modern UI
- **Chart.js** for dashboard statistics
- **React-Leaflet** for map tracking
- **Responsive design** for all devices

### Main Pages

- Home
- Login/Register
- User Dashboard
- User Orders & Tracking
- Admin Dashboard
- Pharmacy/Product/Order/Customer Management
- Help

---

## 📊 Dashboard Features

- **Statistics Cards:** Total pharmacies, products, orders, customers
- **Charts:** Orders per month, products per pharmacy
- **Quick Actions:** Register pharmacy, manage products, review prescriptions
- **Recent Orders:** Latest order details and status
- **Management Cards:** Pharmacy, product, order management

---

## 📍 Delivery Tracking

- Real-time map showing pickup (pharmacy) and destination (customer) locations for active deliveries.
- Only pharmacy and customer markers are shown.

---

## 🧾 Prescription & Insurance

- Users can upload prescription files (jpg, png, pdf).
- Insurance provider selection during order.
- Admin reviews prescription orders and assigns products/insurance.

---

## 💰 Payment Integration

- MTN MoMo API for mobile payments.
- Payment status tracking.

---

## 🛡️ Admin Controls

- Register and manage pharmacies/products/orders/customers.
- Review and approve prescription orders.
- Update insurance and order status.
- View platform statistics and performance.

---

## 🧪 Testing

- Use Postman for API endpoint testing.
- Run frontend in development mode for UI testing.

---

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a pull request

---

## 📄 License

MIT License

---

## 📞 Support

For issues or feature requests, open a GitHub issue or contact the maintainer.

---

## 📚 Learn More

- [React Documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [React-Leaflet](https://react-leaflet.js.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)