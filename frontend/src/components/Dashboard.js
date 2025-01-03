import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Dropdown, Row, Col, Card } from 'react-bootstrap';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const handleSelectEssentialTools = (eventKey) => {
    if (eventKey === 'data-admin') {
      navigate('/project');  // Navigate to the Project page
    }
    // Add additional tool navigation here if needed
  };

  const handleSelectUserAdmin = (eventKey) => {
    if (eventKey === 'modify-roles') {
      navigate('/modify-roles');  // Navigate to Modify Roles page
    }
    if (eventKey === "modify-users") {
      navigate("/modify-users"); // Navigate to Modify Users page
    }
  };

  return (
    <Container fluid>
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
            <Dropdown onSelect={handleSelectEssentialTools} className="me-3">
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                Essential Tools
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="data-admin">Data Administration</Dropdown.Item>
                {/* Add more dropdown items for other tools */}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown onSelect={handleSelectUserAdmin} className="me-3">
              <Dropdown.Toggle variant="secondary" id="user-admin-dropdown">
                User Administration
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="modify-users">Modify Users</Dropdown.Item>
                <Dropdown.Item eventKey="modify-roles">Modify Roles</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link href="/logout">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container className="mt-4">
        <Row>
          <Col>
            <Card>
              <Card.Body>
                <Card.Title>Welcome to West-TX Cotton UASHub</Card.Title>
                <Card.Text>
                  This is the starting point after login. Use the navigation menu above to access essential tools.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
