import React from "react";
import AppRoutes from "./routes";
import "./App.css";
import { useMsal } from "@azure/msal-react";
import { Col, Container, Row } from "react-bootstrap";

const App: React.FC = () => {
  const { accounts } = useMsal();
  const isAuthenticated = accounts.length > 0;

  return (
    <>
      {!isAuthenticated && (
        <div className="auth-landing-page">
          <div className="auth-container">
            <div className="button-container">
              <AppRoutes />
            </div>
          </div>
        </div>
      )}
      {isAuthenticated && (
        <Container>
          <Row>
            <Col xs={12} id="page-content-wrapper">
              <AppRoutes />
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
};

export default App;
