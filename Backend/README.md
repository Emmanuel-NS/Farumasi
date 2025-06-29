# 💊 Farumasi Pharmacy Backend

Farumasi is a backend API for connecting users with nearby pharmacies. It supports medicine ordering with or without prescriptions, integrates mobile payment (MoMo), and includes admin-level controls for reviewing prescription-based orders.

---

## 📦 Features

- 🌍 Location-aware pharmacy assignment
- 📋 Prescription-based or manual product ordering
- 📄 File uploads (prescriptions)
- 🧾 Insurance-based discounts
- 📱 MoMo payment API integration
- 👨‍⚕️ Admin review for prescription orders

---

## 🚀 Tech Stack

| Tool        | Purpose                       |
|-------------|-------------------------------|
| Node.js     | Backend runtime               |
| Express     | API framework                 |
| SQLite3     | Database                      |
| Multer      | File uploads                  |
| Axios       | HTTP requests                 |
| MTN MoMo API| Mobile payment integration    |

---

## ⚙️ Setup

1. Clone the project
2. Install dependencies  
   ```bash
   npm install

3. Create .env file with:

### env

MOMO_BASE_URL=...
MOMO_SUBSCRIPTION_KEY=...
MOMO_TARGET_ENV=...
MOMO_API_USER=...
MOMO_API_KEY=...

## Start the server

    ```bash
    node server.js
  ```
## 📂 Project Structure
```bash
.
├── controllers/
├── models/
├── routes/
├── utils/
├── uploads/
├── server.js
├── README.md
└── .env
```

## 🧪 Testing
### Use Postman to test:

Orders: form-data for prescription files

Payments: JSON format

Auth: JWT or token-based access (authMiddleware)


## 📡 API ROUTES DOCUMENTATION (Frontend Guide)

---

### 🧑‍💼 Auth Routes

| Method | Endpoint                 | Description               | Auth | Body |
|--------|--------------------------|---------------------------|------|------|
| POST   | `/register`              | User registration         | ❌   | `name`, `email`, `password` |
| POST   | `/login`                 | User login (returns token)| ❌   | `email`, `password` |
| PUT    | `/update-location`       | Update user’s location    | ✅   | `latitude`, `longitude` |

---

### 📍 Location Routes

| Method | Endpoint                        | Description                    |
|--------|----------------------------------|--------------------------------|
| PUT    | `/update/user/:userId`          | Update user location by ID     |
| GET    | `/user/:userId`                 | Get user location              |
| PUT    | `/update/pharmacy/:pharmacyId`  | Update pharmacy location       |
| GET    | `/pharmacy/:pharmacyId`         | Get pharmacy location          |
| GET    | `/`                              | Get all locations              |

---

### 🏥 Pharmacy Routes

| Method | Endpoint     | Description              |
|--------|--------------|--------------------------|
| POST   | `/`          | Register a new pharmacy  |
| GET    | `/`          | List all pharmacies      |
| GET    | `/:id`       | Get pharmacy by ID       |

---

### 💊 Product Routes

| Method | Endpoint   | Description                      |
|--------|------------|----------------------------------|
| POST   | `/`        | Add a new product (with image)   |
| GET    | `/`        | List all products                |
| GET    | `/:id`     | Get product by ID                |
| PUT    | `/:id`     | Update product info              |
| DELETE | `/:id`     | Delete product                   |

---

### 📦 Order Routes

| Method | Endpoint                             | Description                                               |
|--------|---------------------------------------|-----------------------------------------------------------|
| POST   | `/`                                   | Place an order (optional: upload prescription)            |
| GET    | `/`                                   | Get all orders                                            |
| GET    | `/user/:user_id`                      | Get all orders for a user                                 |
| GET    | `/pharmacy/:pharmacy_id`              | Get all orders for a pharmacy                             |
| GET    | `/:id`                                 | Get specific order by ID                                  |
| PUT    | `/:id/status`                         | Update order status (pending → paid / canceled, etc.)     |
| PUT    | `/prescription-review`                | Admin updates prescription order (adds items, insurance)  |
| DELETE | `/:id`                                 | Delete/cancel order                                       |

> ℹ️ When uploading a prescription, use `form-data` and add the file with key `prescription_file`.

---

### 💰 Payment Routes (MoMo API)

| Method | Endpoint               | Description                        |
|--------|------------------------|------------------------------------|
| POST   | `/pay`                 | Initiate payment (MoMo)            |
| GET    | `/status/:referenceId` | Check payment status by reference  |

---
## 📜 API Deep Documentation

This section provides detailed documentation for each API endpoint in the Farumasi backend. Each endpoint includes information about its purpose, required headers, request body structure, example requests, responses, and potential error codes.

### Authentication Routes

#### POST /auth/register

- **Description**: Register a new user.
- **Headers**: 
  - `Content-Type: application/json`
- **Body**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "insurance_providers": ["string"],  // Optional
  "latitude": "number",                // User's location latitude
  "longitude": "number"                // User's location longitude
}
```
- **Response**:
  - **201 Created**: User registered successfully.
  - **400 Bad Request**: Invalid input or missing required fields.
