# Farumasi Backend API Documentation

This document provides a comprehensive overview of the Farumasi backend API endpoints, detailing their functionality, request formats, expected responses, and practical request examples.

## 1. Authentication Endpoints (`/api/auth`)

### 1.1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Registers a new user in the system.

**Request Body (JSON):**
- `name` (string, required): User's full name.
- `email` (string, required): User's email address (must be unique).
- `password` (string, required): User's password.
- `insurance_providers` (array of strings, optional): List of insurance providers the user accepts. Defaults to `[]`.
- `latitude` (number, required): User's current latitude.
- `longitude` (number, required): User's current longitude.

**Request Example:**
```bash
curl -X POST "http://localhost:5000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Jane Doe",
           "email": "jane.doe@example.com",
           "password": "securepassword123",
           "latitude": -1.9403,
           "longitude": 29.8739,
           "insurance_providers": ["RSSB", "MMI"]
         }'
```

**Responses:**

**201 Created:**
```json
{
  "message": "User registered",
  "userId": 1
}
```

**400 Bad Request:**
```json
{
  "error": "Coordinates required"
}
```

```json
{
  "error": "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Server error during registration"
}
```

### 1.2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user and returns a JWT token along with user details. Optionally updates user's location.

**Request Body (JSON):**
- `email` (string, required): User's email address.
- `password` (string, required): User's password.
- `latitude` (number, optional): New latitude to update for the user.
- `longitude` (number, optional): New longitude to update for the user.

**Request Example:**
```bash
curl -X POST "http://localhost:5000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{
           "email": "john.doe@example.com",
           "password": "securepassword123",
           "latitude": -1.9403,
           "longitude": 29.8739
         }'
```

**Responses:**

**200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "user",
    "insurance_providers": ["RSSB"],
    "location": {
      "country": null,
      "province": null,
      "district": null,
      "sector": null,
      "village": null,
      "coordinate": {
        "latitude": -1.9403,
        "longitude": 29.8739
      }
    }
  }
}
```

**400 Bad Request:**
```json
{
  "error": "Email and password required"
}
```

**401 Unauthorized:**
```json
{
  "error": "Invalid credentials"
}
```

### 1.3. Update User Location

**Endpoint:** `PUT /api/auth/update-location`

**Description:** Updates the authenticated user's location. This endpoint requires authentication.

**Authentication:** Requires a valid JWT in the Authorization header (e.g., `Bearer <token>`).

**Request Body (JSON):**
- `latitude` (number, required): New latitude for the user.
- `longitude` (number, required): New longitude for the user.
- `country` (string, optional): User's country.
- `province` (string, optional): User's province.
- `district` (string, optional): User's district.
- `sector` (string, optional): User's sector.
- `village` (string, optional): User's village.

**Request Example:**
```bash
curl -X PUT "http://localhost:5000/api/auth/update-location" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
           "latitude": -1.9500,
           "longitude": 29.9000,
           "province": "Kigali City",
           "district": "Gasabo"
         }'
```

**Responses:**

**200 OK:**
```json
{
  "message": "Location updated"
}
```

**400 Bad Request:**
```json
{
  "error": "Valid latitude and longitude required"
}
```

**401 Unauthorized:** If no token or invalid token.

**404 Not Found:**
```json
{
  "error": "Location not found for user"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to update location"
}
```

## 2. Product Endpoints (`/api/products`)

### 2.1. Create Product

**Endpoint:** `POST /api/products`

**Description:** Adds a new product to a pharmacy. Supports image upload.

**Request Body (multipart/form-data):**
- `name` (string, required): Name of the product.
- `description` (string, optional): Description of the product.
- `category` (string, optional): Category of the product.
- `price` (number, required): Price of the product. Must be a positive number.
- `requires_prescription` (boolean or string 'true'/'false', optional): Indicates if the product requires a prescription. Defaults to false.
- `pharmacy_id` (number, required): ID of the pharmacy selling the product.
- `image` (file, optional): Product image file.

**Request Example:**
```bash
curl -X POST "http://localhost:5000/api/products" \
     -H "Content-Type: multipart/form-data" \
     -F "name=Aspirin" \
     -F "description=Pain reliever" \
     -F "category=Medication" \
     -F "price=5.99" \
     -F "requires_prescription=false" \
     -F "pharmacy_id=1" \
     -F "image=@/path/to/your/image.jpg"
