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
  const [currentCropId, setCurrentCropId] = useState(null); // Current crop being edited
  const [cropName, setCropName] = useState(''); // Crop name input

  // Fetch crop list on component mount
  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await axios.get('http://localhost:5000/crops');
        debugger;
        setCrops(response.data); // Set crop list in state
      } catch (error) { 
        console.error('Error fetching crops:', error);
      }
    };
    fetchCrops();
  }, []);

  const handleChange = (e) => {
    setCropName(e.target.value); // Update crop name state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cropName) {
      alert('Crop name cannot be empty');
      return;
    }

    if (isEditing) {
      // Update crop if in edit mode
      try {
        await axios.put(`http://localhost:5000/crops/${currentCropId}`, { name: cropName });
        alert('Crop updated successfully!');
        setCrops((prev) =>
          prev.map((crop) => (crop.id === currentCropId ? { ...crop, Name: cropName } : crop))
        );
        setIsEditing(false);
        setCropName('');
      } catch (error) {
        console.error('Error updating crop:', error);
        alert('Failed to update crop. Check console for details.');
      }
    } else {
      // Add new crop
      try {
        const response = await axios.post('http://localhost:5000/crops', { name: cropName });
        console.log('Crop Added:', response.data);
        alert('Crop added successfully!');
      } catch (error) {
        console.error('Error adding crop:', error);
        alert('Failed to add crop. Check console for details.');
      }
    }
  };

  const handleEdit = (crop) => {
    setIsEditing(true);
    setCurrentCropId(crop.id);
    setCropName(crop.Name);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCropName('');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/crops/${id}`);
      alert('Crop deleted successfully!');
      setCrops((prev) => prev.filter((crop) => crop.id !== id));
    } catch (error) {
      console.error('Error deleting crop:', error);
      alert('Failed to delete crop. Check console for details.');
    }
  };

  const handleTabSelect = (key) => {
    navigate(`/${key}`);
  };

  return (
    <Container fluid className="mt-4">
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-0">
            <Container>
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
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav">
                <Nav className="ms-auto">
                <Nav.Link href="#logout">Logout</Nav.Link>
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
                    <div className="form-section">
      <h2>Manage Crops</h2>
      <Form onSubmit={handleSubmit}>
        <Row className="align-items-center mb-3">
          <Col md={8}>
            <Form.Group controlId="formCropName">
              <Form.Label>Crop Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter crop name"
                value={cropName}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col md={4} className="d-flex">
            <Button variant="primary" type="submit" className="me-2">
              {isEditing ? 'Update Crop' : 'Add Crop'}
            </Button>
            {isEditing && (
              <Button variant="secondary" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </Col>
        </Row>
      </Form>
      </div>
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
              <td>{crop.Name}</td>
              <td>
                <Button variant="warning" className="me-2" onClick={() => handleEdit(crop)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDelete(crop.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
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