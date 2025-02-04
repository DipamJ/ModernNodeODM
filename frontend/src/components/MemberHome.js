import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, Row, Col, Card } from "react-bootstrap";
import "./Dashboard.css";

export default function MemberHome() {
  const navigate = useNavigate();

  const handleProjectManagement = () => {
    navigate("/project-management"); // Navigate to the Project Management page
  };

  return (
    <Container fluid>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#" className="d-flex align-items-center">
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            width="40"
            height="40"
            className="d-inline-block align-top me-2"
            alt="West Texas Cotton Logo"
          />
          <span className="navbar-brand-text">West Texas Cotton</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link onClick={handleProjectManagement}>Project Management</Nav.Link>
            <Nav.Link href="/logout">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Welcome Card */}
      <Container className="mt-4">
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Welcome, Member</Card.Title>
                <Card.Text>
                  Use the navigation above to manage your projects or request access to new ones.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}