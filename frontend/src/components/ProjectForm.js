import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Nav, Navbar, Tab, Tabs, Table, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';


export default function ProjectForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [editRowId, setEditRowId] = useState(null);
  const [editProject, setEditProject] = useState({});

  const [project, setProject] = useState({
      name: '', crop: '', plantingDate: '', harvestDate: '',
      description: '', centerLat: '', centerLng: '', minZoom: '',
      maxZoom: '', defaultZoom: '', visualizationPage: ''
  });

  const fetchProjects = async () => {
    try {
        const response = await axios.get('http://localhost:5000/projects');
        setProjects(response.data); // Set the fetched projects to state
    } catch (error) {
        console.error('Error fetching projects:', error);
    }
};

  useEffect(() => {
    fetchProjects();
}, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProject({ ...project, [name]: value });
    };

    const validateForm = () => {
      if (project.name.length > 1000) {
          alert('Project Name cannot exceed 1000 characters.');
          return false;
      }
      if (project.minZoom < 0 || project.maxZoom < 0 || project.defaultZoom < 0) {
          alert('Zoom values must be positive integers.');
          return false;
      }
      if (isNaN(project.centerLat) || isNaN(project.centerLng)) {
          alert('Latitude and Longitude must be valid decimal numbers.');
          return false;
      }
      return true;
  };

  const resetProjectForm = () => {
    setProject({
      name: '', crop: '', plantingDate: '', harvestDate: '',
      description: '', centerLat: '', centerLng: '', minZoom: '',
      maxZoom: '', defaultZoom: '', visualizationPage: '',
    });
  };  

  const handleSubmit = async (event, projectId = null) => {
    event.preventDefault();
    if (!validateForm()) return;
    const projectData = {
      name: project.name,
      crop: project.crop,
      plantingDate: project.plantingDate,
      harvestDate: project.harvestDate,
      description: project.description,
      centerLatitude: project.centerLat,
      centerLongitude: project.centerLng,
      minZoom: project.minZoom,
      maxZoom: project.maxZoom,
      defaultZoom: project.defaultZoom,
      visualizationPage: project.visualizationPage
    };
    try {
        const response = await axios.post('http://localhost:5000/projects', projectData);  // Corrected the route
        console.log('Project Added:', response.data);
        alert('Project added successfully!');
        setProjects((prevProjects) => [...prevProjects, response.data]);
        resetProjectForm();
        await fetchProjects();
    } catch (error) {
        console.error('Error adding project:', error);
        alert('Failed to add project. Check console for details.');
    }
  };

  const handleSave = async (event, proj) => {
    event.preventDefault();
    const updatedProject = {
      name: editProject.name || proj.Name,
      crop: editProject.crop || proj.Crop,
      plantingDate: editProject.plantingDate || proj.PlantingDate,
      harvestDate: editProject.harvestDate || proj.HarvestDate,
      description: editProject.description || proj.Description,
      centerLatitude: editProject.centerLat || proj.CenterLat,
      centerLongitude: editProject.centerLng || proj.CenterLng,
      minZoom: editProject.minZoom || proj.MinZoom,
      maxZoom: editProject.maxZoom || proj.MaxZoom,
      defaultZoom: editProject.defaultZoom || proj.DefaultZoom,
      visualizationPage: editProject.visualizationPage || proj.VisualizationPage,
    };

    try {
      await axios.put(`http://localhost:5000/projects/${proj.ID}`, updatedProject);
      alert('Project updated successfully!');
      setProjects((prev) =>
        prev.map((p) => (p.ID === proj.ID ? { ...p, ...updatedProject } : p))
      );
      setEditRowId(null); // Exit edit mode
      await fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Check console for details.');
    }
  };

