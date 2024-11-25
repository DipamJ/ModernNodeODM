import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table, Tabs, Tab, Navbar, Nav } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FlightForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [flights, setFlights] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editFlight, setEditFlight] = useState({});
  
  const [newFlight, setNewFlight] = useState({
    name: '',
    date: '',
    altitude: '',
    forward: '',
    side: '',
    project: '',
    platform: '',
    sensor: ''
  });

  // Fetch data for dropdowns and flights list on component mount
  useEffect(() => {
    const fetchData = async () => {
      const projectResponse = await axios.get('http://localhost:5000/projects');
      const platformResponse = await axios.get('http://localhost:5000/platforms');
      const sensorResponse = await axios.get('http://localhost:5000/sensors');

      setProjects(projectResponse.data);
      setPlatforms(platformResponse.data);
      setSensors(sensorResponse.data);
    };

    fetchData();
    handleSearch();
  }, []);

  // Update search parameters
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setNewFlight((prev) => ({ ...prev, [name]: value }));
  };

  // Update new flight fields
  const handleNewFlightChange = (e) => {
    const { name, value } = e.target;
    setNewFlight((prev) => ({ ...prev, [name]: value }));
  };

  // Search flights based on project, platform, and sensor
  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:5000/flights');
      setFlights(response.data);
    } catch (error) {
      console.error('Error fetching flights:', error);
    }
  };

  // Add a new flight
  const handleAddFlight = async () => {
    try {
      const response = await axios.post('http://localhost:5000/flights', newFlight);
      alert('Flight added successfully!');
      setFlights((prev) => [...prev, response.data]);
      setNewFlight({
        name: '',
        date: '',
        altitude: '',
        forward: '',
        side: '',
        project: '',
        platform: '',
        sensor: ''
      });
      await handleSearch();
    } catch (error) {
      console.error('Error adding flight:', error);
      alert('Failed to add flight. Check console for details.');
    }
  };

  const handleEdit = (flight) => {
    setEditRowId(flight.ID);
    setEditFlight({
      name: flight.Name,
      date: flight.Date,
      altitude: flight.Altitude,
      forward: flight.Forward,
      side: flight.Side,
      project: flight.Project,
      platform: flight.Platform,
      sensor: flight.Sensor,
    });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/flights/${editRowId}`, editFlight);
      setFlights((prev) =>
        prev.map((flight) =>
          flight.ID === editRowId ? { ...flight, ...editFlight } : flight
        )
      );
      setEditRowId(null);
      setEditFlight({});
      alert('Flight updated successfully!');
      await handleSearch();
    } catch (error) {
      console.error('Error updating flight:', error);
      alert('Failed to update flight. Check console for details.');
    }
  };

  const handleCancelEdit = () => {
    setEditRowId(null);
    setEditFlight({});
  };

  const handleDeleteFlight = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/flights/${id}`);
      setFlights(flights.filter((flight) => flight.ID !== id));
      alert('Flight deleted successfully!');
      await handleSearch();
    } catch (error) {
      console.error('Error deleting flight:', error);
      alert('Failed to delete flight.');
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

      <Tabs activeKey={location.pathname.substring(1) || 'flight'} onSelect={handleTabSelect} className="mb-3">
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
        <h2>Sensor Management</h2>
      </div>
    </Tab>
        <Tab eventKey="flight" title="Flight">
        <Container className="container-custom">
        <h3 className="header-custom">Manage Flights</h3>
        <Row>
          <Col md={4}>
            <Form.Group controlId="flightProject">
              <Form.Label>Project</Form.Label>
              <Form.Control
                as="select"
                name="project"
                value={newFlight.project}
                onChange={handleSearchChange}
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project.ID} value={project.ID}>{project.Name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="flightPlatform">
              <Form.Label>Platform</Form.Label>
              <Form.Control
                as="select"
                name="platform"
                value={newFlight.platform}
                onChange={handleSearchChange}
              >
                <option value="">Select Platform</option>
                {platforms.map((platform) => (
                  <option key={platform.ID} value={platform.ID}>{platform.Name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="flightSensor">
              <Form.Label>Sensor</Form.Label>
              <Form.Control
                as="select"
                name="sensor"
                value={newFlight.sensor}
                onChange={handleSearchChange}
              >
                <option value="">Select Sensor</option>
                {sensors.map((sensor) => (
                  <option key={sensor.ID} value={sensor.ID}>{sensor.Name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
        <Button className="mt-3" onClick={handleSearch}>Search</Button>
      {/* Add Flight Section */}
      <div className="form-section mt-5">
        <h3>Add Flight</h3>
        <Row>
          <Col md={4}>
            <Form.Group controlId="flightName">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newFlight.name}
                onChange={handleNewFlightChange}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="flightDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={newFlight.date}
                onChange={handleNewFlightChange}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="flightAltitude">
              <Form.Label>Flight Altitude</Form.Label>
              <Form.Control
                type="number"
                name="altitude"
                value={newFlight.altitude}
                onChange={handleNewFlightChange}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="flightForward">
              <Form.Label>Forward Overlap</Form.Label>
              <Form.Control
                type="number"
                name="forward"
                value={newFlight.forward}
                onChange={handleNewFlightChange}
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="flightSide">
              <Form.Label>Side Overlap</Form.Label>
              <Form.Control
                type="number"
                name="side"
                value={newFlight.side}
                onChange={handleNewFlightChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <Button className="mt-3" onClick={handleAddFlight}>Add Flight</Button>
      </div>

      {/* Flight List Section */}
      <div className="form-section mt-5">
        <h3>Flight List</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Project</th>
              <th>Platform</th>
              <th>Sensor</th>
              <th>Date</th>
              <th>Altitude</th>
              <th>Forward Overlap</th>
              <th>Side Overlap</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr key={flight.ID}>
                {/* Flight Name */}
                <td>
                  {editRowId === flight.ID ? (
                    <Form.Control
                      type="text"
                      value={editFlight.name}
                      onChange={(e) => setEditFlight((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  ) : (
                    flight.Name
                  )}
                </td>

                {/* Project */}
                <td>
                  {editRowId === flight.ID ? (
                    <Form.Select
                      value={editFlight.project}
                      onChange={(e) => setEditFlight((prev) => ({ ...prev, project: e.target.value }))}
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project.ID} value={project.ID}>
                          {project.Name}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    flight.Project
                  )}
                </td>

                {/* Platform */}
                <td>
                  {editRowId === flight.ID ? (
                    <Form.Select
                      value={editFlight.platform}
                      onChange={(e) => setEditFlight((prev) => ({ ...prev, platform: e.target.value }))}
                    >
                      <option value="">Select Platform</option>
                      {platforms.map((platform) => (
                        <option key={platform.ID} value={platform.ID}>
                          {platform.Name}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    flight.Platform
                  )}
                </td>

                {/* Sensor */}
                <td>
                  {editRowId === flight.ID ? (
                    <Form.Select
                      value={editFlight.sensor}
                      onChange={(e) => setEditFlight((prev) => ({ ...prev, sensor: e.target.value }))}
                    >
                      <option value="">Select Sensor</option>
                      {sensors.map((sensor) => (
                        <option key={sensor.ID} value={sensor.ID}>
                          {sensor.Name}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    flight.Sensor
                  )}
                </td>

                {/* Date */}
                <td>
                  {editRowId === flight.ID ? (
                    <Form.Control
                      type="date"
                      value={editFlight.date}
                      onChange={(e) => setEditFlight((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  ) : (
                    flight.Date
                  )}
                </td>

                {/* Altitude */}
                <td>
                  {editRowId === flight.ID ? (
                    <Form.Control
                      type="number"
                      value={editFlight.altitude}
                      onChange={(e) => setEditFlight((prev) => ({ ...prev, altitude: e.target.value }))}
                    />
                  ) : (
                    flight.Altitude
                  )}
                </td>

                {/* Forward Overlap */}
                <td>
                  {editRowId === flight.ID ? (
                    <Form.Control
                      type="number"
                      value={editFlight.forward}
                      onChange={(e) => setEditFlight((prev) => ({ ...prev, forward: e.target.value }))}
                    />
                  ) : (
                    flight.Forward
                  )}
                </td>

                {/* Side Overlap */}
                <td>
                  {editRowId === flight.ID ? (
                    <Form.Control
                      type="number"
                      value={editFlight.side}
                      onChange={(e) => setEditFlight((prev) => ({ ...prev, side: e.target.value }))}
                    />
                  ) : (
                    flight.Side
                  )}
                </td>

                {/* Actions */}
                <td>
                  {editRowId === flight.ID ? (
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
                      <Button
                        variant="warning"
                        className="me-2"
                        onClick={() => handleEdit(flight)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteFlight(flight.ID)}
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
      </div>
      </Container>
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