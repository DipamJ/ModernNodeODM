import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Tabs, Tab, Navbar, Nav } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function DataProductForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [types, setTypes] = useState(['CHM', 'RGB Ortho']); // Example types
  const [searchFilters, setSearchFilters] = useState({
    project: 'All',
    platform: 'All',
    sensor: 'All',
    type: 'All',
  });
  const [unfinishedList, setUnfinishedList] = useState([]);
  const [finishedList, setFinishedList] = useState([]);

  // Fetch dropdown data and initialize lists
  useEffect(() => {
    fetchDropdownData();
    fetchUnfinishedList();
    fetchFinishedList();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const projectResponse = await axios.get('http://localhost:5000/projects');
      const platformResponse = await axios.get('http://localhost:5000/platforms');
      const sensorResponse = await axios.get('http://localhost:5000/sensors');

      setProjects(projectResponse.data);
      setPlatforms(platformResponse.data);
      setSensors(sensorResponse.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const fetchUnfinishedList = async () => {
    try {
      const response = await axios.get('http://localhost:5000/data-products/unfinished');
      setUnfinishedList(response.data);
    } catch (error) {
      console.error('Error fetching unfinished list:', error);
    }
  };

  const fetchFinishedList = async () => {
    try {
      const response = await axios.get('http://localhost:5000/data-products/finished');
      setFinishedList(response.data);
    } catch (error) {
      console.error('Error fetching finished list:', error);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get('http://localhost:5000/data-products/search', {
        params: searchFilters,
      });
      // Update lists based on response
      setFinishedList(response.data.finishedList);
      setUnfinishedList(response.data.unfinishedList);
    } catch (error) {
      console.error('Error performing search:', error);
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

      <Tabs activeKey={location.pathname.substring(1) || 'data-product'} onSelect={handleTabSelect} className="mb-3">
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
          <div className="form-section">
            <h2>Flight Management</h2>
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
          <Container className="container-custom">
            <h3 className="header-custom">Search</h3>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group controlId="searchProject">
                  <Form.Label>Project</Form.Label>
                  <Form.Select name="project" value={searchFilters.project} onChange={handleSearchChange}>
                    <option value="All">All</option>
                    {projects.map((project) => (
                      <option key={project.ID} value={project.ID}>{project.Name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="searchPlatform">
                  <Form.Label>Platform</Form.Label>
                  <Form.Select name="platform" value={searchFilters.platform} onChange={handleSearchChange}>
                    <option value="All">All</option>
                    {platforms.map((platform) => (
                      <option key={platform.ID} value={platform.ID}>{platform.Name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="searchSensor">
                  <Form.Label>Sensor</Form.Label>
                  <Form.Select name="sensor" value={searchFilters.sensor} onChange={handleSearchChange}>
                    <option value="All">All</option>
                    {sensors.map((sensor) => (
                      <option key={sensor.ID} value={sensor.ID}>{sensor.Name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="searchType">
                  <Form.Label>Type</Form.Label>
                  <Form.Select name="type" value={searchFilters.type} onChange={handleSearchChange}>
                    <option value="All">All</option>
                    {types.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Button variant="primary" onClick={handleSearch}>Search</Button>

            <h3 className="mt-5">Unfinished List</h3>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Project</th>
                </tr>
              </thead>
              <tbody>
                {unfinishedList.map((item) => (
                  <tr key={item.ID}>
                    <td>{item.FileName}</td>
                    <td>{item.Size}</td>
                    <td>{item.Type}</td>
                    <td>{item.Project}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <h3 className="mt-5">Finished List</h3>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Project</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {finishedList.map((item) => (
                  <tr key={item.ID}>
                    <td>{item.FileName}</td>
                    <td>{item.Size}</td>
                    <td>{item.Type}</td>
                    <td>{item.Project}</td>
                    <td>
                      <Button variant="danger" className="me-2">Delete</Button>
                      <Button variant="info" className="me-2">Link</Button>
                      <Button variant="primary">Download</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Container>
        </Tab>
      </Tabs>
    </Container>
  );
}