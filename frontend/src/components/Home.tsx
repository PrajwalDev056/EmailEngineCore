import React from "react";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";

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
    <Container className="auth-btn-container">
      <Typography variant="h1" className="app-title">Email Engine Core</Typography>
      {isAuthenticated ? (
        <Box textAlign="center">
          <Typography>Welcome: {accounts[0].username}</Typography>
          <Button onClick={handleEmailSync} variant="contained" color="primary">
            Sync Email
          </Button>
        </Box>
      ) : (
        <Button onClick={handleLogin} variant="contained" color="primary">
          Login with Outlook
        </Button>
      )}
    </Container>
  );
};

export default Home;
