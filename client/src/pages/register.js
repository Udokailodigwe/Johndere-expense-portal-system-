import { useDispatch, useSelector } from "react-redux";
import { registerEmployee } from "../features/user/userSlice";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const initialState = {
  name: "",
  email: "",
};

const Landing = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.user);
  const [values, setValues] = useState(initialState);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const { name, email } = values;
    if (!name || !email) {
      toast.error("Please fill in all fields");
      return;
    }
    dispatch(registerEmployee({ name, email }));
  };

  useEffect(() => {
    if (user && !isLoading) {
      setTimeout(() => {
        navigate("/activate-account?form=activate-account");
      }, 2000);
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto p-5">
        {/* Header */}
        <header className="text-center mb-12 text-white">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"></div>
              <span className="text-3xl font-bold text-white drop-shadow-lg relative z-10">
                JD
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
              John Deere - Contractor & Driver Expense Management System
            </h1>
          </div>
          <p className="text-xl opacity-90 font-light mt-2">
            John Deere Contractor & Driver Expense Portal
          </p>
        </header>

        {/* Main Content */}
        <main className="text-center">
          <div className="mb-12 text-white">
            <h2 className="text-3xl md:text-4xl mb-4 drop-shadow-md">
              Welcome to John Deere Expense Portal
            </h2>
            <p className="text-lg opacity-90">
              Streamline your contractor and driver expense management
            </p>
          </div>

          {/* Registration Form */}
          <div className="flex justify-center mb-12">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-3 hover:shadow-3xl max-w-md w-full">
              <div className="text-5xl mb-4">👨‍💼</div>
              <h3 className="text-2xl mb-4 text-gray-800 font-semibold text-center">
                Employee Registration
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-center">
                Register as a John Deere employee to submit expense receipts
              </p>

              {/* Form Fields */}
              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  name="name"
                  value={values.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-800 placeholder-gray-500"
                />
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white text-gray-800 placeholder-gray-500"
                />
              </div>

              <button
                onClick={onSubmit}
                className="w-full py-4 px-8 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-full uppercase tracking-wide shadow-lg hover:from-green-700 hover:to-green-800 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Loading..."
                ) : (
                  <span className="relative z-10">Register as Employee</span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
              </button>
            </div>
          </div>

          {/* Login Link Section */}
          <div className="text-center mt-8">
            <p className="text-white/90 mb-2">Already have an account?</p>
            <button
              onClick={() => navigate("/activate-account?form=login")}
              className="text-white underline hover:text-yellow-200 transition-colors duration-200 font-medium"
            >
              Click here to login
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-white/80 text-sm mt-8">
          <p>&copy; 2024 John Deere. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
