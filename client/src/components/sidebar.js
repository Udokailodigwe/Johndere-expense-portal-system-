import React, { useState } from "react";
import { MdClose, MdMenu } from "react-icons/md";
import NavLinks from "./navlinks";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors lg:hidden"
      >
        <MdMenu className="w-6 h-6" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white w-72 min-h-screen shadow-2xl border-r border-slate-700 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "lg:translate-x-0 -translate-x-full"
        } ${"lg:static fixed top-0 left-0 z-50"}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">JD</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-0 right-0 p-2 hover:bg-slate-700 rounded-lg transition-colors lg:hidden"
            >
              <MdClose className="w-6 h-6" />
            </button>
          </div>
          <h2 className="text-center text-lg font-bold text-white tracking-wide">
            Expense Reimbursement Portal
          </h2>
          <p className="text-center text-xs text-slate-400 mt-1">
            John Deere Portal
          </p>
        </div>

        {/* Navigation Section */}
        <div
          className="flex-1 p-4 overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <NavLinks />
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="text-center">
            <p className="text-xs text-slate-400">© 2024 John Deere</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
