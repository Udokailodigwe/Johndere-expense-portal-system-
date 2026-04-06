import { useDispatch } from "react-redux";
import {
  getExpenses,
  clearSearchParams,
} from "../features/expense/expenseSlice";

/**
 * ActiveStatus component displays current search filters and allows clearing them
 */
const ActiveStatus = ({ searchParams }) => {
  const dispatch = useDispatch();

  // Don't render if no filters are active
  if (!Object.values(searchParams).some((value) => value !== "")) {
    return null;
  }

  const handleClearFilters = () => {
    dispatch(clearSearchParams());
    dispatch(getExpenses());
  };

  return (
    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Active Filters:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              searchParams.status && {
                label: "Status",
                value: searchParams.status,
              },
              searchParams.category && {
                label: "Category",
                value: searchParams.category.replace(/_/g, " "),
              },
              searchParams.startDate && {
                label: "From",
                value: new Date(searchParams.startDate).toLocaleDateString(),
              },
              searchParams.endDate && {
                label: "To",
                value: new Date(searchParams.endDate).toLocaleDateString(),
              },
            ]
              .filter(Boolean) // remove null entries
              .map((filter, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                >
                  {filter.label}: {filter.value}
                </span>
              ))}
          </div>
        </div>

        <button
          onClick={handleClearFilters}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default ActiveStatus;
