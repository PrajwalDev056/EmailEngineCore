import React from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";

/**
 * Home component
 * This component serves as the landing page for the application.
 * It displays a welcome message and provides options to login or sync emails.
 */
const Home: React.FC = () => {
  const { accounts } = useMsal();
  const navigate = useNavigate();
  const isAuthenticated = accounts.length > 0;

  /**
   * Handles the login process by navigating to the add-account page.
   */
  const handleLogin = () => {
    navigate("/add-account");
  };

  /**
   * Handles the email synchronization process by navigating to the emails page.
   */
  const handleEmailSync = () => {
    navigate("/emails");
  };

  return (
    <div className="container auth-btn-container">
      <h1 className="app-title">Email Engine Core</h1>
      {isAuthenticated ? (
        <>
          <div className="text-center">
            <p>Welcome: {accounts[0].username}</p>
          </div>
          <div className="text-center">
            <button onClick={handleEmailSync} className="btn btn-primary">
              Sync Email
            </button>
          </div>
        </>
      ) : (
        <>
          <button onClick={handleLogin} className="btn btn-primary">
            Login with Outlook
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