```

> **Note:** Replace `/path/to/your/image.jpg` with the actual path to your image file.

**Responses:**

**201 Created:**
```json
{
  "message": "Product added",
  "productId": 1
}
```

**400 Bad Request:**
```json
{
  "error": "Name, price, and pharmacy ID are required"
}
```

```json
{
  "error": "Price must be a positive number"
}
```

```json
{
  "error": "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"
}
```

**404 Not Found:**
```json
{
  "error": "Pharmacy not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database error"
}
```

### 2.2. List Products

**Endpoint:** `GET /api/products`

**Description:** Retrieves a list of products with optional filtering and pagination.

**Query Parameters:**
- `category` (string, optional): Filter products by category.
- `search` (string, optional): Search products by name (case-insensitive, partial match).
- `requires_prescription` (boolean or string 'true'/'false', optional): Filter products by prescription requirement.
- `limit` (number, optional): Maximum number of products to return. Default is 20.
- `offset` (number, optional): Number of products to skip. Default is 0.

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/products?category=Medication&search=pain&limit=10&requires_prescription=false"
```

**Responses:**

**200 OK:**
```json
{
  "count": 2,
  "limit": 20,
  "offset": 0,
  "data": [
    {
      "id": 1,
      "name": "Product A",
      "description": "Description A",
      "category": "Category 1",
      "price": 10.50,
      "requires_prescription": 0,
      "image": "image_a.jpg",
      "pharmacy_id": 1,
      "pharmacy_name": "Pharmacy X",
      "image_url": "http://localhost:5000/uploads/image_a.jpg"
    },
    {
      "id": 2,
      "name": "Product B",
      "description": "Description B",
      "category": "Category 2",
      "price": 25.00,
      "requires_prescription": 1,
      "image": null,
      "pharmacy_id": 2,
      "pharmacy_name": "Pharmacy Y",
      "image_url": null
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

### 2.3. Get Product by ID

**Endpoint:** `GET /api/products/:id`

**Description:** Retrieves details of a single product by its ID.

**Path Parameters:**
- `id` (number, required): The ID of the product.

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/products/123"
```

**Responses:**

**200 OK:**
```json
{
  "id": 1,
  "name": "Product A",
  "description": "Description A",
  "category": "Category 1",
  "price": 10.50,
  "requires_prescription": 0,
  "image": "image_a.jpg",
  "pharmacy_id": 1,
  "pharmacy_name": "Pharmacy X",
  "image_url": "http://localhost:5000/uploads/image_a.jpg"
}
```

**404 Not Found:**
```json
{
  "error": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

### 2.4. Update Product by ID

**Endpoint:** `PUT /api/products/:id`

**Description:** Updates details of an existing product. Supports optional image upload.

**Path Parameters:**
- `id` (number, required): The ID of the product to update.

**Request Body (multipart/form-data):**
- `name` (string, optional): New name of the product.
- `description` (string, optional): New description of the product.
- `category` (string, optional): New category of the product.
- `price` (number, optional): New price of the product.
- `requires_prescription` (boolean or string 'true'/'false', optional): New prescription requirement status.
- `image` (file, optional): New product image file.

**Request Example:**
```bash
curl -X PUT "http://localhost:5000/api/products/123" \
     -H "Content-Type: multipart/form-data" \
     -F "price=6.50" \
     -F "description=Updated pain reliever description" \
     -F "image=@/path/to/new_image.png"
