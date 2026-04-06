import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  approveExpense,
  setRejectReason,
  setSelectedExpense,
  setRejectModalOpen,
  clearRejectData,
  setPendingExpenses,
} from "../../../features/approval/approvalSlice";
import { getAllEmployeeExpenses } from "../../../features/expense/expenseSlice";
import {
  formatCurrency,
  formatDate,
  getCategoryColor,
} from "../../../utils/helpFunc";
import {
  MdAttachMoney,
  MdDescription,
  MdCalendarToday,
  MdPerson,
  MdCheckCircle,
  MdCancel,
  MdPending,
  MdRefresh,
} from "react-icons/md";
import toast from "react-hot-toast";

const PendingExpenses = () => {
  const { allEmployeeExpenses, isLoading, error } = useSelector(
    (state) => state.expense
  );
  const {
    rejectReason,
    selectedExpense,
    isRejectModalOpen,
    pendingExpenses = [],
  } = useSelector((state) => state.approval);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllEmployeeExpenses());
  }, [dispatch]);

  useEffect(() => {
    const pending = (allEmployeeExpenses || []).filter(
      (expense) => expense.status === "pending"
    );
    dispatch(setPendingExpenses(pending));
  }, [allEmployeeExpenses, dispatch]);

  const onSubmit = (expenseId, status) => {
    if (status === "approved") {
      dispatch(approveExpense({ id: expenseId, status: "approved" }));
    } else if (status === "rejected") {
      if (!rejectReason.trim()) {
        toast.error("Please provide a reason for rejection");
        return;
      }
      dispatch(
        approveExpense({
          id: expenseId,
          status: "rejected",
          rejectReason: rejectReason.trim(),
        })
      );
      dispatch(clearRejectData());
    }
  };

  const openRejectModal = (expense) => {
    dispatch(setSelectedExpense(expense));
    dispatch(setRejectModalOpen(true));
    dispatch(setRejectReason(""));
  };

  const closeRejectModal = () => {
    dispatch(clearRejectData());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <MdRefresh className="animate-spin text-2xl text-blue-600" />
          <span className="text-lg text-gray-600">Loading expenses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MdCancel className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Expenses
          </h2>
          <p className="text-gray-600">{error}</p>
        </div>
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
              Expense Approvals
            </h1>
            <p className="text-gray-600">
              Review and approve pending expense requests
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200">
            <MdPending className="text-yellow-600 text-xl" />
            <span className="text-yellow-800 font-medium">
              {pendingExpenses.length} Pending
            </span>
          </div>
        </div>
      </div>

      {/* Pending Expenses List */}
      {(pendingExpenses?.length ?? 0) === 0 ? (
        <div className="text-center py-12">
          <MdCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            All Caught Up!
          </h3>
          <p className="text-gray-600">
            No pending expenses to review at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingExpenses?.map((expense) => (
            <div
              key={expense._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MdAttachMoney className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                          expense.category
                        )}`}
                      >
                        {expense.category.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSubmit(expense._id, "approved")}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
                    >
                      <MdCheckCircle className="text-lg" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => openRejectModal(expense)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                    >
                      <MdCancel className="text-lg" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <MdDescription className="text-gray-400 text-lg" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Description
                      </p>
                      <p className="text-gray-900">{expense.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MdCalendarToday className="text-gray-400 text-lg" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Expense Date
                      </p>
                      <p className="text-gray-900">
                        {formatDate(expense.expenseDate)}
                      </p>
                    </div>
                  </div>
                </div>

                {expense.notes && (
                  <div className="flex items-start space-x-3 mb-4">
                    <MdDescription className="text-gray-400 text-lg mt-1" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Notes</p>
                      <p className="text-gray-900">{expense.notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <MdPerson className="text-gray-400 text-lg" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Submitted by
                    </p>
                    <p className="text-gray-900">
                      {expense.userId?.name || "Unknown User"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reject Expense
              </h3>
              <button
                onClick={closeRejectModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdCancel className="text-xl" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Rejecting:{" "}
                <span className="font-medium">
                  {formatCurrency(selectedExpense?.amount)}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {selectedExpense?.description}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => dispatch(setRejectReason(e.target.value))}
                placeholder="Please provide a reason for rejecting this expense..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeRejectModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => onSubmit(selectedExpense._id, "rejected")}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Reject Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default PendingExpenses;
