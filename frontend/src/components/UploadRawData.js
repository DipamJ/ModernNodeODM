import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Navbar, Nav, Dropdown, ProgressBar, Spinner, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";

export default function UploadRawUASData() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(""); // For displaying errors
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState("");

  const [metadata, setMetadata] = useState({
    project: projectName,
    platform: '',
    sensor: '',
    date: '',
    altitude: '',
    forward: '',
    side: '',
    notes: ''
  });

  const [dropdownData, setDropdownData] = useState({
    platforms: [],
    sensors: []
  });

  const navigate = useNavigate();

  const [emailData, setEmailData] = useState({
    to: "",
    cc: "",
    message: ""
    });

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        const response = await axios.get(`http://localhost:5000/projects/${projectId}`);
        setProjectName(response.data.name);
        setMetadata(prev => ({ ...prev, project: response.data.name }));
      } catch (error) {
        console.error("Error fetching project:", error);
        setProjectName("Unknown Project");
      }
    }

    async function fetchDropdownData() {
      try {
        const [platforms, sensors, flights] = await Promise.all([
          axios.get("http://localhost:5000/platforms"),
          axios.get("http://localhost:5000/sensors"),
          axios.get("http://localhost:5000/flights")
        ]);
        setDropdownData({
          platforms: platforms.data,
          sensors: sensors.data,
          flights: flights.data
        });
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    }
    
    fetchDropdownData();
    fetchUploadedFiles();
    fetchProjectDetails();
  }, [projectId]);

  const fetchUploadedFiles = async() => {
    try {
        const response = await axios.get("http://localhost:5000/uploads");
        setUploadedFiles(response.data);
    } catch (error) {
        console.error("Error fetching uploaded files:", error);
    }
}

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleMetadataChange = (event) => {
    setMetadata({ ...metadata, [event.target.name]: event.target.value });
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError(""); // Clear previous errors

    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const duplicateCheckResponse = await axios.get(`http://localhost:5000/check-duplicate-upload`, {
        params: { filename: selectedFile.name, project: projectName }
      });

      if (duplicateCheckResponse.data.exists) {
        setError(`A file with the name '${selectedFile.name}' already exists in project '${projectName}'. Please rename your file or select another.`);
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      Object.keys(metadata).forEach(key => formData.append(key, metadata[key]));
      Object.keys(emailData).forEach(key => formData.append(key, emailData[key]));

      await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0, // Prevent axios timeout for large files
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        }
      });

      alert("File uploaded successfully!");
      setProgress(100);

      setTimeout(() => {
        setProgress(0);
        setUploading(false);
        setMetadata({ project: projectName, platform: '', sensor: '', date: '', flight: '', altitude: '', forward: '', side: '', notes: '' });
        setEmailData({ to: "jose.landivarscott@ag.tamu.edu", cc: "julianna.mccoy@ag.tamu.edu", message: "" });        
        setSelectedFile(null);
      }, 1500);
      
      document.getElementById("fileInput").value = ""; // Clear file input
      await fetchUploadedFiles();

    } catch (error) {
      console.error("Upload error:", error);
      setError(error.response?.data?.error || "Failed to upload file.");
      setUploading(false);
    }
  };

  const handleSelectEssentialTools = (eventKey) => {
    if (eventKey === 'data-admin') {
      navigate('/project');
    }
    if (eventKey === 'project-access') {
      navigate('/project-access');
    }
  };

  const handleEmailChange = (e) => {
    setEmailData({ ...emailData, [e.target.name]: e.target.value });
  };

  return (
    <Container fluid>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/homepage-pm" className="d-flex align-items-center">
          <img src={`${process.env.PUBLIC_URL}/logo.png`} width="40" height="40" className="d-inline-block align-top me-2" alt="West Texas Cotton Logo" />
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
                <Dropdown.Item eventKey="project-access">Project Access</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link href="/logout-pm">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container className="mt-4">
        <h2 className="mb-4">Upload Raw UAS Data</h2>
        <Card className="p-4">
          <Form onSubmit={handleUpload}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Project</Form.Label>
                  <Form.Control type="text" value={projectName} readOnly />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Platform</Form.Label>
                  <Form.Select name="platform" value={metadata.platform} onChange={handleMetadataChange} required>
                    <option value="">Select Platform</option>
                    {dropdownData.platforms.map(plat => (
                      <option key={plat.id_platform} value={plat.name}>{plat.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Flight Altitude</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="altitude" 
                    value={metadata.altitude} 
                    onChange={handleMetadataChange} 
                    required 
                    placeholder="Enter Flight Altitude" 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Side Overlap</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="side" 
                    value={metadata.side} 
                    onChange={handleMetadataChange} 
                    required 
                    placeholder="Enter Side Overlap" 
                  />
                </Form.Group>
                </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Sensor</Form.Label>
                  <Form.Select name="sensor" value={metadata.sensor} onChange={handleMetadataChange} required>
                    <option value="">Select Sensor</option>
                    {dropdownData.sensors.map(sens => (
                      <option key={sens.id_sensor} value={sens.name}>{sens.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" name="date" value={metadata.date} onChange={handleMetadataChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Forward Overlap</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="forward" 
                    value={metadata.forward} 
                    onChange={handleMetadataChange} 
                    required 
                    placeholder="Enter Forward Overlap" 
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Select .zip File</Form.Label>
              <Form.Control id="fileInput" type="file" accept=".zip" onChange={handleFileChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control as="textarea" rows={3} name="notes" value={metadata.notes} onChange={handleMetadataChange} />
            </Form.Group>

            {/* Notification Section */}
            <Card className="p-4 mt-3">
                <h5>Notification</h5>
                <Form.Group className="mb-3">
                    <Form.Label>To</Form.Label>
                    <Form.Control type="email" name="to" value={emailData.to} onChange={handleEmailChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>CC</Form.Label>
                    <Form.Control type="email" name="cc" value={emailData.cc} onChange={handleEmailChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Message</Form.Label>
                    <Form.Control as="textarea" rows={3} name="message" value={emailData.message} onChange={handleEmailChange} />
                </Form.Group>
            </Card>

            {uploading && <ProgressBar now={progress} label={`${progress}%`} className="mb-3" />}
            {error && <p className="text-danger">{error}</p>}

            {/* Moved Upload Button Here */}
            <Button variant="primary" type="submit" className="w-100 mt-3" disabled={uploading}>
              {uploading ? <Spinner animation="border" size="sm" /> : "Upload Data"}
            </Button>
          </Form>
        </Card>
        <h3 className="mt-5">Uploaded Files</h3>
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>File Name</th>
                    <th>Project</th>
                    <th>Platform</th>
                    <th>Sensor</th>
                    <th>Date</th>
                    <th>Flight Altitude</th>
                    <th>Forward Overlap</th>
                    <th>Side Overlap</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {uploadedFiles.filter(file => file.project === projectName).map((file) => (
                    <tr key={file.id_uas_uploads}>
                        <td>{file.filename}</td>
                        <td>{file.project}</td>
                        <td>{file.platform}</td>
                        <td>{file.sensor}</td>
                        <td>{file.date}</td>
                        <td>{file.altitude}</td>
                        <td>{file.forward}</td>
                        <td>{file.side}</td>
                        <td>
                            <Button variant="primary" href={`/uploads/${file.filename}`} target="_blank">Download</Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
      </Container>
    </Container>
  );
}