/**
 * Available expense categories with their display values and labels
 * Used for dropdowns and form validation throughout the application
 */
export const categories = [
  { value: "travel", label: "Travel" },
  { value: "meals", label: "Meals" },
  { value: "office_supplies", label: "Office Supplies" },
  { value: "equipment", label: "Equipment" },
  { value: "training", label: "Training" },
  { value: "other", label: "Other" },
];

/**
 * Formats a date string into a readable format (e.g., "Jan 15, 2024")
 * @param {string} dateString - ISO date string or valid date format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formats a numeric amount into USD currency format (e.g., "$1,234.56")
 * @param {number} amount - Numeric amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const categoryIcons = {
  travel: "✈️",
  meals: "🍽️",
  office_supplies: "📋",
  equipment: "💻",
  training: "🎓",
  other: "📄",
};

/**
 * Returns the corresponding emoji icon for an expense category
 * @param {string} category - Expense category (travel, meals, office_supplies, etc.)
 * @returns {string} Emoji icon for the category, defaults to "📄" for unknown categories
 */
export const getCategoryIcon = (category) => categoryIcons[category] || "📄";

const statusColors = {
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

/**
 * Returns Tailwind CSS classes for styling expense status badges
 * @param {string} status - Expense status (approved, rejected, pending)
 * @returns {string} Tailwind CSS classes for the status color scheme
 */
export const getStatusColor = (status) =>
  statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";

const categoryColors = {
  office_supplies: "bg-blue-100 text-blue-800",
  travel: "bg-green-100 text-green-800",
  meals: "bg-orange-100 text-orange-800",
  equipment: "bg-purple-100 text-purple-800",
  training: "bg-indigo-100 text-indigo-800",
  other: "bg-gray-100 text-gray-800",
};

/**
 * Returns Tailwind CSS classes for styling expense category badges
 * @param {string} category - Expense category (travel, meals, office_supplies, etc.)
 * @returns {string} Tailwind CSS classes for the category color scheme
 */
export const getCategoryColor = (category) =>
  categoryColors[category] || categoryColors.other;

/**
 * Calculates summary statistics from an array of expenses
 * @param {Array} expenses - Array of expense objects
 * @returns {Object} Object containing totalAmount, pending, approved, and rejected counts
 */
export const calculateStats = (expenses) => {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const pending = expenses.filter((exp) => exp.status === "pending").length;
  const approved = expenses.filter((exp) => exp.status === "approved").length;
  const rejected = expenses.filter((exp) => exp.status === "rejected").length;
  return { totalAmount, pending, approved, rejected };
};

/**
 * Processes expense data to create category-based chart data for pie charts
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Array of objects formatted for chart libraries (Nivo, Chart.js, etc.)
 */
export const processCategoryData = (expenses) => {
  const categoryTotals = expenses.reduce((acc, exp) => {
    const category = exp.category || "other";
    acc[category] = (acc[category] || 0) + exp.amount;
    return acc;
  }, {});

  const colors = {
    travel: "#10b981",
    meals: "#f59e0b",
    office_supplies: "#3b82f6",
    equipment: "#8b5cf6",
    training: "#ec4899",
    other: "#6b7280",
  };

  return Object.entries(categoryTotals).map(([category, value]) => ({
    id: category.replace(/_/g, " ").toUpperCase(),
    label: category.replace(/_/g, " ").toUpperCase(),
    value: value,
    color: colors[category] || "#6b7280",
  }));
};

/**
 * Processes expense statistics to create status-based chart data for pie charts
 * @param {Object} stats - Statistics object from calculateStats function
 * @returns {Array} Array of objects formatted for chart libraries, filtered to exclude zero values
 */
export const processStatusData = (stats) => {
  return [
    {
      id: "Pending",
      label: "Pending",
      value: stats.pending,
      color: "#fbbf24",
    },
    {
      id: "Approved",
      label: "Approved",
      value: stats.approved,
      color: "#10b981",
    },
    {
      id: "Rejected",
      label: "Rejected",
      value: stats.rejected,
      color: "#ef4444",
    },
  ].filter((item) => item.value > 0);
};

/**
 * Processes expense data to create monthly trend data for bar charts
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Array of objects with monthly data, limited to last 6 months
 */
export const processMonthlyData = (expenses) => {
  const monthlyTotals = expenses.reduce((acc, exp) => {
    const month = new Date(exp.expenseDate).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    if (!acc[month]) {
      acc[month] = { month, pending: 0, approved: 0, rejected: 0 };
    }
    acc[month][exp.status] += exp.amount;
    return acc;
  }, {});
  return Object.values(monthlyTotals).slice(-6);
};

/**
 * Filters out empty string values from an object, keeping only non-empty properties
 * @param {Object} obj - Object to filter
 * @returns {Object} New object with only non-empty string values
 */
export const filterEmpty = (obj) => {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== "") result[key] = obj[key];
  }
  return result;
};
