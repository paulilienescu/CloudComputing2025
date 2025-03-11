# RESTful API Server

A simple RESTful API server built with native Node.js (no external dependencies).

## Features

- RESTful API design
- JSON data storage
- Support for all HTTP methods (GET, POST, PUT, DELETE)
- Proper HTTP status codes
- CORS support
- Two resources: Products and Orders
- Filtering, sorting, and pagination
- Health check endpoint

## Getting Started

### Prerequisites

- Node.js (v12 or higher)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Start the server:

```bash
node server.js
```

The server will start on port 3000 by default. You can change this by setting the PORT environment variable.

## API Documentation

### Health Check

```
GET /api/health
```

Response:
- Status: 200 OK
- Body: Health status information

### Products

#### Get all products

```
GET /api/products
```

Query Parameters:
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10)
- `name`: Filter products by name (case-insensitive, partial match)
- `minPrice`: Filter products with price greater than or equal to this value
- `maxPrice`: Filter products with price less than or equal to this value
- `sort`: Sort field (prefix with `-` for descending order, e.g., `-price`)

Response:
- Status: 200 OK
- Body: Paginated array of product objects with pagination metadata

#### Get a specific product

```
GET /api/products/:id
```

Response:
- Status: 200 OK if found, 404 Not Found if not found
- Body: Product object or error message

#### Create a new product

```
POST /api/products
```

Request Body:
```json
{
  "name": "Product Name",
  "price": 19.99,
  "description": "Product description"
}
```

Response:
- Status: 201 Created if successful, 400 Bad Request if validation fails
- Body: Created product object or error message

#### Update a product

```
PUT /api/products/:id
```

Request Body:
```json
{
  "name": "Updated Product Name",
  "price": 29.99,
  "description": "Updated product description"
}
```

Response:
- Status: 200 OK if successful, 404 Not Found if product doesn't exist
- Body: Updated product object or error message

#### Delete a product

```
DELETE /api/products/:id
```

Response:
- Status: 204 No Content if successful, 404 Not Found if product doesn't exist

### Orders

#### Get all orders

```
GET /api/orders
```

Query Parameters:
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10)
- `status`: Filter orders by status (exact match)
- `customerName`: Filter orders by customer name (case-insensitive, partial match)
- `sort`: Sort field (prefix with `-` for descending order, e.g., `-total`)

Response:
- Status: 200 OK
- Body: Paginated array of order objects with pagination metadata

#### Get a specific order

```
GET /api/orders/:id
```

Response:
- Status: 200 OK if found, 404 Not Found if not found
- Body: Order object or error message

#### Create a new order

```
POST /api/orders
```

Request Body:
```json
{
  "customerName": "John Doe",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

Response:
- Status: 201 Created if successful, 400 Bad Request if validation fails
- Body: Created order object or error message

#### Update an order

```
PUT /api/orders/:id
```

Request Body:
```json
{
  "customerName": "Jane Doe",
  "status": "shipped"
}
```

Response:
- Status: 200 OK if successful, 404 Not Found if order doesn't exist
- Body: Updated order object or error message

#### Delete an order

```
DELETE /api/orders/:id
```

Response:
- Status: 204 No Content if successful, 404 Not Found if order doesn't exist

## HTTP Status Codes

- 200 OK: The request has succeeded
- 201 Created: The request has been fulfilled and a new resource has been created
- 204 No Content: The server successfully processed the request, but is not returning any content
- 400 Bad Request: The server cannot process the request due to a client error
- 404 Not Found: The requested resource could not be found
- 500 Internal Server Error: The server encountered an unexpected condition

## RESTful Design Principles

This API follows RESTful design principles:

1. **Resource-based URLs**: URLs represent resources, not actions
2. **HTTP Methods**: Uses HTTP methods (GET, POST, PUT, DELETE) to perform operations
3. **Stateless**: Each request contains all the information needed to process it
4. **JSON Responses**: All responses are in JSON format
5. **Proper Status Codes**: Uses appropriate HTTP status codes for different situations

## Idempotence and Safety

- **Safe Methods**: GET is safe (read-only)
- **Idempotent Methods**: GET, PUT, DELETE are idempotent (multiple identical requests have the same effect as a single request)
- **Non-Idempotent Methods**: POST is not idempotent (multiple identical requests may create multiple resources)

## Pagination

The API supports pagination for collection endpoints with the following parameters:
- `page`: The page number to retrieve (default: 1)
- `limit`: The number of items per page (default: 10)

Pagination response format:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10,
    "next": {
      "page": 2,
      "limit": 10
    }
  }
}
```

## Filtering and Sorting

The API supports filtering and sorting for collection endpoints:

### Filtering
- Products can be filtered by `name`, `minPrice`, and `maxPrice`
- Orders can be filtered by `status` and `customerName`

### Sorting
- Use the `sort` parameter with the field name to sort in ascending order
- Prefix the field name with `-` to sort in descending order (e.g., `-price`) 