# John Deere (North Karelia, Joensuu) Expense Reimbursement Portal - Backend API

A robust, enterprise-grade REST API backend for John Deere's expense management system, providing secure endpoints for contractors and drivers to submit, track, and manage expense reimbursements with advanced security, pagination, search, and authentication features.

## 🚜 Overview

This backend service provides a comprehensive REST API for expense management within the John Deere ecosystem, handling user authentication, expense submissions, approval workflows, data management, and advanced features like pagination, search queries, and robust security implementations.

## ✨ API Features

### 🔐 Authentication & Security

- **HTTP-Only Cookie Authentication**: Secure JWT tokens stored in HTTP-only cookies
- **Role-based Authorization**: Different access levels for employees and managers
- **Advanced Security Headers**: Helmet.js for comprehensive security protection
- **CORS Protection**: Configurable cross-origin policies with credentials support
- **Input Sanitization**: Protection against XSS and injection attacks

### 📊 Data Management

- **Advanced Pagination**: Server-side pagination with metadata (currentPage, totalPages, hasNextPage, etc.)
- **Comprehensive Search**: Multi-parameter search with status, category, date range filters
- **Query Parameter Validation**: Robust validation using Joi schemas
- **Data Persistence**: Secure user session management without localStorage exposure

### 💼 Business Logic

- **Employee Registration**: Secure registration for contractors and drivers
- **Expense Management**: Full CRUD operations for expense submissions
- **Approval Workflow**: Manager approval/rejection system with notifications
- **Email Notifications**: Automated email notifications using Nodemailer
- **Audit Trail**: Complete tracking of expense lifecycle

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Joi** - Data validation
- **Nodemailer** - Email notification service
- **Helmet.js** - Security headers middleware
- **CORS** - Cross-origin resource sharing
- **cookie-parser** - HTTP-only cookie management

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Internal-Expense-Reimbursement-Portal/app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `app` directory:

   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=noreply@example.com

   # CORS Configuration
   ALLOWED_ORIGINS=http://localhost:3000,https://example.com
   ```

4. **Start the server**
   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production
   ```

## 📡 API Endpoints

### Authentication Routes (`/api/v1/auth`)

- `POST /register` - Employee registration
- `POST /register/manager` - Manager registration (requires authentication)
- `POST /bootstrap` - Bootstrap route to create first manager
- `POST /login` - User login (returns HTTP-only cookie)
- `POST /logout` - User logout (clears HTTP-only cookie)
- `GET /me` - Get current user data (authenticated)
- `POST /reset-password` - Password reset

### Expense Routes (`/api/v1/expenses`)

#### Employee Endpoints

- `GET /` - Get user expenses with pagination and search
- `POST /` - Create new expense (authenticated)
- `GET /:id` - Get specific expense (authenticated)
- `PUT /:id` - Update expense (authenticated)
- `DELETE /:id` - Delete expense (authenticated)

#### Manager Endpoints

- `GET /all-employees` - Get all employee expenses with pagination and search

### Approval Routes (`/api/v1/approvals`)

- `GET /` - Get pending approvals (managers only)
- `PUT /:id` - Approve/reject expense (managers only)

## 🔐 Authentication & Authorization

### HTTP-Only Cookie Authentication

The API uses HTTP-only cookies for secure token management:

```javascript
// Login response sets HTTP-only cookie
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: "/",
});
```

### Authentication Flow

1. **Login**: User submits credentials → Server validates → Sets HTTP-only cookie
2. **Subsequent Requests**: Browser automatically sends cookie with requests
3. **Authentication**: Middleware reads token from cookie → Validates JWT → Attaches user to request
4. **Logout**: Server clears HTTP-only cookie

### User Roles

- **Employee**: Can manage their own expenses
- **Manager**: Can approve/reject expenses and access all submissions

### Protected Routes

- Most expense routes require authentication
- Manager-specific routes require manager role
- Bootstrap route allows initial manager creation

## 📊 Advanced Features

### Pagination

All expense endpoints support server-side pagination:

```javascript
// Query Parameters
GET /api/v1/expenses?page=1&limit=10

// Response includes pagination metadata
{
  "expenses": [...],
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

### Search & Filtering

Advanced search capabilities across multiple parameters:

```javascript
// Search Parameters
GET /api/v1/expenses?status=pending&category=travel&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10

// Supported filters
- status: pending, approved, rejected
- category: travel, meals, accommodation, fuel, other
- startDate: ISO date format
- endDate: ISO date format
- page: Page number (default: 1)
- limit: Items per page (default: 10)
```

## 📧 Email Notifications

The API includes automated email notifications using Nodemailer for various system events:

### Email Triggers

- **User Registration**: Welcome email with temporary password
- **Expense Submission**: Notification to managers about new expense
- **Expense Approval**: Confirmation email to employee
- **Expense Rejection**: Notification with rejection reason
- **Password Reset**: Reset instructions and new temporary password

### Email Templates

- **Welcome Email**: Contains temporary password and login instructions
- **Expense Notifications**: Includes expense details and approval/rejection status
- **System Notifications**: Important updates and announcements

### Configuration

Email settings are configured via environment variables:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@example.com
```

### Supported Email Providers

- Gmail (SMTP)
- Outlook (SMTP)
- Custom SMTP servers
- SendGrid
- Mailgun

## 🗄️ Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required),
  role: String (enum: ['employee', 'manager']),
  active: Boolean (default: false),
  approvals: [ObjectId] (ref: 'Expense')
}
```

### Expense Model

```javascript
{
  description: String (required),
  amount: Number (required),
  category: String (required, enum: ['travel', 'meals', 'accommodation', 'fuel', 'other']),
  receipt: String,
  status: String (enum: ['pending', 'approved', 'rejected']),
  submittedBy: ObjectId (ref: 'User'),
  reviewedBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

d

`

## 🔧 Development

### Available Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests with Jest
npm run test:coverage # Run tests with coverage report
```

### Project Structure

```
app/
├── controllers/   # Route handlers
│   ├── auth.js    # Authentication logic
│   ├── expense.js # Expense management with pagination
│   └── approval.js # Approval workflows
├── middleware/    # Custom middleware
│   ├── auth.js    # Authentication middleware
│   ├── error-handler.js # Error handling
│   └── validate-request.js # Request validation
├── models/        # Database models
│   ├── user.js    # User schema
│   ├── expense.js # Expense schema
│   └── approval.js # Approval schema
├── routes/        # API routes
│   ├── auth.js    # Authentication routes
│   ├── expense.js # Expense routes with search/pagination
│   └── approval.js # Approval routes
├── utils/         # Utility functions
│   ├── emailTemplate.js # Email templates
│   └── sendEmail.js # Email service
├── errors/        # Custom error classes
├── data/          # Validation schemas
├── db/           # Database connection
└── tests/        # Test files
```

## 📝 API Response Format

### Success Response with Pagination

```json
{
  "expenses": [...],
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

### Success Response (Simple)

```json
{
  "message": "Operation successful",
  "data": { ... },
  "status": 200
}
```

### Error Response

```json
{
  "message": "Error description",
  "error": "Detailed error information",
  "status": 400
}
```

## 🚀 Deployment

1. **Environment Setup**: Configure all required environment variables
2. **Database**: Set up MongoDB Atlas or local MongoDB instance
3. **Dependencies**: Run `npm install --production`
4. **Security**: Ensure HTTPS in production for cookie security
5. **Server**: Deploy to your hosting platform (Heroku, AWS, etc.)
6. **Process Manager**: Use PM2 or similar for production

### Production Environment Variables

```env
PORT=5000
MONGO_URI=your_production_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=production
ALLOWED_ORIGINS=https://example.com,https://www.example.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@example.com
```

## 📊 API Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## 🧪 Testing

The API includes comprehensive testing:

```bash
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Test Coverage

- Unit tests for models
- Integration tests for routes
- Authentication flow testing
- Pagination and search testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 📞 Support

For API support and questions, please contact the developer @ ilodigweudoka@gmail.com

---

**© 2025 John Deere. All rights reserved.**