```

> **Note:** Replace `/path/to/new_image.png` with the actual path to your new image file. You can update one or more fields.

**Responses:**

**200 OK:**
```json
{
  "message": "Product updated successfully"
}
```

**400 Bad Request:**
```json
{
  "error": "Product ID is required"
}
```

```json
{
  "error": "Price must be a valid number"
}
```

```json
{
  "error": "At least one field must be provided for update"
}
```

**404 Not Found:**
```json
{
  "error": "Product not found or no changes made"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

### 2.5. Delete Product by ID

**Endpoint:** `DELETE /api/products/:id`

**Description:** Deletes a product from the system.

**Path Parameters:**
- `id` (number, required): The ID of the product to delete.

**Request Example:**
```bash
curl -X DELETE "http://localhost:5000/api/products/123"
```

**Responses:**

**200 OK:**
```json
{
  "message": "Product deleted"
}
```

**404 Not Found:**
```json
{
  "error": "Product not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

## 3. Order Endpoints (`/api/orders`)

### 3.1. Place a New Order

**Endpoint:** `POST /api/orders`

**Description:** Places a new order. It supports two types of orders:
- **Prescription-based:** User uploads a prescription file.
- **Item-based:** User provides a list of product items.

> **Note:** You cannot provide both a prescription file and a list of items in the same request.

**Authentication:** Requires authMiddleware (user must be logged in).

**Request Body (multipart/form-data):**
- `prescription_file` (file, optional): The prescription image/document. Use this for prescription-based orders.
- `items` (JSON string or array, optional): A JSON string representing an array of product items. Use this for item-based orders. Each item should have:
  - `product_id` (number, required): ID of the product.
  - `quantity` (number, required): Quantity of the product.
- `insurance_provider` (string, optional): The insurance provider name (e.g., 'RSSB', 'MUTUELLE', 'NONE'). Defaults to 'NONE'.

**Request Examples:**

**Prescription-based order:**
```bash
curl -X POST "http://localhost:5000/api/orders" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: multipart/form-data" \
     -F "prescription_file=@/path/to/your/prescription.pdf" \
     -F "insurance_provider=RSSB"
```

> **Note:** Replace `/path/to/your/prescription.pdf` with the actual path to your prescription file.

**Item-based order:**
```bash
curl -X POST "http://localhost:5000/api/orders" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: multipart/form-data" \
     -F 'items=[{"product_id": 1, "quantity": 2}, {"product_id": 3, "quantity": 1}]' \
     -F "insurance_provider=MUTUELLE"
```

**Responses:**

**201 Created (Prescription-based order):**
```json
{
  "message": "Prescription uploaded successfully. Order is under review.",
  "order_id": 123
}
```

**201 Created (Item-based order):**
```json
{
  "message": "Order placed successfully",
  "order_id": 124,
  "pharmacy_id": 5,
  "delivery_fee": 2.5,
  "total_price": 100.75,
  "discount_rate": 0.1,
  "pharmacy": {
    "id": 5,
    "name": "Nearest Pharmacy",
    "distance": 1.2
  }
}
```

**400 Bad Request:**
```json
{
  "error": "Cannot provide both prescription file and list of items. Choose one."
}
```

```json
{
  "error": "Either prescription file or list of items is required."
}
```

```json
{
  "error": "Invalid items format"
}
```

```json
{
  "error": "Prescription file is required for one or more selected products"
}
```

```json
{
  "error": "No suitable pharmacy found for items and insurance"
}
```

**404 Not Found:**
```json
{
  "error": "No pharmacy meets the requirements"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to place prescription order"
}
```

```json
{
  "error": "User not found or missing location"
}
```

```json
{
  "error": "Failed to insert order"
}
```

```json
{
  "error": "Failed to insert order items"
}
```

### 3.2. Get All Orders

**Endpoint:** `GET /api/orders`

**Description:** Retrieves a list of all orders. Can be filtered by status.

**Query Parameters:**
- `status` (string, optional): Filter orders by their status (e.g., 'pending', 'approved', 'shipped', 'delivered', 'canceled', 'pending_prescription_review').

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/orders?status=pending_prescription_review"
```

**Responses:**

**200 OK:**
```json
[
  {
    "id": 1,
    "user_id": 101,
    "pharmacy_id": 201,
    "total_price": 55.75,
    "delivery_fee": 3.0,
    "prescription_file": null,
    "insurance_provider": "NONE",
    "status": "delivered",
    "created_at": "2023-10-26T10:00:00Z",
    "updated_at": "2023-10-26T11:30:00Z",
    "user_name": "Alice",
    "pharmacy_name": "City Pharmacy"
  },
  {
    "id": 2,
    "user_id": 102,
    "pharmacy_id": null,
    "total_price": null,
    "delivery_fee": null,
    "prescription_file": "rx_123.jpg",
    "insurance_provider": "NONE",
    "status": "pending_prescription_review",
    "created_at": "2023-10-26T12:00:00Z",
    "updated_at": "2023-10-26T12:00:00Z",
    "user_name": "Bob",
    "pharmacy_name": null
  }
]
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

### 3.3. Get Orders by User ID

**Endpoint:** `GET /api/orders/user/:user_id`

**Description:** Retrieves all orders placed by a specific user.

**Path Parameters:**
- `user_id` (number, required): The ID of the user.

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/orders/user/101"
```

**Responses:**

**200 OK:**
```json
[
  {
    "id": 1,
    "user_id": 101,
    "pharmacy_id": 201,
    "total_price": 55.75,
    "delivery_fee": 3.0,
    "prescription_file": null,
    "insurance_provider": "NONE",
    "status": "delivered",
    "created_at": "2023-10-26T10:00:00Z",
    "updated_at": "2023-10-26T11:30:00Z"
  }
]
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

### 3.4. Get Orders for a Pharmacy

**Endpoint:** `GET /api/orders/pharmacy/:pharmacy_id`

**Description:** Retrieves all orders associated with a specific pharmacy.

**Path Parameters:**
- `pharmacy_id` (number, required): The ID of the pharmacy.

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/orders/pharmacy/201"
```

**Responses:**

**200 OK:**
```json
[
  {
    "id": 1,
    "user_id": 101,
    "pharmacy_id": 201,
    "total_price": 55.75,
    "delivery_fee": 3.0,
    "prescription_file": null,
    "insurance_provider": "NONE",
    "status": "delivered",
    "created_at": "2023-10-26T10:00:00Z",
    "updated_at": "2023-10-26T11:30:00Z"
  }
]
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

### 3.5. Get Order Details by ID

**Endpoint:** `GET /api/orders/:id`

**Description:** Retrieves detailed information about a specific order, including its items.

**Path Parameters:**
- `id` (number, required): The ID of the order.

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/orders/1"
```

**Responses:**

**200 OK:**
```json
{
  "id": 1,
  "user_id": 101,
  "pharmacy_id": 201,
  "total_price": 55.75,
  "delivery_fee": 3.0,
  "prescription_file": null,
  "insurance_provider": "NONE",
  "status": "delivered",
  "created_at": "2023-10-26T10:00:00Z",
  "updated_at": "2023-10-26T11:30:00Z",
  "user_name": "Alice",
  "pharmacy_name": "City Pharmacy",
  "items": [
    {
      "id": 10,
      "order_id": 1,
      "product_id": 1001,
      "quantity": 2,
      "price": 15.00
    },
    {
      "id": 11,
      "order_id": 1,
      "product_id": 1002,
      "quantity": 1,
      "price": 25.75
    }
  ]
}
```

**404 Not Found:**
```json
{
  "error": "Order not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

### 3.6. Update Order Status

**Endpoint:** `PUT /api/orders/:id/status`

**Description:** Updates the status of an order.

**Path Parameters:**
- `id` (number, required): The ID of the order to update.

**Request Body (JSON):**
- `status` (string, required): The new status for the order. Valid values: pending, approved, shipped, delivered, canceled.

**Request Example:**
```bash
curl -X PUT "http://localhost:5000/api/orders/1/status" \
     -H "Content-Type: application/json" \
     -d '{
           "status": "approved"
         }'
