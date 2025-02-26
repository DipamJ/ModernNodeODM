import React from "react";
import { Container, Row, Col, Button, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <Container>
        <Row className="text-center mt-5">
          <Col>
            <h1>Welcome to the AI Based UAV Project</h1>
            <p className="mt-3">
              Streamline your project workflows with role-based access for Admins, Project Managers, and Members.
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center mt-5">
          <Col md={8} className="text-center">
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-basic" size="lg">
                Log In or Sign Up
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate("/login")}>
                  Admin Log In or Sign Up
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/login-pm")}>
                  Project Manager Log In or Sign Up
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/login-member")}>
                  Member Log In or Sign Up
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>

        <Row className="text-center mt-5">
          <Col>
            <p className="mt-3 text-muted">
              Need help? Visit our <a href="/help" className="help-link">Help Center</a> or contact support.
            </p>
          </Col>
        </Row>
      </Container>

      <footer className="footer mt-5 text-center">
        <p>&copy; 2025 ModernNodeODM. All Rights Reserved.</p>
      </footer>
    </div>
  );
}