import React, { useState, useEffect } from "react";
import Login from "./component/Login";
import AdminPanel from "./dashboard/AdminPanel";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("isLoggedIn");
    if (stored === "true") setIsLoggedIn(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? (
        <AdminPanel onLogout={handleLogout} />
      ) : (
        <Login onLogin={setIsLoggedIn} />
      )}
    </>
  );
};

export default App;
