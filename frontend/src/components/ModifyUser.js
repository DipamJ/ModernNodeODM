import React, { useState, useEffect } from "react";
import { Table, Button, Form, Alert, Container, Row, Col, Navbar, Nav, Dropdown } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ModifyUser() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const navigate = useNavigate();

  const handleSelectEssentialTools = (eventKey) => {
    if (eventKey === "data-admin") {
      navigate("/project"); // Navigate to the Project page
    }
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
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/users");
      setUsers(response.data.users);
    } catch (error) {
      setError("Failed to fetch users. Please try again.");
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/roles");
      setRoles(response.data.roles);
    } catch (error) {
      setError("Failed to fetch roles. Please try again.");
    }
  };

  const handleApprovalChange = async (userId, status) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/users/${userId}/approval`,
        { status }
      );
      setSuccess(response.data.message);
      setError("");
      fetchUsers();
    } catch (error) {
      setError("Failed to update approval status. Please try again.");
    }
  };

  const handleRoleChange = async (userId, roleId) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/users/${userId}/role`,
        { roleId }
      );
      setSuccess(response.data.message);
      setError("");
      fetchUsers();
    } catch (error) {
      setError("Failed to update user role. Please try again.");
    }
  };
  const handleEdit = (userId) => {
    setEditingUserId(userId); // Set the user in editing mode
  };

  const handleCancel = () => {
    setEditingUserId(null); // Exit editing mode
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await axios.delete(`http://localhost:5000/users/${userId}`);
        setSuccess(response.data.message);
        setError("");
        fetchUsers(); // Refresh the user list after deletion
      } catch (error) {
        setError("Failed to delete user. Please try again.");
      }
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
        <Col md={10}>
          <h3>Modify Users</h3>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Approval</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id_user}>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.email}</td>
                  <td>
                  {editingUserId === user.id_user ? (
                      <Form.Select
                        value={user.admin_approved}
                        onChange={(e) =>
                          handleApprovalChange(user.id_user, e.target.value)
                        }
                      >
                        <option value="Approved">Approved</option>
                        <option value="Disapproved">Disapproved</option>
                      </Form.Select>
                    ) : (
                      user.admin_approved
                    )}
                  </td>
                  <td>
                    {editingUserId === user.id_user ? (
                      <Form.Select
                        value={user.role_id || ""}
                        onChange={(e) =>
                          handleRoleChange(user.id_user, e.target.value)
                        }
                      >
                        <option value="">--Select Role--</option>
                        {roles.map((role) => (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                          </option>
                        ))}
                      </Form.Select>
                    ) : (
                      roles.find((role) => role.role_id === user.role_id)?.role_name || "--Select Role--"
                    )}
                  </td>
                  <td>
                    {editingUserId === user.id_user ? (
                      <>
                        <Button
                          variant="success"
                          className="me-2"
                          onClick={() => setEditingUserId(null)}
                        >
                          Save
                        </Button>
                        <Button variant="secondary" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="warning"
                          className="me-2"
                          onClick={() => handleEdit(user.id_user)}
                        >
                          Edit
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleDelete(user.id_user)}
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
        </Col>
      </Row>
    </Container>
  );
}
