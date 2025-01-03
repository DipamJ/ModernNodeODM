import React, { useState, useEffect } from "react";
import { Table, Button, Form, Alert, Container, Row, Col, Navbar, Nav, Dropdown, Card } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ModifyRole() {

  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [editRole, setEditRole] = useState({ id: null, name: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSelectEssentialTools = (eventKey) => {
    if (eventKey === 'data-admin') {
      navigate('/project');  // Navigate to the Project page
    }
    // Add additional tool navigation here if needed
  };

  const handleSelectUserAdmin = (eventKey) => {
    if (eventKey === 'modify-roles') {
      navigate('/modify-roles');  // Navigate to Modify Roles page
    }
    if (eventKey === "modify-users") {
      navigate("/modify-users"); // Navigate to Modify Users page
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/roles");
      debugger;
      setRoles(response.data.roles);
    } catch (error) {
      setError("Failed to fetch roles. Please try again.");
    }
  };

  const handleAddRole = async () => {
    if (!newRole.trim()) {
      setError("Role name cannot be empty.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/roles", { name: newRole });
      debugger;
      setSuccess(response.data.message);
      setError("");
      setNewRole("");
      fetchRoles();
    } catch (error) {
      setError("Failed to add role. Please try again.");
    }
  };

  const handleEditRole = (role) => {
    setEditRole(role);
  };

  const handleSaveRole = async () => {
    if (!editRole.role_name.trim()) {
      setError("Role name cannot be empty.");
      return;
    }
    try {
      const response = await axios.put(`http://localhost:5000/roles/${editRole.role_id}`, {
        name: editRole.role_name,
      });
      debugger;
      setSuccess(response.data.message);
      setError("");
      setEditRole({ id: null, name: "" });
      fetchRoles();
    } catch (error) {
      setError("Failed to update role. Please try again.");
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/roles/${roleId}`);
      setSuccess(response.data.message);
      setError("");
      fetchRoles();
    } catch (error) {
      setError("Failed to delete role. Please try again.");
    }
  };

  return (
    <Container fluid>
      <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
                <img
                src={`${process.env.PUBLIC_URL}/logo.png`}
                width="40"
                height="40"
                className="d-inline-block align-top me-2"
                alt="West Texas Cotton Logo"
                />
                <span className="navbar-brand-text">West Texas Cotton</span>
            </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Dropdown onSelect={handleSelectEssentialTools} className="me-3">
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                Essential Tools
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="data-admin">Data Administration</Dropdown.Item>
                {/* Add more dropdown items for other tools */}
              </Dropdown.Menu>
            </Dropdown>
            <Dropdown onSelect={handleSelectUserAdmin} className="me-3">
              <Dropdown.Toggle variant="secondary" id="user-admin-dropdown">
                User Administration
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="modify-users">Modify Users</Dropdown.Item>
                <Dropdown.Item eventKey="modify-roles">Modify Roles</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link href="/logout">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Row className="justify-content-center mt-4">
        <Col md={8}>
          <h3>Modify Roles</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Role ID</th>
                <th>Role Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.role_id}>
                  <td>{role.role_id}</td>
                  <td>
                    {editRole.role_id === role.role_id ? (
                      <Form.Control
                        type="text"
                        value={editRole.role_name}
                        onChange={(e) => setEditRole({ ...editRole, role_name: e.target.value })}
                      />
                    ) : (
                      role.role_name
                    )}
                  </td>
                  <td>
                    {editRole.role_id === role.role_id ? (
                      <>
                        <Button variant="success" onClick={handleSaveRole} className="me-2">
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setEditRole({ id: null, name: "" })}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="warning"
                          className="me-2"
                          onClick={() => handleEditRole(role)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteRole(role.role_id)}
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
          <Form>
            <Form.Group>
              <Form.Label>Add New Role</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter role name"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              />
            </Form.Group>
            <Button className="mt-3" onClick={handleAddRole}>
              Add Role
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
