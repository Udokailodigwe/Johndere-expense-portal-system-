# John Deere Expense Reimbursement Portal - Frontend

A modern, enterprise-grade React application for expense management with robust security, state management, and AWS deployment capabilities.

## 🖼️ Application Screenshots

<div align="center">

<table style="width: 100%; table-layout: fixed;">
<tr>
<td align="center" style="width: 33.33%;">

### Manager Dashboard

<img src="./src/assets/images/screenshot-manager-home-page.jpg" alt="Manager Dashboard" width="100%" />
<em>Manager Dashboard - Overview with expense statistics and charts</em>

</td>
<td align="center" style="width: 33.33%;">

### Expense Approval Interface

<img src="./src/assets/images/Screenshot manager approval page.jpg" alt="Expense Approvals" width="100%" />
<em>Expense Approval Interface - Review and approve/reject employee expenses</em>

</td>
<td align="center" style="width: 33.34%;">

### Employee Dashboard

<img src="./src/assets/images/screenshot employee.jpg" alt="Employee View" width="100%" />
<em>Employee Dashboard - Submit and track personal expenses</em>

</td>
</tr>
<tr>
<td align="center" style="width: 50%;">

### Advanced Filtering & Pagination

<img src="./src/assets/images/Screenshot manager home page with pagination and filter view.jpg" alt="Advanced Filtering" width="100%" />
<em>Advanced Filtering & Pagination - Search and filter expenses with server-side pagination</em>

</td>
<td align="center" style="width: 50%;">

### Resolved Expenses

<img src="./src/assets/images/Screenshot resolved expenses page.jpg" alt="Resolved Expenses" width="100%" />
<em>Resolved Expenses - Complete audit trail with approval/rejection history</em>

</td>
</tr>
</table>

</div>

## 🏗️ Architecture & Tech Stack

### **Frontend Architecture**

- **React 18** with functional components and hooks
- **Redux Toolkit** for centralized state management
- **React Router DOM** for client-side routing
- **Tailwind CSS** for utility-first styling with dark mode support
- **Axios** for HTTP client with interceptors
- **React Hot Toast** for user notifications

### **Security Implementation**

- **HTTP-Only Cookies**: Secure authentication using `res.cookies` from backend
- **Automatic Token Management**: Axios configured with `withCredentials: true`
- **Persistent Sessions**: Users remain logged in across page refreshes
- **Role-Based Access Control**: Protected routes with role validation
- **Input Validation**: Client-side validation with error handling

### **State Management Patterns**

- **Redux Toolkit Slices**: Modular state management (`userSlice`, `expenseSlice`, `approvalSlice`)
- **Async Thunks**: API calls with loading states and error handling
- **Selectors**: Optimized data selection with memoization
- **Context API**: Theme management with `ThemeContext`
- **Custom Hooks**: Reusable logic (`useOutsideClick`, `useEditExpenseForm`)

### **Design Patterns**

- **Container/Presentational Components**: Separation of concerns
- **Higher-Order Components**: Route protection with `ProtectedRoutes`
- **Compound Components**: Modular UI components
- **Custom Hooks**: Business logic abstraction
- **Render Props**: Flexible component composition

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5000`

### Installation

1. **Clone and navigate to client directory**

   ```bash
   cd client
   npm install
   ```

2. **Environment Configuration**
   Create `.env.local` file:

   ```env
   REACT_APP_API_URL=http://localhost:5000/api/v1
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```
   Application will open at `http://localhost:3000`

### Available Scripts

- `npm start` - Development server with hot reload
- `npm run build` - Production build optimization
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (irreversible)

## 🔧 Key Features

### **CRUD Operations**

- **Create**: Submit new expenses with validation
- **Read**: View expenses with pagination and filtering
- **Update**: Edit pending expenses (owner only)
- **Delete**: Remove pending expenses (owner only)

### **Advanced Functionality**

- **Server-Side Pagination**: Efficient data loading with metadata
- **Multi-Parameter Search**: Filter by status, category, date range
- **URL Synchronization**: Bookmarkable search parameters
- **Real-Time Updates**: Optimistic UI updates with error rollback
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### **User Experience**

- **Theme Support**: Light, dark, and auto themes with persistence
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: Graceful error boundaries and user feedback
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Code splitting and lazy loading

