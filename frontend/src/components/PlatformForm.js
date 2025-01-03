import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table, Tabs, Tab, Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PlatformForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [platforms, setPlatforms] = useState([]);
  const [editRowId, setEditRowId] = useState(null);
  const [editPlatformName, setEditPlatformName] = useState('');
  const [newPlatformName, setNewPlatformName] = useState('');

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/platforms');
      setPlatforms(response.data);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const handleAddPlatform = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/platforms', { name: newPlatformName });
      setPlatforms([...platforms, response.data]);
      setNewPlatformName('');
      await fetchPlatforms();
    } catch (error) {
      console.error('Error adding platform:', error);
      alert('Failed to add platform.');
    }
  };

  const handleEdit = (platform) => {
    setEditRowId(platform.id_platform);
    setEditPlatformName(platform.name);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/platforms/${editRowId}`, { name: editPlatformName });
      setPlatforms((prev) =>
        prev.map((platform) => (platform.id_platform === editRowId ? { ...platform, name: editPlatformName } : platform))
      );
      setEditRowId(null);
      setEditPlatformName('');
      await fetchPlatforms();
    } catch (error) {
      console.error('Error updating platform:', error);
      alert('Failed to update platform.');
    }
  };

  const handleCancelEdit = () => {
    setEditRowId(null);
    setEditPlatformName('');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/platforms/${id}`);
      alert('Platform deleted successfully!');
      setPlatforms((prev) => prev.filter((platform) => platform.id_platform !== id));
      await fetchPlatforms();
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
          <Container className="container-custom">
            <h3 className="header-custom">Manage Platforms</h3>
            <Form onSubmit={handleAddPlatform}>
              <Row className="align-items-center mb-3">
                <Col md={8}>
                  <Form.Group controlId="formPlatformName">
                    <Form.Label>Platform Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter platform name"
                      value={newPlatformName}
                      onChange={(e) => setNewPlatformName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex">
                  <Button variant="primary" type="submit" className="me-2">
                    Add Platform
                  </Button>
                </Col>
              </Row>
            </Form>
            <h3 className="header-custom">Platform List</h3>
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
                  <tr key={platform.id_platform}>
                    <td>{platform.id_platform}</td>
                    <td>
                      {editRowId === platform.id_platform ? (
                        <Form.Control
                          type="text"
                          value={editPlatformName}
                          onChange={(e) => setEditPlatformName(e.target.value)}
                        />
                      ) : (
                        platform.name
                      )}
                    </td>
                    <td>
                      {editRowId === platform.id_platform ? (
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
                          <Button variant="warning" className="me-2" onClick={() => handleEdit(platform)}>
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => handleDelete(platform.id_platform)}>
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
