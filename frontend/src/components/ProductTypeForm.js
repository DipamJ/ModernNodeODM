import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Table, Tabs, Tab, Navbar, Nav } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ProductTypeForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [productTypes, setProductTypes] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductType, setNewProductType] = useState('R'); // Default selection
  const [editRowId, setEditRowId] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductType, setEditProductType] = useState(''); // Default selection for Type dropdown

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const fetchProductTypes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/product-types');
      setProductTypes(response.data);
    } catch (error) {
      console.error('Error fetching product types:', error);
    }
  };

  const handleAddProductType = async (e) => {
    e.preventDefault();
    if (!newProductName) {
      alert('Please enter a product name');
      return;
    }
    try {
      const newProduct = { name: newProductName, type: newProductType };
      const response = await axios.post('http://localhost:5000/product-types', newProduct);
      setProductTypes([...productTypes, response.data]);
      setNewProductName('');
      setNewProductType('R'); // Reset to default
      alert('Product type added successfully');
      await fetchProductTypes();
    } catch (error) {
      console.error('Error adding product type:', error);
      alert('Failed to add product type');
    }
  };

  const handleEdit = (product) => {
    setEditRowId(product.ID);
    setEditProductName(product.Name);
    setEditProductType(product.Type);
  };

  const handleSaveEdit = async () => {
    if (!editProductName) {
      alert('Product name cannot be empty');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/product-types/${editRowId}`, {
        name: editProductName,
        type: editProductType,
      });
      setProductTypes((prev) =>
        prev.map((product) =>
          product.ID === editRowId
            ? { ...product, Name: editProductName, Type: editProductType }
            : product
        )
      );
      setEditRowId(null);
      setEditProductName('');
      setEditProductType('');
      alert('Product type updated successfully');
      await fetchProductTypes();
    } catch (error) {
      console.error('Error updating product type:', error);
      alert('Failed to update product type');
    }
  };

  const handleCancelEdit = () => {
    setEditRowId(null);
    setEditProductName('');
    setEditProductType('');
  };

  const handleDeleteProductType = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/product-types/${id}`);
      setProductTypes(productTypes.filter((type) => type.ID !== id));
      alert('Product type deleted successfully');
      await fetchProductTypes();
    } catch (error) {
      console.error('Error deleting product type:', error);
      alert('Failed to delete product type');
    }
  };

  const handleTabSelect = (key) => {
    navigate(`/${key}`);
  };

  return (
    <Container fluid className="mt-4">
      {/* Navbar */}
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
      <Tabs activeKey={location.pathname.substring(1) || 'product-type'} onSelect={handleTabSelect} className="mb-3">
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
        <Container className="container-custom">
            <h3 className="header-custom">Add Product Type</h3>
            <Form onSubmit={handleAddProductType}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      placeholder="Enter product type name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Type</Form.Label>
                    <Form.Select
                      value={newProductType}
                      onChange={(e) => setNewProductType(e.target.value)}
                    >
                      <option value="R">R</option>
                      <option value="V">V</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit" className="w-100">
                Add
              </Button>
            </Form>

            <h3 className="mt-5">Product Type List</h3>
            <Table striped bordered hover className="mt-3">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {productTypes.map((product) => (
                  <tr key={product.ID}>
                    <td>{product.ID}</td>
                    <td>
                      {editRowId === product.ID ? (
                        <Form.Control
                          type="text"
                          value={editProductName}
                          onChange={(e) => setEditProductName(e.target.value)}
                        />
                      ) : (
                        product.Name
                      )}
                    </td>
                    <td>
                      {editRowId === product.ID ? (
                        <Form.Select
                          value={editProductType}
                          onChange={(e) => setEditProductType(e.target.value)}
                        >
                          <option value="R">R</option>
                          <option value="V">V</option>
                        </Form.Select>
                      ) : (
                        product.Type
                      )}
                    </td>
                    <td>
                      {editRowId === product.ID ? (
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
                            onClick={() => handleEdit(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteProductType(product.ID)}
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