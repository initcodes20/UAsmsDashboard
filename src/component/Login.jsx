import React, { useState } from "react";

const Login = ({ onLogin }) => {
  // Auto-fill with test credentials
  const [username, setUsername] = useState("ua-admin");
  const [password, setPassword] = useState("pranav-pandey");
  const [error, setError] = useState("");

  // Fixed credentials
  const FIXED_USERNAME = import.meta.env.VITE_FIXED_USERNAME;
  const FIXED_PASSWORD = import.meta.env.VITE_FIXED_PASSWORD;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Basic client-side validation check for empty fields
    if (!username || !password) {
        setError("Please enter both username and password.");
        return;
    }

    if (username === FIXED_USERNAME && password === FIXED_PASSWORD) {
      localStorage.setItem("isLoggedIn", "true"); // persist login
      onLogin(true);
    } else {
      setError("Invalid username or password. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form
        onSubmit={handleSubmit}
        // Increased max width, added rounded corners, and a more pronounced shadow
        className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-sm border border-gray-100 transition-all duration-300 hover:shadow-3xl"
      >
        <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Secure Login
            </h2>
            <p className="text-sm text-gray-500 mt-1">Admin Access Required</p>
            
            {/* Test Credentials Display */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
              <p className="text-xs font-semibold text-blue-800 mb-2">🔑 Test Credentials:</p>
              <div className="text-xs text-blue-700 space-y-1">
                <p><span className="font-medium">Username:</span> ua-admin</p>
                <p><span className="font-medium">Password:</span> pranav-pandey</p>
              </div>
            </div>
        </div>

        {/* Professional Error Message Box */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-5 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Username Field */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            // Enhanced input styling for a cleaner look
            className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Enter username"
            required
            autoFocus
          />
        </div>

        {/* Password Field */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // Enhanced input styling for a cleaner look
            className="w-full border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="••••••••"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          // Adjusted padding to py-2.5 for better height and visual balance
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Sign In
        </button>
        
        {/* Professional Branding Footer */}
        <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
                Powered by <strong className="text-red-500 font-semibold">Universe Adds</strong> | Built by <strong className="text-purple-600 font-semibold">InitCodes</strong>
            </p>
        </div>
      </form>
    </div>
  );
};

export default Login;