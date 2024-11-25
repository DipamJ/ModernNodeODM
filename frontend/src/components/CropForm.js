import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Nav, Navbar, Tab, Tabs, Table, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CropForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [crops, setCrops] = useState([]); // State for crop list
  const [isEditing, setIsEditing] = useState(false); // Edit mode
  const [editRowId, setEditRowId] = useState(null); // Row ID being edited
  const [editCropName, setEditCropName] = useState(''); // Crop name for editing
  const [newCropName, setNewCropName] = useState('');

  const fetchCrops = async () => {
    try {
      const response = await axios.get('http://localhost:5000/crops');
      setCrops(response.data); // Set crop list in state
    } catch (error) {
      console.error('Error fetching crops:', error);
    }
  };

  // Fetch crop list on component mount
  useEffect(() => {
    fetchCrops();
  }, []);

  const handleAddCrop = async (e) => {
    e.preventDefault();
    if (!newCropName) {
      alert('Crop name cannot be empty');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/crops', { name: newCropName });
      setCrops([...crops, response.data]);
      setNewCropName('');
      await fetchCrops();
    } catch (error) {
      console.error('Error adding crop:', error);
      alert('Failed to add crop.');
    }
  };

  const handleEdit = (crop) => {
    // setIsEditing(true);
    setEditRowId(crop.ID);
    setEditCropName(crop.Name);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/crops/${editRowId}`, { name: editCropName });
      setCrops((prev) => prev.map((crop) => (crop.ID === editRowId ? { ...crop, Name: editCropName } : crop)));
      // setIsEditing(false);
      setEditRowId(null);
      setEditCropName('');
      await fetchCrops();
    } catch (error) {
      console.error('Error updating crop:', error);
      alert('Failed to update crop.');
    }
  };

  const handleCancelEdit = () => {
    // setIsEditing(false);
    setEditRowId(null);
    setEditCropName('');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/crops/${id}`);
      setCrops((prev) => prev.filter((crop) => crop.ID !== id));
      await fetchCrops();
    } catch (error) {
      console.error('Error deleting crop:', error);
      alert('Failed to delete crop.');
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
          <Navbar.Brand href="#" className="d-flex align-items-center">
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
    <Tabs activeKey={location.pathname.substring(1) || 'crop'} onSelect={handleTabSelect} className="mb-3">
     <Tab eventKey="project" title="Project">
      <div className="form-section">
      <h2>Add Project</h2>
      </div>
    </Tab>
    <Tab eventKey="crop" title="Crop">
          <Container className="container-custom">
            <h3 className="header-custom">Manage Crops</h3>
            <Form onSubmit={handleAddCrop}>
              <Row className="align-items-center mb-3">
                <Col md={8}>
                  <Form.Group controlId="formCropName">
                    <Form.Label>Crop Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter crop name"
                      value={newCropName}
                      onChange={(e) => setNewCropName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex">
                  <Button variant="primary" type="submit" className="me-2">
                    Add Crop
                  </Button>
                </Col>
              </Row>
            </Form>
            <h3>Crop List</h3>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Crop Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop) => (
                  <tr key={crop.ID}>
                    <td>{crop.ID}</td>
                    <td>
                      {editRowId === crop.ID ? (
                        <Form.Control
                          type="text"
                          value={editCropName}
                          onChange={(e) => setEditCropName(e.target.value)}
                        />
                      ) : (
                        crop.Name
                      )}
                    </td>
                    <td>
                      {editRowId === crop.ID ? (
                        <>
                          <Button variant="success" className="me-2" onClick={handleSaveEdit}>
                            Save
                          </Button>
                          <Button variant="secondary" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="warning" className="me-2" onClick={() => handleEdit(crop)}>
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => handleDelete(crop.ID)}>
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