- **Example**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "insurance_providers": ["RSSB"],
  "latitude": -1.2921,
  "longitude": 36.8219
}
```

#### POST /auth/login

- **Description**: Log in an existing user and return a JWT token.
- **Headers**: 
  - `Content-Type: application/json`
- **Body**:
```json
{
  "email": "string",
  "password": "string"
}
```
- **Response**:
  - **200 OK**: Successfully logged in, returns a JWT token.
  - **401 Unauthorized**: Invalid email or password.
- **Example**:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

---

### Location Routes

#### PUT /location/:userId

- **Description**: Update the location of a user by their user ID.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "country": "string",
  "province": "string",
  "district": "string",
  "sector": "string",
  "village": "string",
  "latitude": "number",
  "longitude": "number"
}
```
- **Response**:
  - **200 OK**: Location updated successfully.
  - **400 Bad Request**: Missing coordinates or invalid input.
- **Example**:
```json
{
  "country": "Rwanda",
  "province": "Kigali",
  "district": "Gasabo",
  "sector": "Kimicuku",
  "village": "Village X",
  "latitude": -1.2921,
  "longitude": 36.8219
}
```

---

### Order Routes

#### POST /order/place

- **Description**: Place an order for products.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "user_id": "integer",
  "insurance_provider": "string", // Optional
  "items": [
    {
      "product_id": "integer",
      "quantity": "integer"
    }
  ],
  "prescription_file": "string" // Optional, base64 encoded file
}
```
- **Response**:
  - **201 Created**: Order placed successfully.
  - **400 Bad Request**: Invalid items format or missing required fields.
  - **404 Not Found**: User or product not found.
- **Example**:
```json
{
  "user_id": 1,
  "insurance_provider": "NONE",
  "items": [
    {
      "product_id": 123,
      "quantity": 2
    }
  ],
  "prescription_file": "data:application/pdf;base64,JVBERi0xLjQK..."
}
```

#### GET /order/:orderId

- **Description**: Retrieve details of a specific order by its ID.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - **200 OK**: Returns order details.
  - **404 Not Found**: Order not found.
- **Example Response**:
```json
{
  "id": 1,
  "user_id": 1,
  "items": [
    {
      "product_id": 123,
      "quantity": 2,
      "price": 1000
    }
  ],
  "total_price": 2000,
  "status": "pending",
  "created_at": "2025-06-29T12:00:00Z"
}
```

---

### Payment Routes

#### POST /payment/initiate

- **Description**: Initiate a payment for an order.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "order_id": "integer",
  "amount": "number"
}
```
- **Response**:
  - **200 OK**: Payment initiated successfully.
  - **400 Bad Request**: Invalid order ID or amount.
  - **404 Not Found**: Order not found.
- **Example**:
```json
{
  "order_id": 1,
  "amount": 5000.00
}
```

---

### Pharmacy Routes

#### POST /pharmacy/register

- **Description**: Register a new pharmacy.
- **Headers**:
  - `Content-Type: application/json`
- **Body**:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "insurance_accepted": ["string"], // List of accepted insurance providers
  "latitude": "number",
  "longitude": "number",
  "is_active": "boolean" // Indicates if the pharmacy is active
}
```
- **Response**:
  - **201 Created**: Pharmacy registered successfully.
  - **400 Bad Request**: Missing required fields or invalid data.
- **Example**:
```json
{
  "name": "Farumasi Pharmacy",
  "email": "info@farumasi.rw",
  "phone": "0781234567",
  "address": "Kigali, Gasabo",
  "insurance_accepted": ["RSSB", "MUTUELLE"],
  "latitude": -1.2921,
  "longitude": 36.8219,
  "is_active": true
}
```

#### GET /pharmacy/:pharmacyId

- **Description**: Retrieve details of a specific pharmacy by its ID.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - **200 OK**: Returns pharmacy details.
  - **404 Not Found**: Pharmacy not found.
- **Example Response**:
```json
{
  "id": 1,
  "name": "Farumasi Pharmacy",
  "email": "info@farumasi.rw",
  "phone": "0781234567",
  "address": "Kigali, Gasabo",
  "insurance_accepted": ["RSSB", "MUTUELLE"],
  "is_active": true
}
```

---

### Product Routes

#### POST /product/add

- **Description**: Add a new product to a pharmacy.
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "price": "number",
  "requires_prescription": "boolean", // Indicates if a prescription is needed
  "pharmacy_id": "integer"
}
```
- **Response**:
  - **201 Created**: Product added successfully.
  - **400 Bad Request**: Missing required fields.
