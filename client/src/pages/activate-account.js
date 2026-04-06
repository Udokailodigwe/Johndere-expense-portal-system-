import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  activateAccount,
  login,
  getCurrentUser,
  clearTempUser,
} from "../features/user/userSlice";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const initialState = {
  email: "",
  code: "",
  password: "",
  confirmPassword: "",
  isRegistered: true,
};

const ActivateAccount = () => {
  const [values, setValues] = useState(initialState);
  const { isLoading } = useSelector((state) => state.user);
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const formParam = searchParams.get("form");

    // Set form state based on URL parameters
    if (formParam === "login") {
      setValues((prev) => ({ ...prev, isRegistered: false }));
    } else if (formParam === "activate-account") {
      setValues((prev) => ({ ...prev, isRegistered: true }));
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const { email, password, code, confirmPassword, isRegistered } = values;

    if (isRegistered) {
      if (!email || !code || !password || !confirmPassword) {
        toast.error("Please fill in all fields");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      dispatch(activateAccount({ email, code, password }));
      setTimeout(() => {
        dispatch(clearTempUser());
        navigate("/activate-account?form=login");
      }, 2000);
    } else {
      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      dispatch(login({ email, password })).then((result) => {
        if (result.type === "user/login/fulfilled") {
          dispatch(getCurrentUser()).then((userResult) => {
            if (userResult.type === "user/getCurrentUser/fulfilled") {
              navigate("/index");
            }
          });
        }
      });
    }
  };

  const toggleIsRegistered = () => {
    setValues({ ...values, isRegistered: !values.isRegistered });
    navigate(
      `/activate-account?form=${
        !values.isRegistered ? "activate-account" : "login"
      }`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        {/* Header */}
        <header className="text-center mb-8 text-white">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-2xl font-bold text-white">JD</span>
            </div>
            <h1 className="text-3xl font-bold drop-shadow-lg">
              John Deere Portal
            </h1>
          </div>
          <p className="text-lg opacity-90">
            {values.isRegistered ? "Activate Your Account" : "Welcome Back"}
          </p>
        </header>
        <main>
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-2xl mb-6 text-gray-800 font-semibold text-center">
              {values.isRegistered ? "Activate Your Account" : "Welcome Back"}{" "}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-800 placeholder-gray-500"
                  required
                />
              </div>
              {values.isRegistered && (
                <div>
                  <input
                    type="text"
                    name="code"
                    value={values.code}
                    onChange={handleInputChange}
                    placeholder="Enter verification code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-800 placeholder-gray-500"
                    required
                  />
                </div>
              )}

              <div>
                <input
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-800 placeholder-gray-500"
                  required
                />
              </div>

              {values.isRegistered && (
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-800 placeholder-gray-500"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-8 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-full uppercase tracking-wide shadow-lg hover:from-green-700 hover:to-green-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                {isLoading
                  ? values.isRegistered
                    ? "Activating..."
                    : "Logging in..."
                  : values.isRegistered
                  ? "Activate Account"
                  : "Login"}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={toggleIsRegistered}
                className="text-green-600 hover:text-green-700 transition-colors duration-200 font-medium"
              >
                {values.isRegistered
                  ? "Already have an account? Login here"
                  : "Just got your verification code? Activate your account here"}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => navigate("/register")}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                ← Registration Page
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-white/80 text-sm mt-8">
          <p>&copy; 2025 John Deere. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default ActivateAccount;
