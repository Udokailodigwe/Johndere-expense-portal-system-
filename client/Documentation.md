# Frontend Documentation - Expense Reimbursement Portal

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [State Management](#state-management)
3. [Component Architecture](#component-architecture)
4. [Security Implementation](#security-implementation)
5. [API Integration](#api-integration)
6. [Routing & Navigation](#routing--navigation)
7. [Styling & Theming](#styling--theming)
8. [Performance Optimizations](#performance-optimizations)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Guide](#deployment-guide)

---

## Architecture Overview

### **Application Structure**

The frontend is built using a modern React architecture with the following key principles:

- **Component-Based**: Modular, reusable components
- **State-Driven**: Centralized state management with Redux
- **Security-First**: HTTP-only cookies and protected routes
- **Performance-Optimized**: Code splitting and lazy loading
- **Accessible**: ARIA compliance and keyboard navigation

### **Tech Stack**

```javascript
{
  "core": "React 18.2.0",
  "state": "Redux Toolkit 1.9.7",
  "routing": "React Router DOM 6.8.1",
  "styling": "Tailwind CSS 3.2.7",
  "http": "Axios 1.3.4",
  "notifications": "React Hot Toast 2.4.1",
  "testing": "React Testing Library 13.4.0"
}
```

### **Project Structure**

```
src/
├── components/          # Reusable UI components
│   ├── navbar.js       # Main navigation with search
│   ├── Search.js       # Advanced filtering component
│   ├── Pagination.js   # Server-side pagination
│   ├── activeStatus.js # Active filter display
│   ├── sidebar.js      # Navigation sidebar
│   └── navlinks.js     # Navigation links
├── pages/              # Route components
│   ├── dashboard/      # Dashboard pages
│   │   ├── home.js    # Main dashboard
│   │   ├── addExpenses.js # Expense form
│   │   ├── getExpenses.js # Expense list
│   │   ├── resolvedExpenses.js # Resolved expenses
│   │   ├── settings.js # Theme settings
│   │   └── manager/    # Manager-specific pages
│   ├── protectedRoutes.js # Route protection
│   ├── activate-account.js # Authentication
│   └── error.js        # Error boundary
├── features/           # Redux feature slices
│   ├── user/          # User management
│   ├── expense/       # Expense operations
│   └── approval/      # Approval workflow
├── hooks/             # Custom React hooks
│   ├── useOutsideClick.js # Click outside detection
│   └── useEditExpenseForm.js # Form management
├── contexts/          # React contexts
│   └── ThemeContext.js # Theme management
├── utils/             # Utility functions
│   ├── axios.js       # HTTP client configuration
│   ├── helpFunc.js    # Helper functions
│   ├── validation.js  # Form validation
│   └── links.js       # Navigation links
├── selectors/         # Redux selectors
│   └── expenseSelectors.js # Expense data selection
└── assets/           # Static assets
    └── images/       # Application screenshots
```

---

## State Management

### **Redux Toolkit Architecture**

The application uses Redux Toolkit for predictable state management with the following slices:

#### **User Slice** (`features/user/userSlice.js`)

```javascript
const initialState = {
  user: null, // Current user data
  isLoading: false, // Loading state
  error: null, // Error messages
};

// Key actions
-login(userData) - // User login
  logout() - // User logout
  getCurrentUser() - // Fetch current user
  clearTempUser(); // Clear temporary data
```

#### **Expense Slice** (`features/expense/expenseSlice.js`)

```javascript
const initialState = {
  expenses: [], // Expense list
  totalExpenses: 0, // Total count
  isLoading: false, // Loading state
  searchParams: {
    // Search parameters
    status: "",
    category: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  },
  pagination: null, // Pagination metadata
};

// Key actions
-getExpenses(params) - // Fetch expenses
  createExpense(data) - // Create expense
  updateExpense(id, data) - // Update expense
  deleteExpense(id) - // Delete expense
  handleSearchChange({ name, value }) - // Update search params
  clearSearchParams(); // Reset search
```

#### **Approval Slice** (`features/approval/approvalSlice.js`)

```javascript
const initialState = {
  approvals: [], // Approval list
  pendingExpenses: [], // Pending expenses
  isLoading: false, // Loading state
  pagination: null, // Pagination metadata
};

// Key actions
-getPendingApprovals() - // Fetch pending expenses
  approveExpense(id) - // Approve expense
  rejectExpense(id, reason) - // Reject expense
  getApprovalHistory(); // Fetch approval history
```

### **Async Thunks**

All API calls are handled through Redux async thunks:

```javascript
// Example: Fetch expenses with pagination
export const getExpensesThunk = async (url, thunkAPI) => {
  try {
    const queryParams = thunkAPI.arg || {};
    const queryString = new URLSearchParams(
      Object.entries(queryParams).filter(
        ([_, value]) => value !== "" && value != null
      )
    ).toString();

    const finalUrl = queryString ? `${url}?${queryString}` : url;
    const resp = await customFetch.get(finalUrl);
    return resp.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.msg || "Expense fetching failed"
    );
  }
};
```

### **Selectors**

Optimized data selection with memoization:

```javascript
// Select expense data with pagination
export const selectExpenseData = createSelector(
  [(state) => state.expense.expenses, (state) => state.expense.pagination],
  (expenses, pagination) => ({
    expenses,
    pagination,
    hasData: expenses.length > 0,
    totalPages: pagination?.totalPages || 0,
  })
);
```

---

## Component Architecture

### **Design Patterns**

#### **Container/Presentational Pattern**

```javascript
// Container Component (Business Logic)
const GetExpenses = () => {
  const { expenses, isLoading, searchParams } = useSelector(selectExpenseData);
  const dispatch = useDispatch();

  const handleDelete = (id) => {
    dispatch(deleteExpense(id));
  };

  return (
    <ExpenseList
      expenses={expenses}
      isLoading={isLoading}
      onDelete={handleDelete}
      searchParams={searchParams}
    />
  );
};

// Presentational Component (UI Only)
const ExpenseList = ({ expenses, isLoading, onDelete }) => {
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="expense-grid">
      {expenses.map((expense) => (
        <ExpenseCard key={expense._id} expense={expense} onDelete={onDelete} />
      ))}
    </div>
  );
};
```

#### **Compound Components**

```javascript
// Search Component with multiple sub-components
const Search = () => {
  return (
    <SearchContainer>
      <SearchToggle />
      <SearchForm>
        <StatusFilter />
        <CategoryFilter />
        <DateRangeFilter />
        <SearchActions />
      </SearchForm>
    </SearchContainer>
  );
};
```

### **Custom Hooks**

#### **useOutsideClick**

```javascript
const useOutsideClick = (isOpen, callback) => {
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && isOpen) {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, callback]);

  return ref;
};
```

#### **useEditExpenseForm**

```javascript
const useEditExpenseForm = (initialData) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = () => {
    const newErrors = validateExpenseData(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { formData, errors, handleChange, validateForm, setFormData };
};
```

---

## Security Implementation

### **HTTP-Only Cookie Authentication**

The application uses secure HTTP-only cookies for authentication:

```javascript
// Axios configuration with credentials
const customFetch = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true, // Automatically send cookies
});

// No manual token handling needed
// Cookies are set by backend res.cookie() and sent automatically
```

### **Authentication Flow**

```javascript
// Login process
const handleLogin = async (credentials) => {
  try {
    const result = await dispatch(login(credentials));
    if (result.type === "user/login/fulfilled") {
      // Backend sets HTTP-only cookie
      await dispatch(getCurrentUser()); // Fetch user data
      navigate("/index");
    }
  } catch (error) {
    toast.error("Login failed");
  }
};

// Session persistence
useEffect(() => {
  if (!user && !isLoading && !hasCheckedAuth) {
    dispatch(getCurrentUser()) // Check if user is logged in
      .then(() => setHasCheckedAuth(true));
  }
}, [user, isLoading, hasCheckedAuth]);
```

### **Protected Routes**

```javascript
const ProtectedRoutes = ({ children, roles }) => {
  const { user, isLoading } = useSelector((state) => state.user);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!user && !isLoading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      dispatch(getCurrentUser()).then(() => {
        setHasCheckedAuth(true);
      });
    }
  }, [dispatch, user, isLoading, hasCheckedAuth]);

  // Show loading while checking authentication
  if (isLoading || (!user && !hasCheckedAuth)) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user && hasCheckedAuth) {
    return <Navigate to="/activate-account?form=login" replace />;
  }

  // Check role-based access
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/index" replace />;
  }

  return children;
};
```

### **Role-Based Access Control**

```javascript
// Route protection by role
<Routes>
  <Route
    path="/index"
    element={
      <ProtectedRoutes>
        <SharedLayout />
      </ProtectedRoutes>
    }
  >
    <Route index element={<Home />} />
    <Route
      path="all-expenses"
      element={
        <ProtectedRoutes roles={["manager"]}>
          <GetExpenses />
        </ProtectedRoutes>
      }
    />
    <Route
      path="pending-expenses"
      element={
        <ProtectedRoutes roles={["manager"]}>
          <PendingExpenses />
        </ProtectedRoutes>
      }
    />
  </Route>
</Routes>
```

---

## API Integration

### **HTTP Client Configuration**

```javascript
// Axios instance with interceptors
const customFetch = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor (optional logging)
customFetch.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
customFetch.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      dispatch(logout());
      navigate("/activate-account?form=login");
    }
    return Promise.reject(error);
  }
);
```

### **API Thunk Patterns**

```javascript
// Standard thunk pattern
export const fetchDataThunk = createAsyncThunk(
  "feature/fetchData",
  async (params, thunkAPI) => {
    try {
      const response = await customFetch.get("/endpoint", { params });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.msg || "Request failed"
      );
    }
  }
);

// Thunk with loading states
const featureSlice = createSlice({
  name: "feature",
  initialState: { data: [], isLoading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDataThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDataThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchDataThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});
```

### **URL Synchronization**

```javascript
// Sync search parameters with URL
const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchParams: reduxParams } = useSelector((state) => state.expense);

  const handleApplySearch = () => {
    const filteredParams = filterEmpty(reduxParams);
    setSearchParams(filteredParams, { replace: true });
    dispatch(getExpenses(filteredParams));
  };

  const clearSearch = () => {
    dispatch(clearSearchParams());
    setSearchParams({}, { replace: true });
    dispatch(getExpenses());
  };
};
```

---

## Routing & Navigation

### **Route Structure**

```javascript
// Main routing configuration
<BrowserRouter>
  <Routes>
    <Route path="/activate-account" element={<ActivateAccount />} />
    <Route path="/error" element={<ErrorPage />} />
    <Route
      path="/index"
      element={
        <ProtectedRoutes>
          <SharedLayout />
        </ProtectedRoutes>
      }
    >
      <Route index element={<Home />} />
      <Route
        path="all-expenses"
        element={
          <ProtectedRoutes roles={["manager"]}>
            <GetExpenses />
          </ProtectedRoutes>
        }
      />
      <Route path="add-expense" element={<AddExpenses />} />
      <Route path="my-expenses" element={<GetExpenses />} />
      <Route
        path="pending-expenses"
        element={
          <ProtectedRoutes roles={["manager"]}>
            <PendingExpenses />
          </ProtectedRoutes>
        }
      />
      <Route path="resolved-expenses" element={<ResolvedExpenses />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### **Navigation Components**

```javascript
// Sidebar navigation with role-based links
const NavLinks = ({ isBigSidebar }) => {
  const { user } = useSelector((state) => state.user);
  const location = useLocation();

  const commonLinks = [
    { text: "Home", path: "/index", icon: <FaHome /> },
    { text: "My Expenses", path: "/index/my-expenses", icon: <FaReceipt /> },
    { text: "Add Expense", path: "/index/add-expense", icon: <FaPlus /> },
  ];

  const managerLinks = [
    { text: "All Expenses", path: "/index/all-expenses", icon: <FaList /> },
    {
      text: "Pending Approvals",
      path: "/index/pending-expenses",
      icon: <FaClock />,
    },
    {
      text: "Resolved Expenses",
      path: "/index/resolved-expenses",
      icon: <FaCheckCircle />,
    },
  ];

  const allLinks =
    user?.role === "manager" ? [...commonLinks, ...managerLinks] : commonLinks;

  return (
    <div className="nav-links">
      {allLinks.map((link) => (
        <NavLink
          key={link.text}
          to={link.path}
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="icon">{link.icon}</span>
          {isBigSidebar && <span className="text">{link.text}</span>}
        </NavLink>
      ))}
    </div>
  );
};
```

---

## Styling & Theming

### **Tailwind CSS Configuration**

```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          500: "#3b82f6",
          900: "#1e3a8a",
        },
        gray: {
          50: "#f9fafb",
          900: "#111827",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
```

### **Theme Context Implementation**

```javascript
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### **Component Styling Patterns**

```javascript
// Theme-aware component styling
const ExpenseCard = ({ expense }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700
      rounded-lg p-4 shadow-sm
      hover:shadow-md transition-shadow
    `}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`
          px-2 py-1 rounded-full text-xs font-medium
          ${
            expense.status === "approved"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : expense.status === "rejected"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }
        `}
        >
          {expense.status}
        </span>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          ${expense.amount}
        </span>
      </div>
    </div>
  );
};
```

---

## Performance Optimizations

### **Code Splitting**

```javascript
// Lazy loading for route components
const Home = lazy(() => import("./pages/dashboard/home"));
const AddExpenses = lazy(() => import("./pages/dashboard/addExpenses"));
const GetExpenses = lazy(() => import("./pages/dashboard/getExpenses"));

// Wrap routes with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/index" element={<Home />} />
    <Route path="/index/add-expense" element={<AddExpenses />} />
  </Routes>
</Suspense>;
```

### **Memoization**

```javascript
// Memoized components to prevent unnecessary re-renders
const ExpenseCard = memo(({ expense, onDelete, onEdit }) => {
  return <div className="expense-card">{/* Component content */}</div>;
});

// Memoized selectors
const selectExpensesByStatus = createSelector(
  [(state) => state.expense.expenses, (state, status) => status],
  (expenses, status) => expenses.filter((expense) => expense.status === status)
);
```

### **Optimistic Updates**

```javascript
// Optimistic UI updates with error rollback
const deleteExpense = createAsyncThunk(
  "expense/deleteExpense",
  async (id, thunkAPI) => {
    try {
      await customFetch.delete(`/expenses/${id}`);
      return id;
    } catch (error) {
      // Revert optimistic update on error
      const state = thunkAPI.getState();
      thunkAPI.dispatch(setExpenses(state.expense.previousExpenses));
      return thunkAPI.rejectWithValue(error.response?.data?.msg);
    }
  }
);
```

---

## Testing Strategy

### **Test Setup**

```javascript
// test-utils.js - Custom render function
const customRender = (
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: { user: userSlice, expense: expenseSlice },
      preloadedState,
    }),
    ...renderOptions
  } = {}
) => {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter>
          <ThemeProvider>{children}</ThemeProvider>
        </MemoryRouter>
      </Provider>
    );
  }
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock axios
jest.mock("../utils/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
```

### **Component Testing**

```javascript
// Example component test
describe("ExpenseCard", () => {
  const mockExpense = {
    _id: "1",
    amount: 100,
    description: "Test expense",
    status: "pending",
  };

  it("renders expense information correctly", () => {
    render(<ExpenseCard expense={mockExpense} />);

    expect(screen.getByText("$100")).toBeInTheDocument();
    expect(screen.getByText("Test expense")).toBeInTheDocument();
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", () => {
    const mockOnDelete = jest.fn();
    render(<ExpenseCard expense={mockExpense} onDelete={mockOnDelete} />);

    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(mockOnDelete).toHaveBeenCalledWith("1");
  });
});
```

### **Redux Testing**

```javascript
// Redux slice testing
describe("expenseSlice", () => {
  it("should handle getExpenses.fulfilled", () => {
    const initialState = {
      expenses: [],
      isLoading: true,
      pagination: null,
    };

    const mockPayload = {
      expenses: [{ _id: "1", amount: 100 }],
      pagination: { currentPage: 1, totalPages: 1 },
    };

    const action = getExpenses.fulfilled(mockPayload);
    const newState = expenseSlice.reducer(initialState, action);

    expect(newState.expenses).toEqual(mockPayload.expenses);
    expect(newState.isLoading).toBe(false);
    expect(newState.pagination).toEqual(mockPayload.pagination);
  });
});
```

---

## Deployment Guide

### **Build Process**

```bash
# Install dependencies
npm install

# Run tests
npm test -- --coverage --watchAll=false

# Create production build
npm run build

# Verify build
ls -la build/
```

### **AWS S3 Deployment**

```bash
# Create S3 bucket
aws s3 mb s3://your-expense-portal-frontend

# Configure for static website hosting
aws s3 website s3://your-expense-portal-frontend \
  --index-document index.html \
  --error-document index.html

# Upload build files
aws s3 sync build/ s3://your-expense-portal-frontend --delete

# Set bucket policy for public read
aws s3api put-bucket-policy --bucket your-expense-portal-frontend \
  --policy file://bucket-policy.json
```

### **CloudFront Configuration**

```json
{
  "Origins": {
    "DomainName": "your-expense-portal-frontend.s3-website-us-east-1.amazonaws.com",
    "OriginPath": "",
    "CustomOriginConfig": {
      "HTTPPort": 80,
      "HTTPSPort": 443,
      "OriginProtocolPolicy": "http-only"
    }
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-Website",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "CachePolicyId": "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
  },
  "CustomErrorResponses": [
    {
      "ErrorCode": 403,
      "ResponseCode": 200,
      "ResponsePagePath": "/index.html"
    },
    {
      "ErrorCode": 404,
      "ResponseCode": 200,
      "ResponsePagePath": "/index.html"
    }
  ]
}
```

### **Environment Configuration**

```bash
# Production environment variables
REACT_APP_API_URL=https://api.yourdomain.com/api/v1
GENERATE_SOURCEMAP=false
```

### **CI/CD Pipeline**

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main]
    paths: ["client/**"]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"
          cache-dependency-path: client/package-lock.json

      - name: Install dependencies
        run: |
          cd client
          npm ci

      - name: Run tests
        run: |
          cd client
          npm test -- --coverage --watchAll=false

      - name: Build application
        run: |
          cd client
          npm run build
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}

      - name: Deploy to S3
        run: |
          aws s3 sync client/build/ s3://your-bucket-name --delete
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

---

## Best Practices

### **Code Organization**

- Keep components small and focused
- Use custom hooks for reusable logic
- Implement proper error boundaries
- Follow consistent naming conventions

### **Performance**

- Implement code splitting for large applications
- Use React.memo for expensive components
- Optimize bundle size with tree shaking
- Implement lazy loading for routes

### **Security**

- Never store sensitive data in localStorage
- Validate all user inputs
- Use HTTPS in production
- Implement proper CORS policies

### **Accessibility**

- Use semantic HTML elements
- Implement ARIA labels and roles
- Ensure keyboard navigation
- Test with screen readers

---

## Troubleshooting

### **Common Issues**

1. **Authentication Issues**

   - Check if backend is running
   - Verify CORS configuration
   - Ensure cookies are being sent

2. **Build Failures**

   - Clear node_modules and package-lock.json
   - Check for TypeScript errors
   - Verify environment variables

3. **Routing Issues**
   - Configure CloudFront error pages
   - Check base URL configuration
   - Verify React Router setup

### **Debug Tools**

- React Developer Tools
- Redux DevTools Extension
- Network tab for API calls
- Console for error messages

---

**© 2025 John Deere. All rights reserved.**
