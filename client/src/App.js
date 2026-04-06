import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Register from "./pages/register";
import ActivateAccount from "./pages/activate-account";
import Error from "./pages/error";
import ToastNotification from "./assets/Toaster";
import SharedLayout from "./pages/dashboard/sharedLayout";
import AddExpenses from "./pages/dashboard/addExpenses";
import GetExpenses from "./pages/dashboard/getExpenses";
import Home from "./pages/dashboard/home";
import Settings from "./pages/dashboard/settings";
import ProtectedRoutes from "./pages/protectedRoutes";
import PendingExpenses from "./pages/dashboard/manager/pendingExpenses";
import ResolvedExpenses from "./pages/dashboard/resolvedExpenses";
import AllResolvedExpenses from "./pages/dashboard/manager/allResolvedExpenses";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoutes>
                <SharedLayout />
              </ProtectedRoutes>
            }
          >
            <Route
              path="pending-expenses"
              element={
                <ProtectedRoutes roles={["manager"]}>
                  <PendingExpenses />
                </ProtectedRoutes>
              }
            />
            <Route
              path="employees-resolved-expenses"
              element={
                <ProtectedRoutes roles={["manager"]}>
                  <AllResolvedExpenses />
                </ProtectedRoutes>
              }
            />
            <Route path="index" element={<Home />} />
            <Route path="add-expense" element={<AddExpenses />} />
            <Route path="edit-expense/:expenseId" element={<AddExpenses />} />
            <Route path="my-expenses" element={<GetExpenses />} />
            <Route path="resolved-expenses" element={<ResolvedExpenses />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="register" element={<Register />} />
          <Route path="activate-account" element={<ActivateAccount />} />
          <Route path="*" element={<Error />} />
        </Routes>
        <ToastNotification />
      </Router>
    </ThemeProvider>
  );
}

export default App;