- **Example**:
```json
{
  "name": "Paracetamol",
  "description": "Pain reliever",
  "category": "Pain Relief",
  "price": 1000,
  "requires_prescription": false,
  "pharmacy_id": 1
}
```

#### GET /product/:productId

- **Description**: Retrieve details of a specific product by its ID.
- **Headers**:
  - `Authorization: Bearer <token>`
- **Response**:
  - **200 OK**: Returns product details.
  - **404 Not Found**: Product not found.
- **Example Response**:
```json
{
  "id": 123,
  "name": "Paracetamol",
  "description": "Pain reliever",
  "category": "Pain Relief",
  "price": 1000,
  "requires_prescription": false,
  "pharmacy_id": 1
}
```

---

## 📑 Final Report Summary

### 🎯 Purpose

The **Farumasi Backend API** provides a complete system for medicine ordering and delivery. It supports two order types:

1. Manual Product Order  
2. Prescription-Based Order (file upload)

### 🧠 Key Logic Rules

| Case | Input                              | Outcome                              |
|------|------------------------------------|--------------------------------------|
| 1️⃣   | Items only                         | Auto-pick pharmacy → status: `pending` |
| 2️⃣   | Prescription only                  | Nearest pharmacy → status: `pending_prescription_review` |
| 3️⃣   | Invalid (no prescription or items)| Rejected                             |
| 4️⃣   | Both items + prescription         | Rejected                             |

### 🔐 Admin Controls

- Review prescription orders
- Assign products based on prescription
- Update insurance provider
- Change order status
- register pharamacy
- populate products of registered pharamacy into database 

### 🔁 Payment Flow

1. Backend sends payment request to MoMo
2. MoMo returns `referenceId`
3. Backend stores it under `payments` table
4. `/status/:refId` used to check/confirm transaction

---

## 🗂️ Database Schema (ERD)

The following Entity Relationship Diagram (ERD) shows how the tables in the Farumasi system relate to one another:

![ERD Diagram](./images/erd.png)

- `users` are linked to `locations` and `orders`
- `pharmacies` own `products` and also have `locations`
- `orders` can contain multiple `order_items` and are tied to `payments`
- Some `products` may require a `prescription_file`

---

## 🧩 Explanation of Database Entities and Relationships

### 📌 Entities

#### 👤 User
Represents the customers using the pharmacy service.
- `user_id`: Unique identifier for each user.
- `insurance_providers`: List of insurance providers associated with the user.

#### 🏪 Pharmacy
Represents the pharmacies offering products.
- `pharmacy_id`: Unique identifier for each pharmacy.

#### 💊 Product
Represents the products available in pharmacies.
- `pharmacy_id`: Foreign key linking to the Pharmacy entity.

#### 📦 Order
Represents orders placed by users.
- `user_id`: Foreign key linking to the User entity.

#### 🧾 OrderItem
Represents individual items within an order.
- `order_id`: Foreign key linking to the Order entity.
- `product_id`: Foreign key linking to the Product entity.

#### 💳 Payment
Represents payment transactions for orders.
- `order_id`: Foreign key linking to the Order entity.

---

### 🔗 Relationships

- A **User** can place multiple **Orders**.
- An **Order** can contain multiple **OrderItems**.
- An **OrderItem** includes one **Product**.
- A **Pharmacy** can offer multiple **Products**.
- An **Order** can have one associated **Payment**.

---
## 🧭 System Flow Diagrams

This section provides a high-level overview of how users and administrators interact with the pharmacy system. These diagrams help explain the journey each role takes within the system, from registration and product selection to prescription processing and payment.

### 👤 User Flow

The **User Flow Chart** illustrates the main steps a typical user (customer) follows when using the platform:

- Registers and logs in.
- Updates their location.
- Either selects medicines directly or uploads a prescription.
- Waits for prescription review (if applicable).
- Makes a payment once the order is ready.

![User Flow Chart](./images/user_flow.svg)

> 💡 This flow ensures that users can easily place an order even with prescriptions and insurance, allowing for flexible interaction with pharmacies.

---

### 🛡️ Admin Flow

The **Admin Flow Chart** describes the core activities an administrator performs:

- Registers pharmacies and adds their products.
- Reviews prescriptions uploaded by users.
- Adds appropriate items and insurance details to those orders.
- Approves orders and updates their statuses.
- Monitors payments and pharmacy performance.

![Admin Flow Chart](./images/admin_flow.svg)

> 🔐 Admins ensure data integrity, handle sensitive prescription logic, and bridge users with physical pharmacies by keeping the platform up-to-date.

---

These diagrams serve as a reference for developers, designers, and testers to understand how different roles interact with the system and what decisions are automated vs. manual.


