import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table, Tabs, Tab, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SensorForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sensors, setSensors] = useState([]); // State for sensor list
  const [isEditing, setIsEditing] = useState(false); // Edit mode tracking
  const [currentSensorId, setCurrentSensorId] = useState(null); // Current sensor being edited
  const [sensorName, setSensorName] = useState(''); // Sensor name input

  // Fetch sensor list on component mount
  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/sensors');
      setSensors(response.data); // Set sensor list in state
    } catch (error) {
      console.error('Error fetching sensors:', error);
    }
  };

  const handleChange = (e) => {
    setSensorName(e.target.value); // Update sensor name state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sensorName) {
      alert('Sensor name cannot be empty');
      return;
    }

    if (isEditing) {
      try {
        await axios.put(`http://localhost:5000/sensors/${currentSensorId}`, { name: sensorName });
        alert('Sensor updated successfully!');
        setSensors((prev) =>
          prev.map((sensor) =>
            sensor.id === currentSensorId ? { ...sensor, Name: sensorName } : sensor
          )
        );
        setIsEditing(false);
        setSensorName('');
      } catch (error) {
        console.error('Error updating sensor:', error);
        alert('Failed to update sensor.');
      }
    } else {
      try {
        const response = await axios.post('http://localhost:5000/sensors', { name: sensorName });
        alert('Sensor added successfully!');
        setSensors([...sensors, response.data]);
        setSensorName('');
      } catch (error) {
        console.error('Error adding sensor:', error);
        alert('Failed to add sensor.');
      }
    }
  };

  const handleEdit = (sensor) => {
    setIsEditing(true);
    setCurrentSensorId(sensor.id);
    setSensorName(sensor.Name);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSensorName('');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/sensors/${id}`);
      alert('Sensor deleted successfully!');
      setSensors((prev) => prev.filter((sensor) => sensor.id !== id));
    } catch (error) {
      console.error('Error deleting sensor:', error);
      alert('Failed to delete sensor.');
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

      <Tabs activeKey={location.pathname.substring(1) || 'sensor'} onSelect={handleTabSelect} className="mb-3">
        <Tab eventKey="project" title="Project">
          <div className="form-section">
            <h2>Project Management</h2>
          </div>
        </Tab>
        <Tab eventKey="crop" title="Crop">
          <div className="form-section">
            <h2>Crop Management</h2>
          </div>
        </Tab>
        <Tab eventKey="platform" title="Platform">
      <div className="form-section">
        <h2>Platform Management</h2>
      </div>
    </Tab>
        <Tab eventKey="sensor" title="Sensor">
          <div className="form-section">
            <h2>Manage Sensors</h2>
            <Form onSubmit={handleSubmit}>
              <Row className="align-items-center mb-3">
                <Col md={8}>
                  <Form.Group controlId="formSensorName">
                    <Form.Label>Sensor Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter sensor name"
                      value={sensorName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex">
                  <Button variant="primary" type="submit" className="me-2">
                    {isEditing ? 'Update Sensor' : 'Add Sensor'}
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

          <h3>Sensor List</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Sensor Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map((sensor) => (
                <tr key={sensor.ID}>
                  <td>{sensor.ID}</td>
                  <td>{sensor.Name}</td>
                  <td>
                    <Button variant="warning" className="me-2" onClick={() => handleEdit(sensor)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(sensor.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
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
