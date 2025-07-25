# Final Project Report: Farumasi Pharmacy Platform

## Table of Contents
- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Technical Specifications](#technical-specifications)
- [API Documentation](#api-documentation)
- [User Manual](#user-manual)
- [Setup Instructions](#setup-instructions)
- [Deployment](#deployment)
- [Project Journey](#project-journey)
- [Team Roles & Participation](#team-roles--participation)
- [Challenges & Solutions](#challenges--solutions)
- [Future Work & Lessons Learned](#future-work--lessons-learned)
- [GitHub Repository](#github-repository)
- [Demo Video](#demo-video)
- [License & Support](#license--support)

---

## Project Overview
Farumasi is a full-stack web application designed for pharmacy management, medicine ordering, prescription review, and real-time delivery tracking. It connects users with nearby pharmacies, supports both manual and prescription-based orders, and includes robust admin controls for managing pharmacies, products, orders, and customers.

---

## System Architecture
### Diagram
```
[ User (Web) ] <---> [ React Frontend ] <---> [ Express Backend API ] <---> [ SQLite DB ]
                                         |                             |
                                         |                             |
                                  [ MoMo Payment API ]         [ File Uploads ]
```
- **Frontend:** Built with React, utilizing Tailwind CSS for styling, Chart.js for statistics, and React-Leaflet for mapping functionalities.
- **Backend:** Developed using Node.js with Express, SQLite3 for database management, and Multer for handling file uploads. JWT is used for authentication, and the MTN MoMo payment API is integrated for payment processing.

---

## Technical Specifications
- **Frontend Technologies:**
  - React
  - Tailwind CSS
  - Chart.js
  - React-Leaflet
  - Axios
  - React Router

- **Backend Technologies:**
  - Node.js
  - Express
  - SQLite3
  - Multer
  - JWT (JSON Web Token)
  - Axios

- **Deployment:** The application can be deployed on cloud platforms such as Heroku or Vercel for frontend hosting.

---

## API Documentation
For detailed API documentation, refer to the [`API_Documentation.md`](API_Documentation.md) file included in the project. This document outlines the main endpoints, request formats, and expected responses for user authentication, product management, order processing, and payment integration.

### Main Endpoints
- **Authentication:** `/api/auth`
  - `POST /register` - User registration
  - `POST /login` - User login
- **Products:** `/api/products`
  - `POST /` - Add a new product
  - `GET /` - List all products
- **Orders:** `/api/orders`
  - `POST /` - Place a new order
  - `GET /` - Retrieve all orders
- **Pharmacies:** `/api/pharmacies`
  - `POST /` - Register a new pharmacy
  - `GET /` - List all pharmacies
- **Payment:** `/api/payment`
  - `POST /pay` - Initiate a payment

---

## User Manual
### User Features
1. **Register/Login:** Create an account or log in to the platform.
2. **Browse Products:** View available medicines and products.
3. **Order:** Place orders manually or by uploading a prescription.
4. **Insurance:** Select insurance providers for applicable discounts.
5. **Track Orders:** Monitor order status and delivery tracking on a map.
6. **Profile Management:** Update personal information and location.

### Admin Features
1. **Dashboard:** View statistics, charts, and recent orders.
2. **Pharmacy Management:** Register and manage pharmacies.
3. **Product Management:** Add and update products.
4. **Order Management:** Review and manage orders.
5. **Customer Management:** View and manage customer profiles.

---

## Setup Instructions
### 1. Clone the Repository
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
REACT_APP_API_URL=https://farumasi.onrender.com/api
```

---

## Deployment
### Hosting on Vercel
1. Create a Vercel account and link it to your GitHub repository.
2. Import the frontend project and set environment variables in Vercel's dashboard.
3. Deploy the project, and Vercel will provide a live URL.

### Hosting on Heroku
1. Create a Heroku account and install the Heroku CLI.
2. Login to your Heroku account via the CLI.
3. Create a new Heroku app and push the backend code:
```bash
heroku create your-app-name
git push heroku main
```
4. Set environment variables using the Heroku dashboard or CLI.

---

## Project Journey
### Inception
The project was initiated to address the need for a digital pharmacy platform that facilitates medicine ordering and delivery.

### Milestones
- Database schema design and API scaffolding.
- User authentication and pharmacy CRUD operations.
- Product and order management functionalities.
- Integration of prescription upload and review workflow.
- MoMo payment integration.
- Development of real-time delivery tracking with maps.
- Creation of an admin dashboard with statistics and charts.

### Final Solution
The project resulted in a robust, user-friendly platform for pharmacy management and medicine delivery.

---

## Team Roles & Participation
- **Frontend Lead:** Responsible for UI/UX design, React components, and dashboard implementation.
- **Backend Lead:** Managed API design, database schema, authentication, and payment integration.
- **Full Stack Developer:** Bridged frontend and backend, handled deployment, testing, and bug fixes.
- **Project Manager:** Coordinated tasks, managed GitHub issues/PRs, and ensured documentation and deadlines were met.

All team members contributed via GitHub with regular commits, code reviews, and issue tracking.

---

## Challenges & Solutions
### Challenges
1. **MoMo Payment API Integration:** Faced difficulties in integrating the payment API.
2. **Real-time Delivery Tracking:** Implementing live tracking features was complex.

### Solutions
- For the MoMo API, thorough documentation and community forums were utilized to resolve integration issues.
- The delivery tracking feature was implemented using React-Leaflet, which facilitated easy map integration.

---

## Future Work & Lessons Learned
### Future Enhancements
- Implement machine learning algorithms for personalized medicine recommendations.
- Expand the platform to include more pharmacies and products.
- Enhance user experience with additional features like user reviews and ratings.

### Lessons Learned
- The importance of thorough planning and documentation.
- Effective communication within the team is crucial for successful collaboration.
- Continuous testing and feedback loops improve product quality.

---

## GitHub Repository
[Farumasi GitHub Repository](https://github.com/yourusername/farumasi)

---

## Demo Video
A demo video showcasing the functionality of the Farumasi Pharmacy Platform is available [here](https://link-to-demo-video.com).

---

## License & Support
This project is licensed under the MIT License. For support, please contact the project team via GitHub.

--- 

This comprehensive report encapsulates the essential details of the Farumasi Pharmacy Platform, ensuring that any developer can understand, maintain, and extend the project effectively.