## 🛡️ Security Features

### **Authentication Flow**

1. **Login**: Credentials sent to backend → HTTP-only cookie set
2. **Session Persistence**: Cookie automatically sent with requests
3. **Token Validation**: Backend validates cookie on each request
4. **Auto-Logout**: Session expires after 24 hours

### **Protected Routes**

```javascript
// Role-based route protection
<ProtectedRoutes roles={["manager"]}>
  <ManagerDashboard />
</ProtectedRoutes>
```

### **Data Security**

- **No Local Storage**: Sensitive data not stored client-side
- **Secure Headers**: CORS and security headers from backend
- **Input Sanitization**: Client and server-side validation
- **XSS Protection**: React's built-in protection + CSP headers

## 🌐 AWS Deployment

### **S3 + CloudFront Setup**

1. **Create S3 Bucket**

   ```bash
   aws s3 mb s3://your-expense-portal-bucket
   ```

2. **Configure S3 for Static Website Hosting**

   ```bash
   aws s3 website s3://your-expense-portal-bucket \
     --index-document index.html \
     --error-document index.html
   ```

3. **Upload Build Files**

   ```bash
   npm run build
   aws s3 sync build/ s3://your-expense-portal-bucket --delete
   ```

4. **Create CloudFront Distribution**
   - Origin: S3 bucket (website endpoint)
   - Default root object: `index.html`
   - Custom error pages: 403/404 → `/index.html` (for React Router)

### **Route 53 Configuration**

1. **Create Hosted Zone** for your domain
2. **Create A Record** pointing to CloudFront distribution
3. **Configure SSL Certificate** via AWS Certificate Manager

### **Environment Variables for Production**

```env
REACT_APP_API_URL=https://your-api-domain.com/api/v1
```

## 📁 Project Structure

```
client/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── navbar.js      # Navigation with search
│   │   ├── Search.js      # Advanced filtering
│   │   ├── Pagination.js  # Server-side pagination
│   │   └── activeStatus.js # Filter display
│   ├── pages/             # Route components
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── protectedRoutes.js # Route protection
│   │   └── activate-account.js # Authentication
│   ├── features/          # Redux slices
│   │   ├── user/         # User management
│   │   ├── expense/      # Expense operations
│   │   └── approval/     # Approval workflow
│   ├── hooks/            # Custom hooks
│   ├── contexts/         # React contexts
│   ├── utils/           # Utility functions
│   ├── selectors/       # Redux selectors
│   └── assets/          # Images and static files
├── package.json
└── tailwind.config.js   # Tailwind configuration
```

## 🧪 Testing

### **Test Setup**

- **React Testing Library**: Component testing
- **Jest**: Test runner and assertions
- **Custom Test Utils**: Redux and Router testing helpers

### **Running Tests**

```bash
npm test                    # Interactive watch mode
npm test -- --coverage    # With coverage report
```

## 📊 Performance Optimizations

- **Code Splitting**: Route-based lazy loading
- **Bundle Analysis**: Webpack bundle analyzer
- **Image Optimization**: Optimized asset loading
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large expense lists

## 🔄 State Management Flow

```javascript
// Example: Expense submission flow
1. User submits form → dispatch(createExpense(data))
2. Redux thunk → API call with loading state
3. Success → Update state + show toast
4. Error → Show error message + rollback
5. UI updates automatically via selectors
```

## 🎨 Styling & Theming

### **Tailwind Configuration**

- **Dark Mode**: `class` strategy with theme toggle
- **Custom Colors**: Brand-specific color palette
- **Responsive Design**: Mobile-first breakpoints
- **Component Classes**: Reusable utility combinations

### **Theme Implementation**

```javascript
// Theme context usage
const { theme, toggleTheme } = useTheme();
<div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
```

## 📱 Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Responsive**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Graceful degradation for older browsers

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Build optimization verified
- [ ] S3 bucket configured with CORS
- [ ] CloudFront distribution created
- [ ] Route 53 DNS configured
- [ ] SSL certificate installed
- [ ] Error pages configured for React Router
- [ ] Performance monitoring enabled

## 📞 Support

For technical support and questions, please contact the developer @ ilodigweudoka@gmail.com.

---

**© 2025 John Dere. All rights reserved.**