```

**Responses:**

**200 OK:**
```json
{
  "message": "Order status updated to approved"
}
```

**400 Bad Request:**
```json
{
  "error": "Invalid status value"
}
```

**404 Not Found:**
```json
{
  "error": "Order not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

### 3.7. Update Prescription Order Details (Admin Review)

**Endpoint:** `PUT /api/orders/prescription-review`

**Description:** This endpoint is used by an administrator to update a prescription-based order after review. It assigns a pharmacy, calculates totals, and updates order items.

**Request Body (JSON):**
- `order_id` (number, required): The ID of the order to update.
- `items` (array of objects, required): An array of product items determined during the review. Each item should have:
  - `product_id` (number, required): ID of the product.
  - `quantity` (number, required): Quantity of the product.
- `insurance_provider` (string, optional): The insurance provider name (e.g., 'RSSB', 'MUTUELLE', 'NONE'). Defaults to 'NONE'.
- `status` (string, optional): The new status for the order after review. Defaults to 'pending'.

**Request Example:**
```bash
curl -X PUT "http://localhost:5000/api/orders/prescription-review" \
     -H "Content-Type: application/json" \
     -d '{
           "order_id": 123,
           "items": [
             { "product_id": 1, "quantity": 2 },
             { "product_id": 5, "quantity": 1 }
           ],
           "insurance_provider": "RSSB",
           "status": "approved"
         }'
```

**Responses:**

**200 OK:**
```json
{
  "message": "Order updated successfully after prescription review",
  "order_id": 123,
  "total_price": 100.75,
  "discount_rate": 0.1,
  "delivery_fee": 2.5,
  "pharmacy": {
    "id": 5,
    "name": "Nearest Pharmacy",
    "distance": 1.2
  }
}
```

**400 Bad Request:**
```json
{
  "error": "order_id and valid items are required"
}
```

```json
{
  "error": "No suitable pharmacy found for items and insurance"
}
```

**404 Not Found:**
```json
{
  "error": "Order not found"
}
```

```json
{
  "error": "Product <product_id> not found in pharmacy"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

```json
{
  "error": "User location not found"
}
```

```json
{
  "error": "Failed to update order"
}
```

### 3.8. Delete Order

**Endpoint:** `DELETE /api/orders/:id`

**Description:** Deletes an order from the system. An order can only be deleted if its status is pending or canceled.

**Path Parameters:**
- `id` (number, required): The ID of the order to delete.

**Request Example:**
```bash
curl -X DELETE "http://localhost:5000/api/orders/123"
```

**Responses:**

**200 OK:**
```json
{
  "message": "Order deleted successfully"
}
```

**400 Bad Request:**
```json
{
  "error": "Only pending or canceled orders can be deleted"
}
```

**404 Not Found:**
```json
{
  "error": "Order not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database error message"
}
```

## 4. Payment Endpoints (`/api/payment`)

### 4.1. Initiate Payment (Request to Pay)

**Endpoint:** `POST /api/payment/pay`

**Description:** Initiates a payment request using the MoMo API.

**Request Body (JSON):**
- `order_id` (number, required): The ID of the order for which payment is being made.
- `amount` (string, required): The amount to be paid (e.g., "1000").
- `payer` (string, required): The MSISDN (phone number) of the payer (e.g., "250788123456").
- `currency` (string, optional): The currency code (e.g., "RWF"). Defaults to "RWF".

**Request Example:**
```bash
curl -X POST "http://localhost:5000/api/payment/pay" \
     -H "Content-Type: application/json" \
     -d '{
           "order_id": 123,
           "amount": "1500.00",
           "payer": "250788123456",
           "currency": "RWF"
         }'
