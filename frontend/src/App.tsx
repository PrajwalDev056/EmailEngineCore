import React from "react";
import AppRoutes from "./routes";
import "./App.css";
import { useMsal } from "@azure/msal-react";
import { Container, Grid, Box } from "@mui/material";

const App: React.FC = () => {
  const { accounts } = useMsal();
  const isAuthenticated = accounts.length > 0;

  return (
    <>
      {!isAuthenticated && (
        <Box className="auth-landing-page">
          <Box className="auth-container">
            <Box className="button-container">
              <AppRoutes />
            </Box>
          </Box>
        </Box>
      )}
      {isAuthenticated && (
        <Container>
          <Grid container>
            <Grid item xs={12} id="page-content-wrapper">
              <AppRoutes />
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  );
};

export default App;
