# Farumasi - Final Project Report

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technical Specifications](#technical-specifications)
4. [Project Journey and Development Timeline](#project-journey-and-development-timeline)
5. [Team Roles and Contributions](#team-roles-and-contributions)
6. [Challenges and Solutions](#challenges-and-solutions)
7. [User Manual](#user-manual)
8. [Setup Instructions](#setup-instructions)
9. [API Documentation](#api-documentation)
10. [Code Quality and GitHub Repository Management](#code-quality-and-github-repository-management)
11. [Future Work and Enhancements](#future-work-and-enhancements)
12. [Lessons Learned](#lessons-learned)
13. [Conclusion](#conclusion)

---

## Project Overview

**Farumasi** is a comprehensive full-stack web application designed to revolutionize medicine ordering and pharmacy management. The platform serves as a bridge between patients, pharmacies, and healthcare providers, enabling efficient prescription management, real-time delivery tracking, and streamlined administrative operations.

### Key Objectives
- Simplify medicine ordering through both manual selection and prescription uploads
- Connect users with nearby pharmacies using location-aware services
- Provide comprehensive admin tools for pharmacy, product, order, and customer management
- Enable secure payment processing through MTN MoMo API integration
- Offer real-time delivery tracking with interactive maps

### Target Users
- **End Users**: Patients seeking convenient medicine ordering and prescription management
- **Pharmacies**: Healthcare providers needing efficient order and inventory management
- **Administrators**: System managers overseeing platform operations and analytics

---

## System Architecture

### High-Level Architecture

The Farumasi system follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React SPA)   │◄──►│   (Node.js +    │◄──►│    (SQLite3)    │
│                 │    │    Express)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  UI Components  │    │   API Routes    │    │   Data Models   │
│  - Pages        │    │   - Auth        │    │   - Users       │
│  - Components   │    │   - Pharmacies  │    │   - Pharmacies  │
│  - Routing      │    │   - Products    │    │   - Products    │
│                 │    │   - Orders      │    │   - Orders      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Interaction Flow

1. **User Authentication**: JWT-based authentication system manages user sessions
2. **Location Services**: GPS integration for pharmacy proximity calculations
3. **File Upload System**: Multer handles prescription image/PDF uploads
4. **Payment Processing**: MTN MoMo API integration for secure transactions
5. **Real-time Tracking**: React-Leaflet provides interactive delivery maps

---

## Technical Specifications

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18+ | Modern, component-based UI framework |
| | Tailwind CSS | Utility-first CSS framework for responsive design |
| | Chart.js | Data visualization for admin dashboard |
| | React-Leaflet | Interactive maps for delivery tracking |
| | React Router DOM | Client-side routing |
| **Backend** | Node.js | JavaScript runtime environment |
| | Express.js | Web application framework |
| | SQLite3 | Lightweight, embedded database |
| | Multer | File upload middleware |
| | Axios | HTTP client for API requests |
| **Authentication** | JWT | Secure token-based authentication |
| **Payment** | MTN MoMo API | Mobile money payment integration |
| **Development** | npm | Package management |
| | Git | Version control |

### Dependencies and Libraries

**Backend Dependencies:**
- express: Web framework
- sqlite3: Database driver
- jsonwebtoken: JWT implementation
- bcryptjs: Password hashing
- multer: File upload handling
- cors: Cross-origin resource sharing
- dotenv: Environment variable management

**Frontend Dependencies:**
- react: UI library
- tailwindcss: CSS framework
- chart.js: Data visualization
- react-leaflet: Map integration
- axios: HTTP client
- react-router-dom: Client-side routing

### Database Schema

The SQLite database includes the following key tables:
- **users**: User authentication and profile data
- **pharmacies**: Pharmacy information and locations
- **products**: Medicine catalog and inventory
- **orders**: Order tracking and status management
- **prescriptions**: Uploaded prescription files and reviews

---

## Project Journey and Development Timeline

### Phase 1: Project Inception and Planning
**Duration**: Initial 2 weeks
- Conducted market research on existing pharmacy applications
- Defined user requirements and system specifications
- Created wireframes and system design documents
- Set up development environment and project repository

### Phase 2: Backend Development
**Duration**: 4 weeks
- Implemented RESTful API architecture
- Developed user authentication system with JWT
- Created database models and relationships
- Integrated file upload functionality for prescriptions
- Implemented location-based pharmacy assignment logic

### Phase 3: Frontend Development
**Duration**: 4 weeks
- Built responsive React components using Tailwind CSS
- Implemented user registration and login flows
- Created admin dashboard with statistics and charts
- Developed order management and tracking interfaces
- Integrated real-time maps for delivery tracking

### Phase 4: Integration and Payment System
**Duration**: 2 weeks
- Connected frontend and backend through API integration
- Implemented MTN MoMo payment gateway
- Added prescription review workflow for admins
- Integrated insurance-based discount calculations

### Phase 5: Testing and Deployment
**Duration**: 2 weeks
- Conducted comprehensive testing of all features
- Fixed bugs and optimized performance
- Deployed backend to cloud hosting platform
- Set up continuous integration and deployment

---

## Team Roles and Contributions

### Emmanuel NS - Full Stack Developer & Project Lead
**Primary Responsibilities:**
- Overall project architecture and system design
- Backend API development and database design
- Frontend React component development
- Payment system integration (MTN MoMo API)
- Project documentation and GitHub repository management

**Key Contributions:**
- Designed and implemented the complete RESTful API
- Created responsive UI components with Tailwind CSS
- Developed the admin dashboard with real-time statistics
- Implemented file upload system for prescription management
- Set up deployment pipeline and production environment

**Technical Achievements:**
- Successfully integrated location-based pharmacy assignment
- Implemented secure JWT authentication system
- Created interactive delivery tracking with React-Leaflet
- Optimized database queries for improved performance

---

## Challenges and Solutions

### Challenge 1: Location-Based Pharmacy Assignment
**Problem**: Efficiently matching users with nearby pharmacies based on GPS coordinates while ensuring medication availability.

**Solution**: 
- Implemented Haversine formula for distance calculations
- Created pharmacy availability checking before assignment
- Added fallback mechanisms for cases with no nearby pharmacies
- Optimized database queries with spatial indexing

### Challenge 2: File Upload and Prescription Management
**Problem**: Handling various file formats (JPG, PNG, PDF) for prescription uploads while maintaining security.

**Solution**:
- Used Multer middleware with file type validation
- Implemented file size limits and secure storage
- Created admin review workflow for prescription verification
- Added error handling for unsupported file formats

### Challenge 3: Payment Integration
**Problem**: Integrating MTN MoMo API with varying response formats and handling payment failures.

**Solution**:
- Implemented robust error handling and retry mechanisms
- Created payment status tracking system
- Added webhook endpoints for payment confirmations
- Developed fallback payment methods for system reliability

### Challenge 4: Real-time Order Tracking
**Problem**: Providing users with accurate, real-time delivery status updates.

**Solution**:
- Integrated React-Leaflet for interactive map displays
- Implemented status update system with timestamps
- Created responsive mobile-friendly tracking interface
- Added push notification system for status changes

### Challenge 5: Admin Dashboard Performance
**Problem**: Loading large datasets efficiently for statistics and management interfaces.

**Solution**:
- Implemented pagination for large data sets
- Added caching mechanisms for frequently accessed data
- Optimized database queries with proper indexing
- Created lazy loading for dashboard components

---

## User Manual

### For End Users

#### Getting Started
1. **Registration**
   - Visit the Farumasi homepage
   - Click "Register" and fill in required details
   - Verify your email address
   - Set your location for pharmacy proximity

2. **Placing Orders**
   - **Manual Order**: Browse available products and add to cart
   - **Prescription Order**: Upload prescription image/PDF and wait for admin review
   - Select insurance provider for applicable discounts
   - Choose payment method and complete transaction

3. **Tracking Orders**
   - Access "My Orders" from user dashboard
   - View real-time delivery status
   - Track delivery progress on interactive map
   - Receive notifications for status updates

#### Key Features
- **Profile Management**: Update personal information and location
- **Order History**: View past orders and reorder medications
- **Insurance Integration**: Apply insurance discounts automatically
- **Prescription Storage**: Save uploaded prescriptions for future reference

### For Administrators

#### Admin Dashboard Access
1. Login with admin credentials
2. Access comprehensive statistics including:
   - Total pharmacies, products, orders, and customers
   - Monthly order trends and pharmacy performance
   - Recent order activities and pending reviews

#### Management Functions
1. **Pharmacy Management**
   - Register new pharmacies
   - Update pharmacy information and locations
   - Manage pharmacy product inventory

2. **Product Management**
   - Add new medications to catalog
   - Update product information and pricing
   - Monitor product availability across pharmacies

3. **Order Management**
   - Review and approve prescription orders
   - Update order status and delivery information
   - Handle customer service inquiries

4. **Customer Management**
   - View customer profiles and order history
   - Handle account issues and support requests
   - Monitor user activity and engagement

---

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Backend Setup
1. **Clone Repository**
   ```bash
   git clone https://github.com/Emmanuel-NS/Farumasi.git
   cd Farumasi/Backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file with the following variables:
   ```
   PORT=5000
   DB_PATH=./pharmacy.db
   MOMO_BASE_URL=your_momo_base_url
   MOMO_SUBSCRIPTION_KEY=your_subscription_key
   MOMO_TARGET_ENV=sandbox_or_production
   MOMO_API_USER=your_api_user
   MOMO_API_KEY=your_api_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Start Backend Server**
   ```bash
   node server.js
   ```

### Frontend Setup
1. **Navigate to Frontend Directory**
   ```bash
   cd ../farumasi-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

### Production Deployment
- Backend is deployed on Render.com
- Frontend can be deployed on Netlify or Vercel
- Update `REACT_APP_API_URL` to production backend URL

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "phone": "string",
  "location": {
    "latitude": "number",
    "longitude": "number"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  }
}
```

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

### Pharmacy Endpoints

#### GET /api/pharmacies
Retrieve list of pharmacies with optional location filtering.

**Query Parameters:**
- `lat`: User latitude
- `lng`: User longitude
- `radius`: Search radius in kilometers

#### POST /api/pharmacies (Admin only)
Register a new pharmacy.

### Product Endpoints

#### GET /api/products
Retrieve available products with pagination and filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `category`: Product category
- `search`: Product name search

#### POST /api/products (Admin only)
Add new product to catalog.

### Order Endpoints

#### POST /api/orders
Create a new order (manual or prescription-based).

#### GET /api/orders/:id
Retrieve specific order details and tracking information.

#### PUT /api/orders/:id/status (Admin only)
Update order status for delivery tracking.

### Payment Endpoints

#### POST /api/payment/momo
Process MTN MoMo payment for order.

**Request Body:**
```json
{
  "orderId": "number",
  "amount": "number",
  "phone": "string"
}
```

---

## Code Quality and GitHub Repository Management

### Code Quality Standards

#### Backend Code Quality
- **Clean Architecture**: Follows MVC pattern with clear separation of concerns
- **Error Handling**: Comprehensive try-catch blocks and error middleware
- **Code Comments**: Well-documented functions and complex logic
- **Naming Conventions**: Descriptive variable and function names
- **DRY Principle**: Reusable utility functions and middleware

#### Frontend Code Quality
- **Component Structure**: Modular, reusable React components
- **State Management**: Proper use of React hooks and state management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Code Splitting**: Lazy loading for improved performance
- **TypeScript Ready**: Structured for easy TypeScript migration

### Repository Management

#### Folder Structure
The repository maintains a clear, logical folder structure:
```
Farumasi/
├── Backend/
│   ├── controllers/     # Route controllers
│   ├── models/         # Database models
│   ├── routes/         # API route definitions
│   ├── utils/          # Utility functions
│   ├── uploads/        # File upload storage
│   └── server.js       # Main server file
├── farumasi-frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   └── App.js      # Main application
│   └── public/         # Static assets
└── README.md           # Project documentation
```

#### Commit History Analysis
- **Meaningful Commits**: Each commit addresses specific features or fixes
- **Incremental Progress**: Regular commits showing development progression
- **Feature Branches**: Proper use of Git branching for feature development
- **Documentation**: Comprehensive README files for both frontend and backend

#### Best Practices Implemented
- Environment variable management for sensitive data
- Proper error handling and logging
- Security best practices (JWT, password hashing, file validation)
- API documentation and testing guidelines
- Deployment configuration and scripts

---

## Future Work and Enhancements

### Short-term Enhancements (Next 3 months)
1. **Mobile Application Development**
   - React Native mobile app for iOS and Android
   - Push notifications for order updates
   - Offline functionality for basic features

2. **Advanced Analytics**
   - User behavior tracking and analytics
   - Pharmacy performance metrics
   - Revenue and sales reporting

3. **Enhanced Security**
   - Two-factor authentication
   - Rate limiting and DDoS protection
   - Advanced file upload security

### Medium-term Goals (6-12 months)
1. **Multi-language Support**
   - Internationalization (i18n) implementation
   - Support for local languages
   - Currency conversion capabilities

2. **AI Integration**
   - Prescription text recognition (OCR)
   - Drug interaction warnings
   - Personalized medicine recommendations

3. **Expanded Payment Options**
   - Credit/debit card integration
   - Bank transfer options
   - Cryptocurrency payments

### Long-term Vision (1-2 years)
1. **Healthcare Ecosystem Integration**
   - Electronic health records integration
   - Doctor consultation features
   - Telemedicine capabilities

2. **Supply Chain Management**
   - Inventory management for pharmacies
   - Supplier integration
   - Automated reordering systems

3. **Machine Learning Features**
   - Demand forecasting
   - Personalized user experiences
   - Fraud detection and prevention

---

## Lessons Learned

### Technical Insights

#### Database Design
- **Lesson**: Starting with SQLite proved excellent for rapid prototyping but may require migration to PostgreSQL for production scale
- **Application**: Future projects will consider scalability requirements earlier in database selection

#### API Design
- **Lesson**: RESTful API design with consistent response formats significantly improved frontend integration
- **Application**: Standardized error response formats and status codes reduced debugging time

#### File Upload Security
- **Lesson**: File validation and secure storage are critical for user-uploaded content
- **Application**: Implementing multiple layers of validation (file type, size, content scanning) prevented security vulnerabilities

### Project Management
- **Version Control**: Regular commits with meaningful messages improved code tracking and collaboration
- **Documentation**: Comprehensive documentation reduced onboarding time and improved maintainability
- **Testing**: Early implementation of testing strategies would have prevented production bugs

### User Experience
- **Mobile-First Design**: Designing for mobile users first improved overall user experience
- **Performance Optimization**: Lazy loading and code splitting significantly improved application performance
- **Error Handling**: User-friendly error messages improved customer satisfaction

### Business Insights
- **Market Research**: Understanding user needs early in development guided feature prioritization
- **Scalability Planning**: Considering growth scenarios from the beginning informed architecture decisions
- **Payment Integration**: Multiple payment options are essential for user adoption

---

## Conclusion

The Farumasi project represents a comprehensive solution to modern healthcare challenges in medicine ordering and pharmacy management. Through careful planning, robust technical implementation, and user-centered design, we have created a platform that serves multiple stakeholders effectively.

### Key Achievements
- **Full-Stack Development**: Successfully implemented a complete web application with modern technologies
- **User Experience**: Created an intuitive, responsive interface that works across devices
- **Business Logic**: Implemented complex features like location-based services, payment processing, and real-time tracking
- **Scalability**: Built with growth in mind, using modular architecture and best practices

### Technical Excellence
- Clean, maintainable codebase with comprehensive documentation
- Secure authentication and payment processing
- Responsive design with modern UI/UX principles
- Efficient database design and API architecture

### Project Impact
Farumasi addresses real-world problems in healthcare accessibility, providing a platform that:
- Reduces time and effort in medicine procurement
- Improves prescription management and compliance
- Enhances pharmacy operations and customer service
- Enables data-driven healthcare decisions

### Final Reflection
This project has been an invaluable learning experience, demonstrating the importance of thorough planning, iterative development, and user-focused design. The challenges encountered and solutions implemented have contributed to both technical skills and project management capabilities.

The comprehensive documentation, clean codebase, and thoughtful architecture ensure that Farumasi can be maintained, extended, and scaled by future developers, fulfilling the core objective of creating sustainable, professional software.

---

**Repository Link**: [https://github.com/Emmanuel-NS/Farumasi](https://github.com/Emmanuel-NS/Farumasi)

**Live Demo**: [Farumasi Production URL]

**Contact**: Emmanuel NS - Project Lead and Developer

---