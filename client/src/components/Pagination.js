import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { getExpenses } from "../features/expense/expenseSlice";
import {
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
} from "react-icons/md";

const Pagination = ({ className = "", itemsPerPage = 10, onPageChange }) => {
  const { searchParams, pagination } = useSelector((state) => state.expense);
  const dispatch = useDispatch();
  const [, setUrlSearchParams] = useSearchParams();

  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, hasNextPage, hasPrevPage, totalItems } =
    pagination;

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;

    const updatedParams = {
      ...searchParams,
      page: newPage,
      limit: itemsPerPage,
    };

    // Update URL with new page parameters
    setUrlSearchParams(updatedParams, { replace: true });

    // Dispatch API call with updated parameters
    dispatch(getExpenses(updatedParams));
    onPageChange?.(newPage);
  };

  const getPageNumbers = () => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (currentPage <= half) {
      end = Math.min(totalPages, maxVisible);
    }
    if (currentPage > totalPages - half) {
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const buttonBase =
    "px-3 py-2 text-sm font-medium rounded-md transition-colors";
  const iconButtonBase =
    "p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 " +
    "dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 " +
    "disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
    >
      <div className="text-sm text-gray-700 dark:text-gray-300">
        Showing{" "}
        <span className="font-medium text-gray-900 dark:text-white">
          {startItem}-{endItem}
        </span>{" "}
        of{" "}
        <span className="font-medium text-gray-900 dark:text-white">
          {totalItems}
        </span>{" "}
        results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageChange(1)}
          disabled={!hasPrevPage}
          className={iconButtonBase}
          title="First page"
        >
          <MdFirstPage className="w-5 h-5" />
        </button>

        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className={iconButtonBase}
          title="Previous page"
        >
          <MdChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className={`${buttonBase} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="px-2 text-gray-500 dark:text-gray-400">…</span>
              )}
            </>
          )}

          {pageNumbers.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={
                pageNum === currentPage
                  ? `${buttonBase} bg-blue-600 text-white hover:bg-blue-700`
                  : `${buttonBase} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`
              }
            >
              {pageNum}
            </button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2 text-gray-500 dark:text-gray-400">…</span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`${buttonBase} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={iconButtonBase}
          title="Next page"
        >
          <MdChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={!hasNextPage}
          className={iconButtonBase}
          title="Last page"
        >
          <MdLastPage className="w-5 h-5" />
        </button>
      </div>

      {/* Items Per Page Selector */}
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700 dark:text-gray-300">
          Per page:
        </label>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            const newLimit = parseInt(e.target.value, 10);
            const updatedParams = { ...searchParams, page: 1, limit: newLimit };

            // Update URL with new limit parameters
            setUrlSearchParams(updatedParams, { replace: true });

            // Dispatch API call with updated parameters
            dispatch(getExpenses(updatedParams));
          }}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
