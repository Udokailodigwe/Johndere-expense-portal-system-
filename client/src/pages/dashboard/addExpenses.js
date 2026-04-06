import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdAttachMoney,
  MdDescription,
  MdCategory,
  MdCalendarToday,
  MdNote,
} from "react-icons/md";
import {
  createExpense,
  editExpense,
  handleInputValue,
  clearFormData,
} from "../../features/expense/expenseSlice";
import { validateExpenseForm } from "../../utils/validation";
import { categories } from "../../utils/helpFunc";
import { useEditExpenseForm } from "../../hooks/useEditExpenseForm";

const AddExpenses = () => {
  const { expenseId } = useParams();
  const {
    isLoading,
    formData: { amount, description, category, expenseDate, notes },
    expenses,
  } = useSelector((state) => state.expense);
  const { isEditMode, expenseData } = useEditExpenseForm(expenseId, expenses);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(handleInputValue({ name, value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      amount: amount.toString(),
      description,
      category,
      expenseDate: expenseDate.split("T")[0],
      notes,
    };
    if (validateExpenseForm(formData)) {
      if (isEditMode && expenseData) {
        dispatch(
          editExpense({
            id: expenseId,
            ...formData,
            amount: parseFloat(formData.amount),
          })
        );
        dispatch(clearFormData());
        navigate("/my-expenses");
      } else {
        dispatch(createExpense(formData));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? "Edit Expense" : "Add New Expense"}
        </h1>
        <p className="text-gray-600">
          {isEditMode
            ? "Update your expense information"
            : "Submit your expense for reimbursement"}
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Required Fields Note */}
        <div className="bg-blue-50 border-b border-blue-200 px-8 py-4">
          <p className="text-sm text-blue-800 flex items-center">
            <span className="text-red-500 mr-2">*</span>
            Fields marked with an asterisk are required
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Amount and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount Field */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <MdAttachMoney className="mr-2 text-green-600" />
                Amount
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">
                  $
                </span>
                <input
                  type="number"
                  name="amount"
                  value={amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Category Field */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700">
                <MdCategory className="mr-2 text-blue-600" />
                Category
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="category"
                value={category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <MdDescription className="mr-2 text-purple-600" />
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              value={description}
              onChange={handleInputChange}
              placeholder="Describe your expense..."
              rows={3}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
            />
            <div className="flex justify-end">
              <p className="text-gray-500 text-sm">
                {description.length}/500 characters
              </p>
            </div>
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <MdCalendarToday className="mr-2 text-orange-600" />
              Expense Date
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="date"
              name="expenseDate"
              value={expenseDate.split("T")[0]}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700">
              <MdNote className="mr-2 text-indigo-600" />
              Additional Notes
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="notes"
              value={notes}
              onChange={handleInputChange}
              placeholder="Any additional information about this expense..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
            />
            <div className="flex justify-end">
              <p className="text-gray-500 text-sm">
                {notes.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                onClick={() => navigate("/my-expenses")}
              >
                Cancel
              </button>
              {!isEditMode && (
                <button
                  type="button"
                  className="px-6 py-3 border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition-all duration-200 font-medium"
                  onClick={() => dispatch(clearFormData())}
                >
                  Clear Form
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? isEditMode
                    ? "Saving..."
                    : "Submitting..."
                  : isEditMode
                  ? "Save Changes"
                  : "Submit Expense"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">
          Tips for submitting expenses:
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Include receipts or supporting documentation</li>
          <li>• Provide clear descriptions for better processing</li>
          <li>• Select the most appropriate category</li>
          <li>• Double-check amounts before submitting</li>
        </ul>
      </div>
    </div>
  );
};

export default AddExpenses;
