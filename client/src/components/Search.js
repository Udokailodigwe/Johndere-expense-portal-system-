import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getExpenses,
  handleSearchChange,
  clearSearchParams,
} from "../features/expense/expenseSlice";
import useOutsideClick from "../hooks/useOutsideClick";
import { filterEmpty } from "../utils/helpFunc";

const Search = () => {
  const { searchParams } = useSelector((state) => state.expense);
  const dispatch = useDispatch();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [, setUrlSearchParams] = useSearchParams();

  const searchRef = useOutsideClick(isSearchOpen, () => setIsSearchOpen(false));

  const handleSearch = (e) => {
    dispatch(
      handleSearchChange({ name: e.target.name, value: e.target.value })
    );
  };

  const handleApplySearch = () => {
    const filteredParams = filterEmpty(searchParams);

    // Update URL with search parameters
    setUrlSearchParams(filteredParams, { replace: true });

    dispatch(getExpenses(filteredParams));
    setIsSearchOpen(false);
  };

  const clearSearch = () => {
    dispatch(clearSearchParams());

    // Clear URL parameters
    setUrlSearchParams({}, { replace: true });

    dispatch(getExpenses());
    setIsSearchOpen(false);
  };

  return (
    <div className="hidden sm:block relative search-dropdown" ref={searchRef}>
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
      >
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="text-gray-500 dark:text-gray-400">
          Filter Expenses
        </span>
        <svg
          className="w-3 h-3 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isSearchOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Filter Expenses
            </h3>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Status
              </label>
              <select
                name="status"
                value={searchParams.status}
                onChange={handleSearch}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Category
              </label>
              <select
                name="category"
                value={searchParams.category}
                onChange={handleSearch}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="travel">Travel</option>
                <option value="meals">Meals</option>
                <option value="office_supplies">Office Supplies</option>
                <option value="equipment">Equipment</option>
                <option value="training">Training</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={searchParams.startDate}
                  onChange={handleSearch}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={searchParams.endDate}
                  onChange={handleSearch}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-3 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleApplySearch}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearSearch}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
