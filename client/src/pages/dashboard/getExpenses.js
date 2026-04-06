import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getExpenses,
  deleteExpense,
  handleSearchChange,
} from "../../features/expense/expenseSlice";
import ActiveStatus from "../../components/activeStatus";
import Pagination from "../../components/Pagination";
import {
  formatDate,
  formatCurrency,
  getCategoryIcon,
  getStatusColor,
} from "../../utils/helpFunc";
import {
  MdAttachMoney,
  MdDescription,
  MdNote,
  MdEdit,
  MdDelete,
  MdPending,
  MdCheckCircle,
  MdMoreVert,
  MdCancel,
} from "react-icons/md";

const GetExpenses = () => {
  const { expenses, totalExpenses, isLoading, searchParams } = useSelector(
    (state) => state.expense
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();

  // Read URL parameters on component mount and sync with Redux state
  useEffect(() => {
    const urlParams = Object.fromEntries(urlSearchParams.entries());

    // If there are URL parameters, update Redux state with them
    if (Object.keys(urlParams).length > 0) {
      Object.entries(urlParams).forEach(([key, value]) => {
        if (key === "page" || key === "limit") {
          dispatch(
            handleSearchChange({ name: key, value: parseInt(value, 10) })
          );
        } else {
          dispatch(handleSearchChange({ name: key, value }));
        }
      });

      // Fetch expenses with URL parameters
      dispatch(getExpenses(urlParams));
    } else {
      // No URL parameters, fetch with default parameters
      dispatch(getExpenses());
    }
  }, [dispatch, urlSearchParams]);

  const handleEditClick = (expense) => {
    navigate(`/edit-expense/${expense._id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Expenses
            </h1>
            <p className="text-gray-600">
              Track and manage your expense submissions
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">{totalExpenses}</p>
            <p className="text-sm text-gray-500">Total Expenses</p>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      <ActiveStatus searchParams={searchParams} />
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Amount Card - White */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="p-2 bg-blue-100 rounded-lg mx-auto mb-2 w-fit">
                <MdAttachMoney className="text-blue-600 text-lg" />
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Total Amount
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(
                  expenses.reduce((sum, expense) => sum + expense.amount, 0)
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Card - Yellow */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="p-2 bg-yellow-400 rounded-lg mx-auto mb-2 w-fit">
                <MdPending className="text-white text-lg" />
              </div>
              <p className="text-yellow-100 text-sm font-medium mb-1">
                Pending
              </p>
              <p className="text-xl font-bold">
                {
                  expenses.filter((expense) => expense.status === "pending")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        {/* Approved Card - Green */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="p-2 bg-green-400 rounded-lg mx-auto mb-2 w-fit">
                <MdCheckCircle className="text-white text-lg" />
              </div>
              <p className="text-green-100 text-sm font-medium mb-1">
                Approved
              </p>
              <p className="text-xl font-bold">
                {
                  expenses.filter((expense) => expense.status === "approved")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        {/* Rejected Card - Red */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="p-2 bg-red-400 rounded-lg mx-auto mb-2 w-fit">
                <MdCancel className="text-white text-lg" />
              </div>
              <p className="text-red-100 text-sm font-medium mb-1">Rejected</p>
              <p className="text-xl font-bold">
                {
                  expenses.filter((expense) => expense.status === "rejected")
                    .length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <MdAttachMoney className="text-3xl text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No expenses yet
          </h3>
          <p className="text-gray-500 mb-6">
            Start by adding your first expense
          </p>
          <button
            onClick={() => navigate("/add-expense")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Expense
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {expenses.map((expense) => (
            <div
              key={expense._id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {getCategoryIcon(expense.category)}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {expense.category}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          Expense Date: {formatDate(expense.expenseDate)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted: {formatDate(expense.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        expense.status
                      )}`}
                    >
                      {expense.status}
                    </span>
                    <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                      <MdMoreVert className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Amount
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-start space-x-2">
                    <MdDescription className="text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Description
                      </p>
                      <p className="text-gray-900 line-clamp-2">
                        {expense.description}
                      </p>
                    </div>
                  </div>
                </div>

                {expense.notes && (
                  <div className="mb-4">
                    <div className="flex items-start space-x-2">
                      <MdNote className="text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">
                          Notes
                        </p>
                        <p className="text-gray-700 text-sm line-clamp-2">
                          {expense.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditClick(expense)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <MdEdit className="text-lg" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => dispatch(deleteExpense(expense._id))}
                    >
                      <MdDelete className="text-lg" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-400">
                    ID: {expense._id.slice(-8)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-8">
        <Pagination />
      </div>
    </div>
  );
};

export default GetExpenses;