const handleEditChange = (e, field) => {
    const { value } = e.target;
    setEditProject((prev) => ({ ...prev, [field]: value }));
  };  

  const handleEdit = (proj) => {
    setEditRowId(proj.ID);
    setIsEditing(true);
    setCurrentProjectId(proj.ID);
    setEditProject({
      name: proj.Name || '', 
      crop: proj.Crop || '', 
      plantingDate: proj.PlantingDate || '', 
      harvestDate: proj.HarvestDate || '', 
      description: proj.Description || '', 
      centerLat: proj.CenterLat || '', 
      centerLng: proj.CenterLng || '', 
      minZoom: proj.MinZoom || '', 
      maxZoom: proj.MaxZoom || '', 
      defaultZoom: proj.DefaultZoom || '', 
      visualizationPage: proj.VisualizationPage || ''
    });
  };  

  const handleCancel = () => {
    setEditRowId(null); // Exit edit mode without saving
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/projects/${id}`);
      alert('Project deleted successfully!');
      setProjects((prev) => prev.filter((proj) => proj.ID !== id));
      await fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Check console for details.');
    }
  };

  const handleTabSelect = (key) => {
    navigate(`/${key}`);
  };

    return (
        <Container fluid className="mt-4">
        {/* Primary Navbar */}
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 p-3 shadow-sm">
        <Container fluid>
          <Navbar.Brand href="/#" className="d-flex align-items-center">
            <img
              src={`${process.env.PUBLIC_URL}/logo.png`}
              width="40"
              height="40"
              className="d-inline-block align-top me-2"
              alt="West Texas Cotton Logo"
            />
            <span className="navbar-brand-text fs-5 fw-bold">West Texas Cotton</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Brand href="/dashboard">Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="/logout" className="text-light fw-semibold">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
        </Navbar>
            {/* Tabs Section */}
            {/* <Tabs defaultActiveKey="project" className="mb-3"> */}
            <Tabs
        activeKey={location.pathname.substring(1) || 'project'}
        onSelect={handleTabSelect}
        className="mb-3"
      >
                <Tab eventKey="project" title="Project">
                <Container className="container-custom">
                <h3 className="header-custom">Add Project</h3>
                        <Form onSubmit={handleSubmit}>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Project Name</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Enter project name"
                                            name="name"
                                            value={project.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Crop</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Enter crop type"
                                            name="crop"
                                            value={project.crop}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Planting Date</Form.Label>
                                        <Form.Control 
                                            type="date"
                                            name="plantingDate"
                                            value={project.plantingDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Harvest Date</Form.Label>
                                        <Form.Control 
                                            type="date"
                                            name="harvestDate"
                                            value={project.harvestDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Description</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={3}
                                    name="description"
                                    value={project.description}
                                    onChange={handleChange}
                                    placeholder="Enter project description"
                                />
                            </Form.Group>

                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Center Latitude</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Enter center latitude"
                                            name="centerLat"
                                            value={project.centerLat}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Center Longitude</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Enter center longitude"
                                            name="centerLng"
                                            value={project.centerLng}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Min Zoom</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            name="minZoom"
                                            value={project.minZoom}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Max Zoom</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            name="maxZoom"
                                            value={project.maxZoom}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Default Zoom</Form.Label>
                                        <Form.Control 
                                            type="number" 
                                            name="defaultZoom"
                                            value={project.defaultZoom}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-3">
                                <Form.Label>Visualization Page</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    placeholder="Enter visualization page URL"
                                    name="visualizationPage"
                                    value={project.visualizationPage}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100">
                               Add Project
                            </Button>
                        </Form>
                    <h3 className="mt-5">Project List</h3>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Crop</th>
            <th>Planting Date</th>
            <th>Harvest Date</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((proj) => (
            <tr key={proj.ID}>
              <td>{proj.ID}</td>
              <td>
                {editRowId === proj.ID ? (
                  <Form.Control
                    type="text"
                    value={editProject.name || ''}
                    onChange={(e) => handleEditChange(e, 'name')}
                  />
                ) : (
                  proj.Name
                )}
              </td>
              <td>
                {editRowId === proj.ID ? (
                  <Form.Control
                    type="text"
                    value={editProject.crop || ''}
                    onChange={(e) => handleEditChange(e, 'crop')}
                  />
                ) : (
                  proj.Crop
                )}
              </td>
              <td>
                {editRowId === proj.ID ? (
                  <Form.Control
                    type="date"
                    value={editProject.plantingDate || ''}
                    onChange={(e) => handleEditChange(e, 'plantingDate')}
                  />
                ) : (
                  proj.PlantingDate
                )}
              </td>
              <td>
                {editRowId === proj.ID ? (
                  <Form.Control
                    type="date"
                    value={editProject.harvestDate || ''}
                    onChange={(e) => handleEditChange(e, 'harvestDate')}
                  />
                ) : (
                  proj.HarvestDate
                )}
              </td>
              <td>
                {editRowId === proj.ID ? (
                  <Form.Control
                    as="textarea"
                    value={editProject.description || ''}
                    onChange={(e) => handleEditChange(e, 'description')}
                  />
                ) : (
                  proj.Description
                )}
              </td>
              <td>
                {editRowId === proj.ID ? (
                  <>
                    <Button
                      variant="success"
                      className="me-2"
                      onClick={(e) => handleSave(e, proj)}
                    >
                      Save
                    </Button>
                    <Button variant="secondary" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="warning"
                      className="me-2"
                      onClick={() => handleEdit(proj)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(proj.ID)}
                    >
                      Delete
                    </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          </Container>
                </Tab>
      <Tab eventKey="crop" title="Crop">
      <div className="form-section">
        <h2>Manage Crops</h2>
        <p>This section allows you to manage crop types.</p>
        {/* Add your crop management form or logic here */}
      </div>
    </Tab>

    <Tab eventKey="platform" title="Platform">
      <div className="form-section">
        <h2>Platform Management</h2>
        <p>Manage platforms associated with your projects.</p>
        {/* Add platform management form or logic */}
      </div>
    </Tab>

    <Tab eventKey="sensor" title="Sensor">
      <div className="form-section">
        <h2>Sensor Management</h2>
        <p>Manage sensors related to your projects.</p>
        {/* Add sensor management form or logic */}
      </div>
    </Tab>

    <Tab eventKey="flight" title="Flight">
      <div className="form-section">
        <h2>Flight Management</h2>
        <p>Manage flight data related to the projects.</p>
        {/* Add flight management logic */}
      </div>
    </Tab>

    <Tab eventKey="product-type" title="Product Type">
      <div className="form-section">
        <h2>Product Types</h2>
        <p>Manage product types for your projects.</p>
        {/* Add product type management logic */}
      </div>
    </Tab>

    <Tab eventKey="raw-data" title="Raw Data">
      <div className="form-section">
        <h2>Raw Data</h2>
        <p>Access additional tools and utilities here.</p>
      </div>
    </Tab>

    <Tab eventKey="data-product" title="Data Product">
      <div className="form-section">
        <h2>Data Product</h2>
        <p>Perform system-level administration tasks.</p>
      </div>
    </Tab>
            </Tabs>
        </Container>
    );
}