import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Nav, Navbar, Tab, Tabs, Table} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

const defaultCenter = { lat: 27.7964, lng: -97.4030 }; //Default Corpus Christi

export default function ProjectForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [editRowId, setEditRowId] = useState(null);
  const [editProject, setEditProject] = useState({});
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [autocomplete, setAutocomplete] = useState(null);

  const [project, setProject] = useState({
      name: '', crop: '', plantingDate: '', harvestDate: '',
      description: '', centerLat: defaultCenter.lat, centerLng: defaultCenter.lng,
      minZoom: 17, maxZoom: 22, defaultZoom: 19, leaderId: localStorage.getItem('user_id'),
      seasonYear: new Date().getFullYear()  
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

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setMarkerPosition({ lat, lng });
    setProject({ ...project, centerLat: lat, centerLng: lng });
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
      name: '', crop: '', plantingDate: '', harvestDate: '', description: '', centerLat: defaultCenter.lat, centerLng: defaultCenter.lng,
      minZoom: 17, maxZoom: 22, defaultZoom: 19, leaderId: localStorage.getItem('user_id'), seasonYear: new Date().getFullYear()
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
      minZoom: 17,
      maxZoom: 22,
      defaultZoom: 19,
      visualizationPage: '',
      leader_id: localStorage.getItem('user_id'),
      seasonYear: project.seasonYear
    };
    try {
        const response = await axios.post('http://localhost:5000/projects', projectData);  // Corrected the route
        console.log('Project Added:', response.data);
        alert('Project added successfully!');
        setProjects([...projects, response.data]);
        resetProjectForm();
        resetProjectForm();
        await fetchProjects();
    } catch (error) {
        console.error('Error adding project:', error);
        alert('Failed to add project. Check console for details.');
    }
  };

  const handleSave = async (event, projId) => {
    event.preventDefault();    
    try {
      await axios.put(`http://localhost:5000/projects/${projId}`, editProject);
      alert('Project updated successfully!');
      setProjects(projects.map((p) => (p.id_project === projId ? { ...p, ...editProject } : p)));
      setEditRowId(null);
      fetchProjects();
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
    setEditRowId(proj.id_project);
    setIsEditing(true);
    setEditProject({ ...proj });
  }; 

  const handleCancel = () => {
    setEditRowId(null); // Exit edit mode without saving
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/projects/${id}`);
      alert('Project deleted successfully!');
      setProjects(projects.filter((proj) => proj.id_project !== id));
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Check console for details.');
    }
  };

  const handleTabSelect = (key) => {
    navigate(`/${key}`);
  };

  const onLoadAutocomplete = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMapCenter({ lat, lng });
        setMarkerPosition({ lat, lng });
        setProject({ ...project, centerLat: lat, centerLng: lng });
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  return (
    <Container fluid className="mt-4">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4 p-3 shadow-sm">
      <Container fluid>
        <Navbar.Brand href="/homepage-pm" className="d-flex align-items-center">
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
                          />
                      </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Season Year</Form.Label>
                      <Form.Control type="number" name="croppingYear" value={project.seasonYear} onChange={handleChange} required />
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
              <h5>Select Project Location</h5>
              <LoadScript
                googleMapsApiKey="AIzaSyB6ex-kEqQDcoRUKZpA6t9cDRYu_rOHjSI"
                libraries={['places']}
              >
                <Autocomplete onLoad={onLoadAutocomplete} onPlaceChanged={onPlaceChanged}>
                  <input
                    type="text"
                    placeholder="Search for a location"
                    style={{
                      boxSizing: `border-box`,
                      border: `1px solid transparent`,
                      width: `240px`,
                      height: `32px`,
                      padding: `0 12px`,
                      borderRadius: `3px`,
                      boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                      fontSize: `14px`,
                      outline: `none`,
                      textOverflow: `ellipses`,
                      marginBottom: '10px'
                    }}
                  />
                </Autocomplete>
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "300px" }}
                  zoom={8}
                  center={mapCenter}
                  onClick={handleMapClick}
                >
                  <Marker position={markerPosition} />
                </GoogleMap>
              </LoadScript>
              <p>Selected Coordinates: {project.centerLat}, {project.centerLng}</p>
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
                  <th>Season Year</th>
                  <th>Planting Date</th>
                  <th>Harvest Date</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj) => (
                  <tr key={proj.id_project}>
                    <td>{proj.id_project}</td>
                    <td>
                      {editRowId === proj.id_project ? (
                        <Form.Control
                          type="text"
                          value={editProject.name || ''}
                          onChange={(e) => handleEditChange(e, 'name')}
                        />
                      ) : (
                        proj.name
                      )}
                    </td>
                    <td>
                      {editRowId === proj.id_project ? (
                        <Form.Control
                          type="text"
                          value={editProject.crop || ''}
                          onChange={(e) => handleEditChange(e, 'crop')}
                        />
                      ) : (
                        proj.crop
                      )}
                    </td>
                    <td>
                      {editRowId === proj.id_project ? (
                        <Form.Control
                          type="number"
                          value={editProject.season_year || ''}
                          onChange={(e) => handleEditChange(e, 'seasonYear')}
                        />
                      ) : (
                        proj.season_year
                      )}
                    </td>
                    <td>
                      {editRowId === proj.id_project ? (
                        <Form.Control
                          type="date"
                          value={editProject.planting_date || ''}
                          onChange={(e) => handleEditChange(e, 'plantingDate')}
                        />
                      ) : (
                        proj.planting_date
                      )}
                    </td>
                    <td>
                      {editRowId === proj.id_project ? (
                        <Form.Control
                          type="date"
                          value={editProject.harvest_date || ''}
                          onChange={(e) => handleEditChange(e, 'harvestDate')}
                        />
                      ) : (
                        proj.harvest_date
                      )}
                    </td>
                    <td>
                      {editRowId === proj.id_project ? (
                        <Form.Control
                          type="number"
                          value={editProject.center_lattitude || ''}
                          onChange={(e) => handleEditChange(e, 'centerLatitude')}
                        />
                      ) : (
                        proj.center_lattitude
                      )}
                    </td>
                    <td>
                      {editRowId === proj.id_project ? (
                        <Form.Control
                          type="text"
                          value={editProject.center_longitude || ''}
                          onChange={(e) => handleEditChange(e, 'centerLongitude')}
                        />
                      ) : (
                        proj.center_longitude
                      )}
                    </td>
                    <td>
                      {editRowId === proj.id_project ? (
                        <Form.Control
                          as="textarea"
                          value={editProject.description || ''}
                          onChange={(e) => handleEditChange(e, 'description')}
                        />
                      ) : (
                        proj.description
                      )}
                    </td>
                    <td>
                      {editRowId === proj.id_project ? (
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
                            onClick={() => handleDelete(proj.id_project)}
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