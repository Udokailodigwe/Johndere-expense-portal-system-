# Expense Reimbursement Portal API Documentation

## Base URL

- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://yourdomain.com/api/v1`

## Table of Contents

1. [Authentication Model](#authentication-model)
2. [Security Features](#security-features)
3. [Validation Structure](#validation-structure)
4. [Authentication Flow](#authentication-flow)
5. [Auth Endpoints](#auth-endpoints)
6. [Expense Endpoints](#expense-endpoints)
7. [Approval Endpoints](#approval-endpoints)
8. [Pagination & Search](#pagination--search)
9. [Error Handling](#error-handling)
10. [Security Notes](#security-notes)

---

## Authentication Model

This application uses **role-based access control (RBAC)** with **HTTP-Only Cookie Authentication**:

- **HTTP-Only Cookies**: JWT tokens stored securely in HTTP-only cookies
- **Persistent Sessions**: Users remain logged in across page refreshes
- **Managers** can create new employee accounts
- **Bootstrap route** creates the first manager account
- **New users** receive a temporary password
- **Users must reset** their temporary password to activate their account
- **All endpoints** require authentication via HTTP-only cookie
- **Role-based permissions** restrict access to specific endpoints

### User Roles

- **`employee`**: Can submit expenses, view their own expenses, and see their approval history
- **`manager`**: Can approve/reject expenses, view all employee expenses, and see their approval history

---

## Security Features

### HTTP-Only Cookie Authentication

The API uses HTTP-only cookies for secure token management:

```javascript
// Login response sets HTTP-only cookie
res.cookie("token", token, {
  httpOnly: true, // Not accessible via JavaScript
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "lax", // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: "/", // Available site-wide
});
```

### Comprehensive Security Headers (Helmet.js)

The API implements comprehensive security headers:

- **X-Frame-Options: DENY** - Prevents clickjacking attacks
- **X-Content-Type-Options: nosniff** - Prevents MIME sniffing attacks
- **X-XSS-Protection: 1; mode=block** - XSS protection
- **Strict-Transport-Security** - Enforces HTTPS connections
- **Content-Security-Policy** - Controls resource loading
- **Referrer-Policy** - Controls referrer information
- **Permissions-Policy** - Controls browser features

### CORS Configuration

```javascript
app.use(
  cors({
    origin: true, // Allows all origins (configure for production)
    credentials: true, // Allows cookies in cross-origin requests
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
  })
);
```

---

## Validation Structure

The application uses **Joi validation** with comprehensive error handling:

### Validation Middleware

- **`validate(schema, property)`**: Generic validation middleware
- **`property`**: `"body"` (default) or `"query"`
- **Validated data**: Stored in `req.body` or `req.validatedQuery`

### User Validation Schemas (`app/data/userValidation-schema.js`)

#### `registerValidationSchema`

```javascript
{
  name: string, required, 3-50 characters
  email: string, required, valid email format, 2-50 characters
  password: string, optional, min 8 characters
  role: string, optional, "employee" | "manager", default: "employee"
  active: boolean, optional, default: false
}
```

#### `loginValidationSchema`

```javascript
{
  email: string, required, valid email format
  password: string, required
}
```

#### `passwordResetSchema`

```javascript
{
  email: string, required, valid email format
  oneTimePassword: string, required (current temporary password)
  newPassword: string, required, min 8 characters
  confirmNewPassword: string, required, must match newPassword
}
```

### Expense Validation Schemas (`app/data/expenseValidation-schema.js`)

#### `createExpenseSchema`

```javascript
{
  amount: number, required, positive
  description: string, required, 3-500 characters
  category: string, optional, enum: ["travel", "meals", "accommodation", "fuel", "other"]
  expenseDate: date, optional, ISO format
  notes: string, optional, max 1000 characters
}
```

#### `getExpensesQuerySchema` & `getAllEmployeeExpensesQuerySchema`

```javascript
{
  status: string, optional, enum: ["pending", "approved", "rejected"]
  category: string, optional, enum: ["travel", "meals", "accommodation", "fuel", "other"]
  startDate: date, optional, ISO format
  endDate: date, optional, ISO format
  userId: ObjectId, optional (only in getAllEmployeeExpensesQuerySchema)
  page: number, optional, default: 1, min: 1
  limit: number, optional, default: 10, min: 1, max: 100
}
```

#### `approveExpenseSchema`

```javascript
{
  status: string, required, enum: ["approved", "rejected"]
  rejectReason: string, required when status="rejected", max 200 characters
}
```

---

## Authentication Flow

### Complete User Onboarding Process

1. **Bootstrap Manager Creation**

   ```
   POST /auth/bootstrap
   → Creates first manager account
   → Returns temporary password
   ```

2. **Manager Login with Temporary Password**

   ```
   POST /auth/login
   → Returns 403: "You must set your personal password"
   → Sets HTTP-only cookie with temporary token
   ```

3. **Password Reset**

   ```
   POST /auth/reset-password
   → Sets personal password
   → Activates account (active: true)
   ```

4. **Final Login**

   ```
   POST /auth/login
   → Sets HTTP-only cookie with JWT token
   → Full access granted
   ```

5. **Manager Creates Employee Account**
   ```
   POST /auth/register/manager
   → Creates employee accounts
   → Returns temporary passwords
   ```

### Authentication States

- **`active: false`**: User has temporary password, must reset
- **`active: true`**: User has personal password, can login normally

### Cookie-Based Session Management

- **Login**: Server sets HTTP-only cookie with JWT token
- **Subsequent Requests**: Browser automatically sends cookie
- **Authentication**: Middleware reads token from cookie → Validates JWT → Attaches user to request
- **Logout**: Server clears HTTP-only cookie
- **Persistence**: Users remain logged in across page refreshes

---

## Auth Endpoints

### POST `/auth/bootstrap` — Create First Manager

**Purpose**: Creates the initial manager account for system setup.

**Request Body**:

```json
{
  "name": "John Manager",
  "email": "john.manager@domain.com"
}
```

**Response** (201):

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Manager",
    "email": "john.manager@domain.com",
    "role": "manager"
  },
  "tempPassword": "temp12345"
}
```

**Notes**:

- No authentication required
- Always creates manager role
- Returns temporary password for initial setup

---

### POST `/auth/register` — Create Employee Account

**Purpose**: Creates new employee accounts (unauthenticated).

**Request Body**:

```json
{
  "name": "Jane Employee",
  "email": "jane.employee@domain.com"
}
```

**Response** (201):

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Employee",
    "email": "jane.employee@domain.com",
    "role": "employee"
  },
  "tempPassword": "temp78901"
}
```

**Notes**:

- No authentication required
- Always creates employee role
- Returns temporary password

---

### POST `/auth/register/manager` — Manager Creates Employee

**Purpose**: Authenticated managers can create new employee accounts.

**Authentication**: HTTP-only cookie with manager JWT token

**Request Body**:

```json
{
  "name": "Bob Employee",
  "email": "bob.employee@domain.com"
}
```

**Response** (201):

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439013",
    "name": "Bob Employee",
    "email": "bob.employee@domain.com",
    "role": "employee"
  },
  "tempPassword": "temp45678"
}
```

**Notes**:

- Requires manager authentication via HTTP-only cookie
- Manager-only endpoint
- Creates employee accounts

---

### POST `/auth/login` — User Login

**Purpose**: Authenticate users with email and password.

**Request Body**:

```json
{
  "email": "john.manager@domain.com",
  "password": "temporary_or_personal_password"
}
```

**Success Response** (201):

```json
{
  "message": "Login successful"
}
```

**Response Headers**:

```
Set-Cookie: token=your_jwt_token_here; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax
```

**Temporary Password Response** (403):

```json
{
  "message": "You must set your personal password before login. Use reset-password link to set your password"
}
```

**Error Responses**:

- 401: Invalid credentials
- 404: User not found

---

### POST `/auth/logout` — User Logout

**Purpose**: Clear user session and HTTP-only cookie.

**Authentication**: HTTP-only cookie with JWT token

**Response** (200):

```json
{
  "message": "Logged out successfully"
}
```

**Response Headers**:

```
Set-Cookie: token=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

---

### GET `/auth/me` — Get Current User

**Purpose**: Get current authenticated user data.

**Authentication**: HTTP-only cookie with JWT token

**Response** (200):

```json
{
  "user": {
    "name": "John Manager",
    "email": "john.manager@domain.com",
    "role": "manager",
    "active": true,
    "approvals": ["507f1f77bcf86cd799439020", "507f1f77bcf86cd799439021"]
  }
}
```

**Notes**:

- Used for persistent session management
- Called on page refresh to maintain user state
- Returns user data without sensitive information

---

### POST `/auth/reset-password` — Password Reset

**Purpose**: Reset temporary password to personal password.

**Request Body**:

```json
{
  "email": "john.manager@domain.com",
  "oneTimePassword": "temp12345",
  "newPassword": "mySecurePassword123",
  "confirmNewPassword": "mySecurePassword123"
}
```

**Success Response** (200):

```json
{
  "message": "Password reset successfully"
}
```

**Error Responses**:

- 400: Validation errors
- 401: Invalid temporary password
- 404: User not found

---

## Expense Endpoints

All expense endpoints require authentication via HTTP-only cookie.

### POST `/expenses` — Submit Expense

**Purpose**: Create a new expense submission.

**Authentication**: HTTP-only cookie with JWT token

**Request Body**:

```json
{
  "amount": 150.5,
  "description": "Lunch meeting with client",
  "category": "meals",
  "expenseDate": "2024-01-15T10:30:00Z",
  "notes": "Client was impressed"
}
```

**Response** (201):

```json
{
  "message": "Expense submitted successfully",
  "expense": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439012",
    "amount": 150.5,
    "description": "Lunch meeting with client",
    "category": "meals",
    "expenseDate": "2024-01-15T10:30:00.000Z",
    "status": "pending",
    "notes": "Client was impressed",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Notes**:

- `userId` automatically set from JWT token
- `status` defaults to "pending"
- `expenseDate` defaults to current time if not provided

---

### GET `/expenses` — List User's Expenses with Pagination & Search

**Purpose**: Get current user's expenses with advanced filtering and pagination.

**Authentication**: HTTP-only cookie with JWT token

**Query Parameters** (all optional):

- `status`: "pending" | "approved" | "rejected"
- `category`: "travel" | "meals" | "accommodation" | "fuel" | "other"
- `startDate`: ISO date string
- `endDate`: ISO date string
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)

**Example**:

```
GET /expenses?status=pending&category=meals&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10
```

**Response** (200):

```json
{
  "expenses": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Employee",
        "email": "jane.employee@domain.com"
      },
      "amount": 150.5,
      "description": "Lunch meeting with client",
      "category": "meals",
      "expenseDate": "2024-01-15T10:30:00.000Z",
      "status": "pending",
      "notes": "Client was impressed",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

**Notes**:

- Returns only authenticated user's expenses
- Sorted by `expenseDate` descending
- Includes populated user information
- Supports server-side pagination with metadata

---

### GET `/expenses/all-employees` — Get All Employee Expenses (Manager Only)

**Purpose**: Managers can view all expenses from all employees with pagination and search.

**Authentication**: HTTP-only cookie with manager JWT token

**Query Parameters** (all optional):

- `status`: "pending" | "approved" | "rejected"
- `category`: "travel" | "meals" | "accommodation" | "fuel" | "other"
- `startDate`: ISO date string
- `endDate`: ISO date string
- `userId`: ObjectId (filter by specific employee)
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)

**Example**:

```
GET /expenses/all-employees?status=pending&userId=507f1f77bcf86cd799439012&page=1&limit=20
```

**Response** (200):

```json
{
  "message": "All expenses retrieved successfully",
  "expenses": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Employee",
        "email": "jane.employee@domain.com"
      },
      "amount": 150.5,
      "description": "Lunch meeting with client",
      "category": "meals",
      "expenseDate": "2024-01-15T10:30:00.000Z",
      "status": "pending",
      "notes": "Client was impressed",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 23,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 20
  }
}
```

**Notes**:

- Manager-only endpoint
- Can filter by specific employee using `userId`
- Returns all employees' expenses with pagination
- Supports advanced search and filtering

---

### GET `/expenses/:id` — Get Expense by ID

**Purpose**: Get a specific expense by its ID.

**Authentication**: HTTP-only cookie with JWT token

**Path Parameters**:

- `id`: ObjectId of the expense

**Response** (200):

```json
{
  "expense": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Jane Employee",
      "email": "jane.employee@domain.com"
    },
    "amount": 150.5,
    "description": "Lunch meeting with client",
    "category": "meals",
    "expenseDate": "2024-01-15T10:30:00.000Z",
    "status": "pending",
    "notes": "Client was impressed",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:

- 404: Expense not found

---

### PUT `/expenses/:id` — Update Expense

**Purpose**: Update a pending expense (owner only).

**Authentication**: HTTP-only cookie with JWT token

**Path Parameters**:

- `id`: ObjectId of the expense

**Request Body** (at least one field required):

```json
{
  "amount": 175.0,
  "description": "Updated lunch meeting",
  "category": "meals",
  "expenseDate": "2024-01-16T12:00:00Z",
  "notes": "Added client name"
}
```

**Response** (200):

```json
{
  "message": "Expense updated successfully",
  "expense": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439012",
    "amount": 175.0,
    "description": "Updated lunch meeting",
    "category": "meals",
    "expenseDate": "2024-01-16T12:00:00.000Z",
    "status": "pending",
    "notes": "Added client name",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T12:00:00.000Z"
  }
}
```

**Rules**:

- Only the owner can update (server checks `userId` from JWT)
- Only when `status` is "pending"
- At least one field must be provided

**Error Responses**:

- 400: Cannot edit expense that is not pending
- 404: Expense not found

---

### DELETE `/expenses/:id` — Delete Expense

**Purpose**: Delete a pending expense (owner only).

**Authentication**: HTTP-only cookie with JWT token

**Path Parameters**:

- `id`: ObjectId of the expense

**Response** (200):

```json
{
  "message": "Expense deleted successfully"
}
```

**Rules**:

- Only the owner can delete (server checks `userId` from JWT)
- Only when `status` is "pending"

**Error Responses**:

- 400: Cannot delete expense that is not pending
- 404: Expense not found

---

## Approval Endpoints

### GET `/approvals/pending` — Get Pending Approvals (Manager Only)

**Purpose**: Get all pending expenses awaiting manager approval.

**Authentication**: HTTP-only cookie with manager JWT token

**Query Parameters** (all optional):

- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)

**Response** (200):

```json
{
  "message": "Pending approvals retrieved successfully",
  "expenses": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Jane Employee",
        "email": "jane.employee@domain.com"
      },
      "amount": 150.5,
      "description": "Lunch meeting with client",
      "category": "meals",
      "expenseDate": "2024-01-15T10:30:00.000Z",
      "status": "pending",
      "notes": "Client was impressed",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 12,
    "hasNextPage": true,
    "hasPrevPage": false,
    "limit": 10
  }
}
```

**Notes**:

- Manager-only endpoint
- Returns only pending expenses
- Includes pagination metadata

---

### GET `/approvals/manager` — Manager's Approval History

**Purpose**: Get all approvals made by the authenticated manager.

**Authentication**: HTTP-only cookie with manager JWT token

**Response** (200):

```json
{
  "message": "Manager approval history retrieved successfully",
  "manager": {
    "name": "John Manager",
    "email": "john.manager@domain.com",
    "role": "manager"
  },
  "statistics": {
    "totalApprovals": 15,
    "approvedCount": 12,
    "rejectedCount": 3
  },
  "approvals": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "status": "approved",
      "date": "2024-01-15T10:30:00.000Z",
      "rejectReason": null,
      "expenseId": {
        "_id": "507f1f77bcf86cd799439014",
        "amount": 150.5,
        "description": "Lunch meeting with client",
        "category": "meals",
        "expenseDate": "2024-01-15T10:30:00.000Z",
        "userId": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Jane Employee",
          "email": "jane.employee@domain.com"
        }
      }
    }
  ]
}
```

**Notes**:

- Manager-only endpoint
- Shows complete approval history
- Includes statistics and populated expense/employee data

---

### GET `/approvals/employee` — Employee's Approval History

**Purpose**: Get all approvals for expenses created by the authenticated employee.

**Authentication**: HTTP-only cookie with employee JWT token

**Response** (200):

```json
{
  "message": "Processed expenses",
  "employee": {
    "name": "Jane Employee",
    "email": "jane.employee@domain.com",
    "role": "employee"
  },
  "statistics": {
    "numOfTreatedExpenses": 8,
    "approvedCount": 6,
    "rejectedCount": 2
  },
  "approvals": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "status": "approved",
      "date": "2024-01-15T10:30:00.000Z",
      "rejectReason": null,
      "expenseId": {
        "_id": "507f1f77bcf86cd799439014",
        "amount": 150.5,
        "description": "Lunch meeting with client",
        "category": "meals",
        "expenseDate": "2024-01-15T10:30:00.000Z",
        "status": "approved"
      },
      "managerId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Manager",
        "email": "john.manager@domain.com",
        "role": "manager"
      }
    }
  ]
}
```

**Notes**:

- Employee-only endpoint
- Shows only approvals for the employee's own expenses
- Includes manager information who made the decision

---

### PATCH `/approvals/:id` — Approve/Reject Expense

**Purpose**: Manager approves or rejects an expense.

**Authentication**: HTTP-only cookie with manager JWT token

**Path Parameters**:

- `id`: ObjectId of the expense to approve/reject

**Request Body**:

```json
{
  "status": "approved"
}
```

**Or for rejection**:

```json
{
  "status": "rejected",
  "rejectReason": "Expense exceeds policy limit"
}
```

**Response** (200):

```json
{
  "message": "Expense approved successfully",
  "expense": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439012",
    "amount": 150.5,
    "description": "Lunch meeting with client",
    "category": "meals",
    "expenseDate": "2024-01-15T10:30:00.000Z",
    "status": "approved",
    "notes": "Client was impressed",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Rules**:

- Manager-only endpoint
- Only pending expenses can be approved/rejected
- `rejectReason` required when status is "rejected"
- Creates separate `Approval` document
- Updates expense status
- Adds approval to manager's approvals array

**Error Responses**:

- 400: Status must be 'approved' or 'rejected'
- 400: rejectReason is required when rejecting
- 400: Cannot change status from 'approved' to 'rejected'
- 404: Expense not found

---

## Pagination & Search

### Pagination Response Format

All list endpoints return pagination metadata:

```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,        // Current page number
    "totalPages": 5,         // Total number of pages
    "totalItems": 47,        // Total number of items
    "hasNextPage": true,     // Whether there's a next page
    "hasPrevPage": false,    // Whether there's a previous page
    "limit": 10              // Items per page
  }
}
```

### Search Parameters

Advanced search capabilities across multiple parameters:

#### Expense Search Parameters

- **`status`**: Filter by expense status
  - Values: `pending`, `approved`, `rejected`
- **`category`**: Filter by expense category
  - Values: `travel`, `meals`, `accommodation`, `fuel`, `other`
- **`startDate`**: Filter expenses from this date (inclusive)
  - Format: ISO date string (`2024-01-01T00:00:00Z`)
- **`endDate`**: Filter expenses until this date (inclusive)
  - Format: ISO date string (`2024-01-31T23:59:59Z`)
- **`userId`**: Filter by specific employee (manager endpoints only)
  - Format: MongoDB ObjectId

#### Pagination Parameters

- **`page`**: Page number (default: 1, minimum: 1)
- **`limit`**: Items per page (default: 10, minimum: 1, maximum: 100)

### Example Search Queries

```bash
# Basic pagination
GET /expenses?page=2&limit=20

# Filter by status and category
GET /expenses?status=pending&category=meals

# Date range search
GET /expenses?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z

# Complex search with pagination
GET /expenses?status=approved&category=travel&startDate=2024-01-01T00:00:00Z&endDate=2024-12-31T23:59:59Z&page=1&limit=15

# Manager search by specific employee
GET /expenses/all-employees?userId=507f1f77bcf86cd799439012&status=pending
```

---

## Error Handling

All endpoints use centralized error handling with consistent response format:

### Error Response Format

```json
{
  "error": "ErrorType",
  "message": "Human readable error message",
  "details": [
    {
      "message": "Specific validation error",
      "path": ["field", "name"]
    }
  ]
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors, business logic errors)
- **401**: Unauthorized (invalid/missing token, invalid credentials)
- **403**: Forbidden (insufficient permissions, account not activated)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate email)
- **422**: Unprocessable Entity (validation errors)
- **500**: Server Error (unexpected errors)

### Common Error Scenarios

#### Validation Errors (400/422)

```json
{
  "error": "ValidationError",
  "details": [
    {
      "message": "Name must be at least 3 characters long",
      "path": ["name"]
    },
    {
      "message": "Please provide a valid email",
      "path": ["email"]
    }
  ]
}
```

#### Authentication Errors (401)

```json
{
  "error": "UnauthenticatedError",
  "message": "Authentication required"
}
```

#### Authorization Errors (403)

```json
{
  "error": "UnauthorizedError",
  "message": "Access denied. Manager role required"
}
```

#### Not Found Errors (404)

```json
{
  "error": "NotFoundError",
  "message": "Expense not found"
}
```

---

## Security Notes

### Authentication & Authorization

- **HTTP-Only Cookies**: JWT tokens stored securely, not accessible via JavaScript
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Role-Based Access**: Strict role enforcement for all endpoints
- **User Isolation**: Users can only access their own data unless explicitly authorized
- **Session Persistence**: Users remain logged in across page refreshes

### Data Protection

- **Input Validation**: Comprehensive Joi validation on all inputs
- **SQL Injection Prevention**: Mongoose ODM provides built-in protection
- **XSS Protection**: Helmet.js security headers and input sanitization
- **CORS**: Configured for cross-origin requests with credentials support
- **Security Headers**: Comprehensive security headers via Helmet.js

### Business Logic Security

- **Temporary Passwords**: Randomly generated, must be reset before account activation
- **Account Activation**: Users must set personal password before accessing protected features
- **Expense Ownership**: Users can only modify their own pending expenses
- **Manager Verification**: Only managers can approve/reject expenses
- **State Transitions**: Expenses can only be approved/rejected when in "pending" status

### API Security Best Practices

- **Rate Limiting**: Consider implementing for production
- **HTTPS**: Required for production environments
- **Token Expiration**: 24-hour token lifetime with HTTP-only cookies
- **Audit Logging**: Track all approval/rejection actions
- **Input Sanitization**: All user inputs are validated and sanitized
- **Cookie Security**: HttpOnly, Secure, SameSite flags for maximum security

---

## Database Schema Overview

### User Schema

```javascript
{
  name: String (3-50 chars, required)
  email: String (unique, lowercase, required)
  password: String (min 8 chars, required)
  role: String (enum: ["employee", "manager"], default: "employee")
  approvals: [ObjectId] (ref: "Approval")
  active: Boolean (default: false)
  createdAt: Date
  updatedAt: Date
}
```

### Expense Schema

```javascript
{
  userId: ObjectId (ref: "User", required)
  amount: Number (min 0, required)
  description: String (3-500 chars, required)
  category: String (enum: ["travel", "meals", "accommodation", "fuel", "other"])
  expenseDate: Date (default: now, required)
  status: String (enum: ["pending", "approved", "rejected"], default: "pending")
  notes: String (max 1000 chars)
  createdAt: Date
  updatedAt: Date
}
```

### Approval Schema

```javascript
{
  expenseId: ObjectId (ref: "Expense", required)
  managerId: ObjectId (ref: "User", required)
  status: String (enum: ["approved", "rejected"], required)
  date: Date (default: now)
  rejectReason: String (max 200 chars)
  createdAt: Date
  updatedAt: Date
}
```

---

## Complete API Endpoint Summary

### Authentication Routes (`/api/v1/auth`)

- `POST /bootstrap` - Create first manager (unauthenticated)
- `POST /register` - Create employee (unauthenticated)
- `POST /register/manager` - Manager creates employee (authenticated)
- `POST /login` - User login (sets HTTP-only cookie)
- `POST /logout` - User logout (clears HTTP-only cookie)
- `GET /me` - Get current user data (authenticated)
- `POST /reset-password` - Reset temporary password

### Expense Routes (`/api/v1/expenses`)

- `POST /` - Submit expense (authenticated)
- `GET /` - Get user's expenses with pagination & search (authenticated)
- `GET /all-employees` - Get all employee expenses with pagination & search (manager only)
- `GET /:id` - Get expense by ID (authenticated)
- `PUT /:id` - Update expense (owner only, pending only)
- `DELETE /:id` - Delete expense (owner only, pending only)

### Approval Routes (`/api/v1/approvals`)

- `GET /pending` - Get pending approvals with pagination (manager only)
- `GET /manager` - Manager's approval history (manager only)
- `GET /employee` - Employee's approval history (employee only)
- `PATCH /:id` - Approve/reject expense (manager only)

---

_Last Updated: January 2025_
_Version: 3.0 - Enhanced Security & Pagination_