```

**Responses:**

**200 OK:**
```json
{
  "message": "Payment initiated",
  "referenceId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
}
```

**400 Bad Request:**
```json
{
  "error": "Missing required fields: order_id, amount, payer"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Unable to get MoMo access token"
}
```

```json
{
  "error": "Failed to initiate payment"
}
```

### 4.2. Check Payment Status

**Endpoint:** `GET /api/payment/status/:referenceId`

**Description:** Checks the status of a previously initiated payment using its reference ID.

**Path Parameters:**
- `referenceId` (string, required): The unique reference ID returned when initiating the payment.

**Request Example:**
```bash
curl -X GET "http://localhost:5000/api/payment/status/a1b2c3d4-e5f6-7890-1234-567890abcdef"
```

**Responses:**

**200 OK:**
```json
{
  "status": "SUCCESSFUL"
}
```

> **Note:** Other possible statuses: PENDING, FAILED, etc., depending on MoMo API

**500 Internal Server Error:**
```json
{
  "error": "Unable to get MoMo access token"
}
```

```json
{
  "error": "Failed to check payment status"
}
```
# 5. Pharmacy Endpoints (/api/pharmacies)

## 5.1. Register Pharmacy

**Endpoint:** `POST /api/pharmacies`

**Description:** Registers a new pharmacy in the system, including its location details.

### Request Body (JSON):
- `name` (string, required): Pharmacy name.
- `email` (string, optional): Pharmacy email.
- `phone` (string, optional): Pharmacy phone number.
- `address` (string, optional): Pharmacy street address.
- `insurance_accepted` (array of strings, optional): List of insurance providers accepted by the pharmacy. Defaults to [].
- `country` (string, optional): Pharmacy's country.
- `province` (string, optional): Pharmacy's province.
- `district` (string, optional): Pharmacy's district.
- `sector` (string, optional): Pharmacy's sector.
- `village` (string, optional): Pharmacy's village.
- `latitude` (number, required): Pharmacy's latitude.
- `longitude` (number, required): Pharmacy's longitude.
- `is_active` (boolean or number 0/1, optional): Whether the pharmacy is active. Defaults to 1 (true).

### Request Example:
```bash
curl -X POST "http://localhost:5000/api/pharmacies" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Central Pharmacy",
           "email": "info@centralpharmacy.com",
           "phone": "250788112233",
           "address": "123 Main St",
           "insurance_accepted": ["RSSB", "SANLAM"],
           "country": "Rwanda",
           "province": "Kigali City",
           "district": "Nyarugenge",
           "sector": "Kigali",
           "village": "Village A",
           "latitude": -1.9500,
           "longitude": 29.9000,
           "is_active": true
         }'
