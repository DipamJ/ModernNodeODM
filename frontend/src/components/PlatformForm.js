import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table, Tabs, Tab, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PlatformForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [platforms, setPlatforms] = useState([]); // State for platform list
  const [isEditing, setIsEditing] = useState(false); // Edit mode tracking
  const [currentPlatformId, setCurrentPlatformId] = useState(null); // Current platform being edited
  const [platformName, setPlatformName] = useState(''); // Platform name input

  // Fetch platform list on component mount
  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/platforms');
      debugger;
      setPlatforms(response.data); // Set platform list in state
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const handleChange = (e) => {
    setPlatformName(e.target.value); // Update platform name state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!platformName) {
      alert('Platform name cannot be empty');
      return;
    }

    if (isEditing) {
      try {
        // Update platform
        await axios.put(`http://localhost:5000/platforms/${currentPlatformId}`, { name: platformName });
        alert('Platform updated successfully!');
        setPlatforms((prev) =>
          prev.map((platform) =>
            platform.id === currentPlatformId ? { ...platform, Name: platformName } : platform
          )
        );
        setIsEditing(false);
        setPlatformName('');
      } catch (error) {
        console.error('Error updating platform:', error);
        alert('Failed to update platform.');
      }
    } else {
      try {
        // Add new platform
        const response = await axios.post('http://localhost:5000/platforms', { name: platformName });
        alert('Platform added successfully!');
        setPlatforms([...platforms, response.data]);
        setPlatformName('');
      } catch (error) {
        console.error('Error adding platform:', error);
        alert('Failed to add platform.');
      }
    }
  };

  const handleEdit = (platform) => {
    setIsEditing(true);
    setCurrentPlatformId(platform.id);
    setPlatformName(platform.Name);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPlatformName('');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/platforms/${id}`);
      alert('Platform deleted successfully!');
      setPlatforms((prev) => prev.filter((platform) => platform.id !== id));
    } catch (error) {
      console.error('Error deleting platform:', error);
      alert('Failed to delete platform.');
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

      <Tabs activeKey={location.pathname.substring(1) || 'platform'} onSelect={handleTabSelect} className="mb-3">
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
            <h2>Manage Platforms</h2>
            <Form onSubmit={handleSubmit}>
              <Row className="align-items-center mb-3">
                <Col md={8}>
                  <Form.Group controlId="formPlatformName">
                    <Form.Label>Platform Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter platform name"
                      value={platformName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex">
                  <Button variant="primary" type="submit" className="me-2">
                    {isEditing ? 'Update Platform' : 'Add Platform'}
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

          <h3>Platform List</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Platform Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map((platform) => (
                <tr key={platform.ID}>
                  <td>{platform.ID}</td>
                  <td>{platform.Name}</td>
                  <td>
                    <Button variant="warning" className="me-2" onClick={() => handleEdit(platform)}>
                      Edit
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(platform.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
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
