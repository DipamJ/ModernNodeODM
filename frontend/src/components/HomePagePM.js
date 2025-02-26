import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Dropdown, Table, Button } from 'react-bootstrap';
import './Dashboard.css';
import axios from 'axios';

export default function HomePagePM() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const handleSelectEssentialTools = (eventKey) => {
    if (eventKey === 'data-admin') {
      navigate('/project');  // Navigate to the Project page
    }
    if (eventKey === 'project-access') {
        navigate('/project-access');
    }
  };

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await axios.get('http://localhost:5000/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    }
    fetchProjects();
  }, []);

  const handleProjectManage = (projectId) => {
    navigate(`/project-actions/${projectId}`);
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
        <h3>Your Projects</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Project Name</th>
              <th>Crop</th>
              <th>Season Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => (
              <tr key={proj.id_project}>
                <td>{proj.id_project}</td>
                <td>{proj.name}</td>
                <td>{proj.crop}</td>
                <td>{proj.season_year}</td>
                <td>
                  <Button variant="primary" onClick={() => handleProjectManage(proj.id_project)}>
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </Container>
  );
}