```

### Responses:

#### 201 Created:
```json
{
  "message": "Pharmacy registered successfully",
  "pharmacyId": 1
}
```

#### 400 Bad Request:
```json
{
  "error": "Coordinates are required"
}
```

#### 500 Internal Server Error:
```json
{
  "error": "Database error message"
}
```

## 5.2. Get All Pharmacies

**Endpoint:** `GET /api/pharmacies`

**Description:** Retrieves a list of all registered pharmacies with pagination.

### Query Parameters:
- `limit` (number, optional): Maximum number of pharmacies to return. Default is 10.
- `offset` (number, optional): Number of pharmacies to skip. Default is 0.

### Request Example:
```bash
curl -X GET "http://localhost:5000/api/pharmacies?limit=5&offset=0"
```

### Responses:

#### 200 OK:
```json
{
  "limit": 5,
  "offset": 0,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "Central Pharmacy",
      "email": "info@centralpharmacy.com",
      "phone": "250788112233",
      "address": "123 Main St",
      "insurance_accepted": ["RSSB", "SANLAM"],
      "is_active": true,
      "created_at": "2023-10-26T10:00:00Z",
      "updated_at": "2023-10-26T10:00:00Z",
      "location": {
        "country": "Rwanda",
        "province": "Kigali City",
        "district": "Nyarugenge",
        "sector": "Kigali",
        "village": "Village A",
        "coordinate": {
          "latitude": -1.95,
          "longitude": 29.9
        }
      }
    },
    {
      "id": 2,
      "name": "Community Pharmacy",
      "email": "community@example.com",
      "phone": "250788998877",
      "address": "456 Oak Ave",
      "insurance_accepted": ["MUTUELLE"],
      "is_active": true,
      "created_at": "2023-10-26T11:00:00Z",
      "updated_at": "2023-10-26T11:00:00Z",
      "location": {
        "country": "Rwanda",
        "province": "Kigali City",
        "district": "Gasabo",
        "sector": "Remera",
        "village": "Village B",
        "coordinate": {
          "latitude": -1.93,
          "longitude": 29.88
        }
      }
    }
  ]
}
```

#### 500 Internal Server Error:
```json
{
  "error": "Database error message"
}
```

## 5.3. Get Pharmacy by ID

**Endpoint:** `GET /api/pharmacies/:id`

**Description:** Retrieves details of a single pharmacy by its ID.

### Path Parameters:
- `id` (number, required): The ID of the pharmacy.

### Request Example:
```bash
curl -X GET "http://localhost:5000/api/pharmacies/1"
```

### Responses:

#### 200 OK:
```json
{
  "id": 1,
  "name": "Central Pharmacy",
  "email": "info@centralpharmacy.com",
  "phone": "250788112233",
  "address": "123 Main St",
  "insurance_accepted": ["RSSB", "SANLAM"],
  "is_active": true,
  "created_at": "2023-10-26T10:00:00Z",
  "updated_at": "2023-10-26T10:00:00Z",
  "location": {
    "country": "Rwanda",
    "province": "Kigali City",
    "district": "Nyarugenge",
    "sector": "Kigali",
    "village": "Village A",
    "coordinate": {
      "latitude": -1.95,
      "longitude": 29.9
    }
  }
}
```

#### 404 Not Found:
```json
{
  "error": "Pharmacy not found"
}
```

#### 500 Internal Server Error:
```json
{
  "error": "Database error message"
}
```

## 5.4. Update Pharmacy Details by ID

**Endpoint:** `PUT /api/pharmacies/:id`

**Description:** Updates details of an existing pharmacy, including its location.

### Path Parameters:
- `id` (number, required): The ID of the pharmacy to update.

### Request Body (JSON):
- `name` (string, optional): New pharmacy name.
- `email` (string, optional): New pharmacy email.
- `phone` (string, optional): New pharmacy phone number.
- `address` (string, optional): New pharmacy street address.
- `insurance_accepted` (array of strings, optional): Updated list of insurance providers accepted.
- `country` (string, optional): New pharmacy's country.
- `province` (string, optional): New pharmacy's province.
- `district` (string, optional): New pharmacy's district.
- `sector` (string, optional): New pharmacy's sector.
- `village` (string, optional): New pharmacy's village.
- `latitude` (number, required): Pharmacy's latitude.
- `longitude` (number, required): Pharmacy's longitude.
- `is_active` (boolean or number 0/1, optional): Whether the pharmacy is active.

### Request Example:
```bash
curl -X PUT "http://localhost:5000/api/pharmacies/1" \
     -H "Content-Type: application/json" \
     -d '{
           "name": "Central Pharmacy Updated",
           "phone": "250788998877",
           "address": "789 New St",
           "latitude": -1.9600,
           "longitude": 29.9100,
           "is_active": false
         }'
