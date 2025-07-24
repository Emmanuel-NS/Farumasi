# Farumasi Pharmacy Platform – Final Project Report

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Technical Specifications](#technical-specifications)
- [API Documentation](#api-documentation)
- [User Manual](#user-manual)
- [Setup Instructions](#setup-instructions)
- [Project Journey](#project-journey)
- [Team Roles & Participation](#team-roles--participation)
- [Challenges & Solutions](#challenges--solutions)
- [Future Work & Lessons Learned](#future-work--lessons-learned)
- [GitHub Repository](#github-repository)
- [Demo Video](#demo-video)
- [License & Support](#license--support)

---

## Project Overview

Farumasi is a full-stack web platform for pharmacy management, medicine ordering, prescription review, and real-time delivery tracking. It connects users with nearby pharmacies, supports both manual and prescription-based orders, and provides robust admin controls for pharmacy, product, order, and customer management.

---

## System Architecture

### Diagram

```
[ User (Web) ] <---> [ React Frontend ] <---> [ Express Backend API ] <---> [ SQLite DB ]
                                         |                             |
                                         |                             |
                                  [ MoMo Payment API ]         [ File Uploads ]
```

- **Frontend:** React SPA (Single Page Application) with Tailwind CSS for styling, Chart.js for statistics, and React-Leaflet for maps.
- **Backend:** Node.js/Express REST API, SQLite3 database, Multer for file uploads, JWT for authentication, and integration with MTN MoMo payment API.

---

## Technical Specifications

- **Frontend:** React, Tailwind CSS, Chart.js, React-Leaflet, Axios, React Router
- **Backend:** Node.js, Express, SQLite3, Multer, JWT, Axios
- **Authentication:** JWT-based
- **Payment:** MTN MoMo API
- **Deployment:** Local (can be deployed to cloud platforms)
- **Testing:** Manual (Postman for API, browser for UI)

---

## API Documentation

See [`Backend/API_Documentation.md`](Backend/API_Documentation.md) for full details.

### Main Endpoints

- `/api/auth` – User registration, login, location update
- `/api/pharmacies` – Pharmacy CRUD
- `/api/products` – Product CRUD
- `/api/orders` – Order CRUD, prescription review
- `/api/locations` – Get/update user/pharmacy locations
- `/api/payment` – MoMo payment integration

---

## User Manual

### User Features

1. **Register/Login:** Create an account or log in.
2. **Browse Products:** View available medicines and products.
3. **Order:** Place orders manually or upload a prescription.
4. **Insurance:** Select insurance provider for discounts.
5. **Track Orders:** View order status and delivery tracking on map.
6. **Profile:** Update personal info and location.

### Admin Features

1. **Dashboard:** View statistics, charts, and recent orders.
2. **Pharmacy Management:** Register, update, and manage pharmacies.
3. **Product Management:** Add, update, and manage products.
4. **Order Management:** Track, update, and review orders/prescriptions.
5. **Customer Management:** View and manage customer profiles.
6. **Delivery Tracking:** See real-time map of active deliveries.

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/farumasi.git
cd Farumasi
```

### 2. Backend Setup

```bash
cd Backend
npm install
# Create .env file with required environment variables (see README)
node server.js
```

### 3. Frontend Setup

```bash
cd farumasi-frontend
npm install
npm start
```

### 4. Environment Variables

See README files in both Backend and Frontend folders for `.env` examples.

---

## Project Journey

- **Inception:** Identified the need for a digital pharmacy platform with delivery and prescription review.
- **Milestones:**
  - Database schema design and API scaffolding
  - User authentication and pharmacy CRUD
  - Product and order management
  - Prescription upload and review workflow
  - MoMo payment integration
  - Real-time delivery tracking with maps
  - Admin dashboard with statistics and charts
- **Final Solution:** A robust, user-friendly platform for pharmacy management and medicine delivery.

---

## Team Roles & Participation

- **Frontend Lead:** UI/UX design, React components, dashboard, charts, map integration.
- **Backend Lead:** API design, database schema, authentication, payment integration.
- **Full Stack Developer:** Bridged frontend and backend, handled deployment, testing, and bug fixes.
- **Project Manager:** Coordinated tasks, managed GitHub issues/PRs, ensured documentation and deadlines.

All team members contributed via GitHub with regular commits, code reviews, and issue tracking.

---

## Challenges & Solutions

- **Challenge:** Integrating MoMo payment API.
  - **Solution:** Used Axios for API calls, handled asynchronous payment status updates.
- **Challenge:** Real-time delivery tracking.
  - **Solution:** Used React-Leaflet for map rendering, optimized marker updates.
- **Challenge:** Prescription file uploads and review.
  - **Solution:** Used Multer for backend file handling, created admin review workflow.
- **Challenge:** Responsive dashboard and statistics.
  - **Solution:** Used Tailwind CSS and Chart.js for modern, responsive UI.

---

## Future Work & Lessons Learned

### Future Enhancements

- Add SMS/email notifications for order status.
- Implement pharmacy rating/review system.
- Add support for multiple payment providers.
- Improve admin analytics (more charts, export data).
- Deploy to cloud (Heroku, Vercel, etc).

### Lessons Learned

- Importance of clear API documentation and modular code.
- Value of regular code reviews and GitHub collaboration.
- Handling real-world payment APIs and asynchronous flows.
- UI/UX matters for user engagement and admin efficiency.

---

## GitHub Repository

[Farumasi GitHub Repository](https://github.com/yourusername/farumasi)

---

## Demo Video

[Demo Video Link](https://your-demo-video-url.com)

---

## License & Support

MIT License

For issues or feature requests, open a GitHub issue or contact the maintainer.