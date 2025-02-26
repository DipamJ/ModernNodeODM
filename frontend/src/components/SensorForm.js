import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table, Tabs, Tab, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SensorForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sensors, setSensors] = useState([]); // State for sensor list
  const [newSensorName, setNewSensorName] = useState(''); // Sensor name input
  const [editSensorName, setEditSensorName] = useState('');
  const [editRowId, setEditRowId] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSensorName) {
      alert('Sensor name cannot be empty');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/sensors', { name: newSensorName });
      alert('Sensor added successfully!');
      setSensors([...sensors, response.data]);
      setNewSensorName('');
      await fetchSensors();
    } catch (error) {
      console.error('Error adding sensor:', error);
      alert('Failed to add sensor.');
    }
  };

  const handleEdit = (sensor) => {
    // setIsEditing(true);
    setEditRowId(sensor.id_sensor);
    setEditSensorName(sensor.name);
  };

  const handleSaveEdit = async () => {
    if (!editSensorName) {
      alert('Sensor name cannot be empty');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/sensors/${editRowId}`, { name: editSensorName });
      setSensors((prev) =>
        prev.map((sensor) =>
          sensor.id === editRowId ? { ...sensor, Name: editSensorName } : sensor
        )
      );
      setEditRowId(null);
      setEditSensorName('');
      await fetchSensors();
    } catch (error) {
      console.error('Error updating sensor:', error);
      alert('Failed to update sensor.');
    }
  };

  const handleCancelEdit = () => {
    setEditRowId(null);
    setEditSensorName('');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/sensors/${id}`);
      alert('Sensor deleted successfully!');
      setSensors((prev) => prev.filter((sensor) => sensor.ID !== id));
      await fetchSensors();
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
        <Container className="container-custom">
        <h3 className="header-custom">Manage Sensors</h3>
            <Form onSubmit={handleSubmit}>
              <Row className="align-items-center mb-3">
                <Col md={8}>
                  <Form.Group controlId="formSensorName">
                    <Form.Label>Sensor Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter sensor name"
                      value={newSensorName}
                      onChange={(e) => setNewSensorName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex">
                  <Button variant="primary" type="submit" className="me-2">
                    Add Sensor
                  </Button>
                </Col>
              </Row>
            </Form>
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
                <tr key={sensor.id_sensor}>
                  <td>{sensor.id_sensor}</td>
                  <td>
                      {editRowId === sensor.id_sensor ? (
                        <Form.Control
                          type="text"
                          value={editSensorName}
                          onChange={(e) => setEditSensorName(e.target.value)}
                        />
                      ) : (
                        sensor.name
                      )}
                    </td>
                    <td>
                      {editRowId === sensor.id_sensor ? (
                        <>
                          <Button
                            variant="success"
                            className="me-2"
                            onClick={handleSaveEdit}
                          >
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="warning"
                            className="me-2"
                            onClick={() => handleEdit(sensor)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(sensor.id_sensor)}
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