```

### Responses:

#### 200 OK:
```json
{
  "message": "Pharmacy updated successfully",
  "pharmacyId": 1
}
```

#### 400 Bad Request:
```json
{
  "error": "Coordinates are required"
}
```

#### 500 Internal Server Error:
```json
{
  "error": "Database error message"
}
```

# 6. Location Endpoints (/api/locations)

## 6.1. Update User Location by User ID

**Endpoint:** `PUT /api/locations/update/user/:userId`

**Description:** Updates the location details for a specific user. This endpoint can be used by an authenticated user to update their own location, or by an admin for any user.

### Path Parameters:
- `userId` (number, required): The ID of the user whose location is to be updated.

### Request Body (JSON):
- `latitude` (number, required): New latitude for the user.
- `longitude` (number, required): New longitude for the user.
- `country` (string, optional): User's country.
- `province` (string, optional): User's province.
- `district` (string, optional): User's district.
- `sector` (string, optional): User's sector.
- `village` (string, optional): User's village.

### Request Example:
```bash
curl -X PUT "http://localhost:5000/api/locations/update/user/101" \
     -H "Content-Type: application/json" \
     -d '{
           "latitude": -1.9450,
           "longitude": 29.8850,
           "country": "Rwanda",
           "province": "Kigali City",
           "district": "Gasabo",
           "sector": "Kacyiru",
           "village": "Kigali"
         }'
