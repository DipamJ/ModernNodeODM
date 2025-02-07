import React, { useState, useEffect } from "react";
import { Table, Button, Form, Alert, Container, Row, Col, Navbar, Nav, Dropdown } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ProjectAccessControl() {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  // Fetch the projects managed by the logged-in project manager
  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/managed-projects", { withCredentials: true });
      setProjects(response.data.projects);
    } catch (error) {
      setError("Failed to fetch projects.");
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/project-members", { withCredentials: true });
      setMembers(response.data.members);
    } catch (error) {
      setError("Failed to fetch members.");
    }
  };

  const handleApproval = async (memberId, projectId, status) => {
    try {
      const response = await axios.put(`http://localhost:5000/member-approval/${memberId}`, {
        project_id: projectId,
        status
      });
      setSuccess(response.data.message);
      fetchMembers();
    } catch (error) {
      setError("Failed to update approval status.");
    }
  };

  const handleRemoveMember = async (memberId, projectId) => {
    if (window.confirm("Are you sure you want to remove this member from the project?")) {
      try {
        const response = await axios.delete(`http://localhost:5000/remove-member/${memberId}/${projectId}`);
        setSuccess(response.data.message);
        fetchMembers();
      } catch (error) {
        setError("Failed to remove member.");
      }
    }
  };

  const handleSelectEssentialTools = (eventKey) => {
    if (eventKey === 'data-admin') {
      navigate('/project');
    }
    if (eventKey === 'project-access') {
        navigate('/project-access');
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
                <Dropdown.Item eventKey="project-access">Project Access</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link href="/logout-pm">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container className="mt-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Row>
          <Col>
            <h3>Managed Projects</h3>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id_project}>
                    <td>{project.name}</td>
                    <td>{project.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <h3>Member Access Requests & Management</h3>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Email</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id_user}>
                    <td>{member.first_name} {member.last_name}</td>
                    <td>{member.email}</td>
                    <td>{member.project_name}</td>
                    <td>{member.status}</td>
                    <td>
                      {member.status === "Pending" ? (
                        <>
                          <Button variant="success" className="me-2"
                            onClick={() => handleApproval(member.id_user, member.project_id, "Approved")}>
                            Approve
                          </Button>
                          <Button variant="danger"
                            onClick={() => handleApproval(member.id_user, member.project_id, "Disapproved")}>
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button variant="danger" onClick={() => handleRemoveMember(member.id_user, member.project_id)}>
                          Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
