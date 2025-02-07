import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Alert, Nav, Navbar, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function ProjectManagement() {
  const [memberProjects, setMemberProjects] = useState([]); // Projects the member has access to
  const [allProjects, setAllProjects] = useState([]); // List of all projects
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Fetch member projects and available projects
  useEffect(() => {
    fetchMemberProjects();
    fetchAllProjects();
  }, []);

  // Fetch projects the member has access to
  const fetchMemberProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/member-projects");
      setMemberProjects(response.data.projects);
    } catch (error) {
      setError("Failed to fetch member projects");
    }
  };

  // Fetch all available projects
  const fetchAllProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/projects");
      setAllProjects(response.data);
    } catch (error) {
      setError("Failed to fetch all projects");
    }
  };

  // Request access to a project
  const requestProjectAccess = async (projectId) => {
    try {
      const response = await axios.post("http://localhost:5000/request-access", { project_id: projectId });
      setSuccess(response.data.message);
      fetchMemberProjects(); // Refresh projects list
    } catch (error) {
      setError("Failed to request access");
    }
  };

  const handleProjectManagement = () => {
    navigate("/project-management"); // Navigate to the Project Management page
  };

  return (
    <Container fluid>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/member-home" className="d-flex align-items-center">
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
            <Nav.Link href="/logout-member">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Container className="mt-5">
        <Row>
          <Col md={6}>
            <h3>Your Projects</h3>
            {memberProjects.length > 0 ? (
              <ListGroup>
                {memberProjects.map((project) => (
                  <ListGroup.Item key={project.id_project}>
                    <strong>{project.name}</strong> - {project.description}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant="warning">You do not have access to any projects yet.</Alert>
            )}
          </Col>

          <Col md={6}>
            <h3>Request Project Access</h3>
            {allProjects.length > 0 ? (
              <ListGroup>
                {allProjects.map((project) => (
                  <ListGroup.Item key={project.id_project} className="d-flex justify-content-between align-items-center">
                    <span>
                      <strong>{project.name}</strong> - {project.description}
                    </span>
                    <Button variant="primary" onClick={() => requestProjectAccess(project.id_project)}>
                      Request Access
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant="info">No projects available.</Alert>
            )}
          </Col>
        </Row>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        {success && <Alert variant="success" className="mt-3">{success}</Alert>}
      </Container>
    </Container>
  );
}