import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { getAllApprovals } from "../../../features/approval/approvalSlice";
import { formatCurrency, formatDate } from "../../../utils/helpFunc";
import {
  MdAttachMoney,
  MdCategory,
  MdCalendarToday,
  MdPerson,
  MdCheckCircle,
} from "react-icons/md";

const AllResolvedExpenses = () => {
  const { allApprovals, isLoading, error } = useSelector(
    (state) => state.approval
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllApprovals());
  }, [dispatch]);

  // Extract data from the response
  const approvals = allApprovals?.approvals || [];
  const statistics = allApprovals?.statistics || {};

  return (
    <div className="p-6">
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {allApprovals && (
        <div className="all-resolved-expenses">
          <h2 className="text-2xl font-bold mb-6">All Resolved Expenses</h2>

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
              <h3 className="text-lg font-semibold">All Approval History</h3>
              {approvals.map((approval) => (
                <div
                  key={approval._id}
                  className="bg-white p-4 rounded-lg shadow-sm border"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <MdAttachMoney className="text-green-600" />
                          <span className="font-semibold text-lg">
                            {formatCurrency(approval.expenseId?.amount || 0)}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            approval.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {approval.status}
                        </span>
                      </div>

                      <h4 className="font-semibold text-lg mb-2">
                        {approval.expenseId?.description || "N/A"}
                      </h4>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <MdCategory className="text-gray-500" />
                          <span className="text-gray-600">
                            {approval.expenseId?.category || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MdCalendarToday className="text-gray-500" />
                          <span className="text-gray-600">
                            {approval.expenseId?.expenseDate
                              ? formatDate(approval.expenseId.expenseDate)
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <MdPerson className="text-gray-500" />
                        <span className="text-gray-600">
                          <span className="capitalize">
                            {approval.expenseId?.userId?.role}
                          </span>
                          : {approval.expenseId?.userId?.name || "N/A"}
                        </span>
                      </div>

                      {approval.rejectReason && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-red-700 font-medium">
                            Rejection Reason:
                          </p>
                          <p className="text-red-600">
                            {approval.rejectReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MdPerson className="text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Approved by: {approval.managerId?.name || "Manager"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {approval.date ? formatDate(approval.date) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MdCheckCircle className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No resolved expenses found
              </h3>
              <p className="text-gray-500">
                There are no approved or rejected expenses to display.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllResolvedExpenses;
