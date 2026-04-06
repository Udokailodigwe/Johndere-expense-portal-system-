import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { employeeApprovals } from "../../features/approval/approvalSlice";
import { formatDate } from "../../utils/helpFunc";

const ResolvedExpenses = () => {
  const { resolvedExpenses, isLoading, error } = useSelector(
    (state) => state.approval
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(employeeApprovals());
  }, [dispatch]);

  const approvals = resolvedExpenses?.approvals || [];
  const statistics = resolvedExpenses?.statistics || {};
  const employee = resolvedExpenses?.employee || {};

  return (
    <div className="p-6">
      {isLoading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {resolvedExpenses && (
        <div className="resolved-expenses">
          <h2 className="text-2xl font-bold mb-4">Resolved Expenses</h2>

          {/* Employee Info */}
          {employee.role && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold">
                {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                : {employee.name}
              </h3>
              <p className="text-gray-600">{employee.email}</p>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h4 className="text-sm text-gray-600">Total Resolved</h4>
              <p className="text-2xl font-bold text-blue-600">
                {statistics.numOfTreatedExpenses || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h4 className="text-sm text-gray-600">Approved</h4>
              <p className="text-2xl font-bold text-green-600">
                {statistics.approvedCount || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h4 className="text-sm text-gray-600">Rejected</h4>
              <p className="text-2xl font-bold text-red-600">
                {statistics.rejectedCount || 0}
              </p>
            </div>
          </div>

          {/* Approvals List */}
          {approvals.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Approval History</h3>
              {approvals.map((approval) => (
                <div
                  key={approval._id}
                  className="bg-white p-4 rounded-lg shadow-sm border"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold">
                        {approval.expenseId?.description || "N/A"}
                      </h4>
                      <p className="text-gray-600">
                        Amount: ${approval.expenseId?.amount || 0}
                      </p>
                      <p className="text-gray-600">
                        Category: {approval.expenseId?.category || "N/A"}
                      </p>
                      <p className="text-gray-600">
                        Date:{" "}
                        {approval.expenseId?.expenseDate
                          ? formatDate(approval.expenseId.expenseDate)
                          : "N/A"}
                      </p>
                      {approval.rejectReason && (
                        <p className="text-red-600">
                          Reason: {approval.rejectReason}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          approval.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {approval.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        by {approval.managerId?.name || "Manager"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No resolved expenses found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResolvedExpenses;
