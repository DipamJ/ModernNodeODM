import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Alert, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProjectManagement() {
  const [memberProjects, setMemberProjects] = useState([]); // Projects the member has access to
  const [availableProjects, setAvailableProjects] = useState([]); // Projects available for request
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch member projects and available projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const memberResponse = await axios.get("http://localhost:5000/member-projects");
        setMemberProjects(memberResponse.data.projects || []);

        const availableResponse = await axios.get("http://localhost:5000/available-projects");
        setAvailableProjects(availableResponse.data.projects || []);
      } catch (error) {
        setError("Failed to fetch projects. Please try again.");
      }
    };
    fetchProjects();
  }, []);

  // Handle request for new project access
  const handleRequestAccess = async (projectId) => {
    try {
      const response = await axios.post("http://localhost:5000/request-project-access", {
        projectId,
      });
      alert(response.data.message);
    } catch (error) {
      setError("Failed to request project access. Please try again.");
    }
  };

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
        <Container className="mt-4">
        <h2>Project Management</h2>
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Member Projects */}
        <Row className="mt-4">
            <Col>
            <h4>Your Projects</h4>
            {memberProjects.length > 0 ? (
                <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Project Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {memberProjects.map((project) => (
                    <tr key={project.id_project}>
                        <td>{project.name}</td>
                        <td>{project.description}</td>
                        <td>Approved</td>
                    </tr>
                    ))}
                </tbody>
                </Table>
            ) : (
                <p>No projects assigned yet.</p>
            )}
            </Col>
        </Row>

        {/* Available Projects */}
        <Row className="mt-4">
            <Col>
            <h4>Request Access to New Projects</h4>
            {availableProjects.length > 0 ? (
                <Table striped bordered hover>
                <thead>
                    <tr>
                    <th>Project Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {availableProjects.map((project) => (
                    <tr key={project.id_project}>
                        <td>{project.name}</td>
                        <td>{project.description}</td>
                        <td>
                        <Button
                            variant="primary"
                            onClick={() => handleRequestAccess(project.id_project)}
                        >
                            Request Access
                        </Button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </Table>
            ) : (
                <p>No projects available for request.</p>
            )}
            </Col>
        </Row>
        </Container>
    </Container>
  );
}