```

### Responses:

#### 200 OK:
```json
{
  "message": "User location updated"
}
```

#### 400 Bad Request:
```json
{
  "error": "Latitude and longitude are required"
}
```

#### 404 Not Found:
```json
{
  "error": "Location not found for user"
}
```

#### 500 Internal Server Error:
```json
{
  "error": "Failed to update user location"
}
```

## 6.2. Get User Location by User ID

**Endpoint:** `GET /api/locations/user/:userId`

**Description:** Retrieves the location details for a specific user.

### Path Parameters:
- `userId` (number, required): The ID of the user whose location is to be retrieved.

### Request Example:
```bash
curl -X GET "http://localhost:5000/api/locations/user/101"
```

### Responses:

#### 200 OK:
```json
{
  "id": 1,
  "user_id": 101,
  "pharmacy_id": null,
  "country": "Rwanda",
  "province": "Kigali City",
  "district": "Gasabo",
  "sector": "Kacyiru",
  "village": "Kigali",
  "latitude": -1.945,
  "longitude": 29.885
}
```

#### 404 Not Found:
```json
{
  "error": "Location not found"
}
```

#### 500 Internal Server Error:
```json
{
  "error": "Failed to fetch location"
}
```

## 6.3. Update Pharmacy Location by Pharmacy ID

**Endpoint:** `PUT /api/locations/update/pharmacy/:pharmacyId`

**Description:** Updates the location details for a specific pharmacy.

### Path Parameters:
- `pharmacyId` (number, required): The ID of the pharmacy whose location is to be updated.

### Request Body (JSON):
- `latitude` (number, required): New latitude for the pharmacy.
- `longitude` (number, required): New longitude for the pharmacy.
- `country` (string, optional): Pharmacy's country.
- `province` (string, optional): Pharmacy's province.
- `district` (string, optional): Pharmacy's district.
- `sector` (string, optional): Pharmacy's sector.
- `village` (string, optional): Pharmacy's village.

### Request Example:
```bash
curl -X PUT "http://localhost:5000/api/locations/update/pharmacy/1" \
     -H "Content-Type: application/json" \
     -d '{
           "latitude": -1.9550,
           "longitude": 29.9050,
           "country": "Rwanda",
           "province": "Kigali City",
           "district": "Nyarugenge",
           "sector": "Kigali",
           "village": "Village B"
         }'
```

### Responses:

#### 200 OK:
```json
{
  "message": "Pharmacy location updated"
}
```

#### 400 Bad Request:
```json
{
  "error": "Latitude and longitude are required"
}
```

#### 404 Not Found:
```json
{
  "error": "Location not found for pharmacy"
}
```

#### 500 Internal Server Error:
```json
{
  "error": "Failed to update pharmacy location"
}
```

## 6.4. Get Pharmacy Location by Pharmacy ID

**Endpoint:** `GET /api/locations/pharmacy/:pharmacyId`

**Description:** Retrieves the location details for a specific pharmacy.

### Path Parameters:
- `pharmacyId` (number, required): The ID of the pharmacy whose location is to be retrieved.

### Request Example:
```bash
curl -X GET "http://localhost:5000/api/locations/pharmacy/1"
```

### Responses:

#### 200 OK:
```json
{
  "id": 2,
  "user_id": null,
  "pharmacy_id": 1,
  "country": "Rwanda",
  "province": "Kigali City",
  "district": "Nyarugenge",
  "sector": "Kigali",
  "village": "Village B",
  "latitude": -1.955,
  "longitude": 29.905
}
```

#### 404 Not Found:
```json
{
  "error": "Location not found"
}
```

#### 500 Internal Server Error:
```json
{
  "error": "Failed to fetch location"
}
```

## 6.5. Get All Locations

**Endpoint:** `GET /api/locations`

**Description:** Retrieves a list of all registered locations (for both users and pharmacies).

### Request Example:
```bash
curl -X GET "http://localhost:5000/api/locations"
```

### Responses:

#### 200 OK:
```json
[
  {
    "id": 1,
    "user_id": 101,
    "pharmacy_id": null,
    "country": "Rwanda",
    "province": "Kigali City",
    "district": "Gasabo",
    "sector": "Kacyiru",
    "village": "Kigali",
    "latitude": -1.945,
    "longitude": 29.885
  },
  {
    "id": 2,
    "user_id": null,
    "pharmacy_id": 1,
    "country": "Rwanda",
    "province": "Kigali City",
    "district": "Nyarugenge",
    "sector": "Kigali",
    "village": "Village B",
    "latitude": -1.955,
    "longitude": 29.905
  }
]
```

#### 500 Internal Server Error:
```json
{
  "error": "Failed to fetch locations"
}
```