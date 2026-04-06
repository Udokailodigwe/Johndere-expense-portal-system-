import { Link } from "react-router-dom";
import errorImage from "../assets/images/error-illustration.svg";

const Error = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto p-6 text-center">
        {/* Header */}
        <header className="mb-8 text-white">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-2xl">
              <span className="text-2xl font-bold text-white">JD</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">John Deere</h1>
              <p className="text-green-200 text-sm">
                Contractor & Driver Expense Portal
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Error Image */}
          <div className="mb-8">
            <img
              src={errorImage}
              alt="Error Illustration"
              className="mx-auto w-80 h-60 object-contain"
            />
          </div>

          {/* Error Message */}
          <div className="text-white mb-8">
            <h2 className="text-4xl font-bold mb-4 text-yellow-300">
              OOPS! Something went wrong
            </h2>
            <p className="text-xl text-white/90 mb-2">
              We can't seem to find the page you're looking for
            </p>
            <p className="text-lg text-white/80">
              Don't worry, our team has been notified and we're working on it
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/activate-account?form=login"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Back to Login
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-8 text-white/70 text-sm">
          <p>© 2025 John Deere. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default Error;
