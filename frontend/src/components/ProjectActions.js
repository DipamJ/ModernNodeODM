import React from 'react';
import { Form, Button, Container,  Navbar, Nav, Dropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProjectActions() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const handleSelectEssentialTools = (eventKey) => {
    if (eventKey === 'data-admin') {
      navigate('/project');  // Navigate to the Project page
    }
    if (eventKey === 'project-access') {
        navigate('/project-access');
    }
  };

  return (
    <Container fluid>
        <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="homepage-pm" className="d-flex align-items-center">
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
                <Dropdown.Item eventKey="project-access">Project Access</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <Nav.Link href="/logout-pm">Logout</Nav.Link>
            </Nav>
        </Navbar.Collapse>
        </Navbar>

        <Container className="mt-4">
        <h3>Project Actions for Project ID: {projectId}</h3>
        <Button className="m-2" variant="primary" onClick={() => navigate(`/upload-raw-data/${projectId}`)}>
            Upload Raw Data
        </Button>
        <Button className="m-2" variant="secondary" onClick={() => navigate(`/generate-attributes/${projectId}`)}>
            Generate Attributes
        </Button>
        <Button className="m-2" variant="success" onClick={() => navigate(`/growth-analysis/${projectId}`)}>
            Growth Analysis
        </Button>
        </Container>
    </Container>
  );
}