import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Alert } from 'react-bootstrap';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password }, { withCredentials: true });
      const userData = response.data.user;
      localStorage.setItem('user_id', userData.id_user);
      localStorage.setItem('user_email', userData.email);
      alert(response.data.message);
      navigate('/homepage-pm');  // Redirect to project page on success
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Login failed');
    }
  };

  const handleSignUp = () => {
    navigate('/register'); // Redirect to the Sign-Up page
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <h2>Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-between">
              <Button variant="primary" type="submit">
                Login
              </Button>
              <Button variant="secondary" onClick={handleSignUp}>
                Register
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}