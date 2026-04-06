import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getExpenses } from "../../features/expense/expenseSlice";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import {
  formatCurrency,
  calculateStats,
  processCategoryData,
  processStatusData,
  processMonthlyData,
} from "../../utils/helpFunc";
import {
  MdAttachMoney,
  MdTrendingUp,
  MdPending,
  MdCheckCircle,
} from "react-icons/md";

const Home = () => {
  const dispatch = useDispatch();
  const { expenses, isLoading, totalExpenses } = useSelector(
    (state) => state.expense
  );
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getExpenses());
  }, [dispatch]);

  const stats = useMemo(() => calculateStats(expenses), [expenses]);
  const categoryData = useMemo(() => processCategoryData(expenses), [expenses]);
  const statusData = useMemo(() => processStatusData(stats), [stats]);
  const monthlyData = useMemo(() => processMonthlyData(expenses), [expenses]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's an overview of your expense activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-50 text-sm font-medium mb-1">
                Total Amount
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>
            <MdAttachMoney className="text-4xl opacity-70" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-50 text-sm font-medium mb-1">
                Total Expenses
              </p>
              <p className="text-2xl font-bold">{totalExpenses}</p>
            </div>
            <MdTrendingUp className="text-4xl opacity-70" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-50 text-sm font-medium mb-1">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <MdPending className="text-4xl opacity-70" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-50 text-sm font-medium mb-1">
                Approved
              </p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
            <MdCheckCircle className="text-4xl opacity-70" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Expenses by Category
          </h3>
          {categoryData.length > 0 ? (
            <div style={{ height: "300px" }}>
              <ResponsivePie
                data={categoryData}
                margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ datum: "data.color" }}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor="#ffffff"
                valueFormat={(value) => `$${value.toLocaleString()}`}
                tooltip={({ datum }) => (
                  <div className="bg-white px-3 py-2 rounded shadow-lg border">
                    <strong>{datum.label}</strong>
                    <br />
                    <span className="text-gray-600">
                      {formatCurrency(datum.value)}
                    </span>
                  </div>
                )}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No data</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Expenses by Status
          </h3>
          {statusData.length > 0 ? (
            <div style={{ height: "300px" }}>
              <ResponsivePie
                data={statusData}
                margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={{ datum: "data.color" }}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: "color" }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor="#ffffff"
                tooltip={({ datum }) => (
                  <div className="bg-white px-3 py-2 rounded shadow-lg border">
                    <strong>{datum.label}</strong>
                    <br />
                    <span className="text-gray-600">
                      {datum.value} expenses
                    </span>
                  </div>
                )}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">No data</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Monthly Trends
        </h3>
        {monthlyData.length > 0 ? (
          <div style={{ height: "350px" }}>
            <ResponsiveBar
              data={monthlyData}
              keys={["pending", "approved", "rejected"]}
              indexBy="month"
              margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
              padding={0.3}
              colors={["#fbbf24", "#10b981", "#ef4444"]}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                legend: "Month",
                legendPosition: "middle",
                legendOffset: 40,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                legend: "Amount ($)",
                legendPosition: "middle",
                legendOffset: -50,
                format: (v) => `$${v}`,
              }}
              labelTextColor="#ffffff"
              legends={[
                {
                  dataFrom: "keys",
                  anchor: "bottom-right",
                  direction: "column",
                  translateX: 120,
                  itemWidth: 100,
                  itemHeight: 20,
                  symbolSize: 20,
                },
              ]}
              tooltip={({ id, value, indexValue, color }) => (
                <div className="bg-white px-3 py-2 rounded shadow-lg border">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ width: 12, height: 12, backgroundColor: color }}
                    />
                    <strong className="capitalize">{id}</strong>
                  </div>
                  <span className="text-gray-600">
                    {indexValue}: {formatCurrency(value)}
                  </span>
                </div>
              )}
            />
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No monthly data</div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Expenses
        </h3>
        {expenses.length > 0 ? (
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div
                key={expense._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">
                    {expense.description}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {expense.category.replace(/_/g, " ")} •{" "}
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-800">
                    {formatCurrency(expense.amount)}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      expense.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : expense.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {expense.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No recent expenses
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
