import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, Dropdown, Form, Button, Card, Row, Col, Spinner, Modal, ProgressBar } from 'react-bootstrap';
import axios from 'axios';

export default function GenerateAttributes() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [dropdownData, setDropdownData] = useState({
    platforms: [],
    sensors: [],
    boundaries: [],
    orthomosaics: [],
    chms: []
  });

  const [formData, setFormData] = useState({
    project: "",
    platform: "",
    sensor: "",
    boundary: "",
    orthomosaic: "",
    chm: "",
    canopyFeatures: [],
    downloadFiles: []
  });

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Upload modal for boundary
  const [showBoundaryUpload, setShowBoundaryUpload] = useState(false);
  const [boundaryFile, setBoundaryFile] = useState(null);
  // Upload modal for boundary
  const [showOrthomosaicUpload, setShowOrthomosaicUpload] = useState(false);
  const [orthomosaicFile, setOrthomosaicFile] = useState(null);
  // Upload modal for boundary
  const [showChmUpload, setShowChmUpload] = useState(false);
  const [chmFile, setChmFile] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProject();
    fetchDropdowns();
  }, [projectId]);

  async function fetchProject() {
    try {
      const res = await axios.get(`http://localhost:5000/projects/${projectId}`);
      setProjectName(res.data.name || "Unknown Project");
      setFormData(prev => ({ ...prev, project: res.data.name }));
    } catch (err) {
      console.error("Error fetching project:", err);
      setProjectName("Unknown Project");
    }
  }

  async function fetchDropdowns() {
    try {
      const [
        platformsRes,
        sensorsRes,
        boundariesRes,
        orthosRes,
        chmsRes
      ] = await Promise.all([
        axios.get("http://localhost:5000/platforms"),
        axios.get("http://localhost:5000/sensors"),
        axios.get("http://localhost:5000/boundaries"),
        axios.get("http://localhost:5000/orthomosaics"),
        axios.get("http://localhost:5000/chms")
      ]);
      setDropdownData({
        platforms: platformsRes.data || [],
        sensors: sensorsRes.data || [],
        boundaries: boundariesRes.data || [],
        orthomosaics: orthosRes.data || [],
        chms: chmsRes.data || []
      });
      console.log("platformsRes.data:", platformsRes.data);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  }

  // Navbar
  const handleSelectEssentialTools = (eventKey) => {
    if (eventKey === 'data-admin') {
      navigate('/project');
    }
    if (eventKey === 'project-access') {
      navigate('/project-access');
    }
  };

  // Form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Checkbox changes for canopy features
  const handleCanopyFeatureChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return { ...prev, canopyFeatures: [...prev.canopyFeatures, value] };
      } else {
        return {
          ...prev,
          canopyFeatures: prev.canopyFeatures.filter(f => f !== value)
        };
      }
    });
  };

  // Checkbox changes for download files
  const handleDownloadFileChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      if (checked) {
        return { ...prev, downloadFiles: [...prev.downloadFiles, value] };
      } else {
        return {
          ...prev,
          downloadFiles: prev.downloadFiles.filter(f => f !== value)
        };
      }
    });
  };

  // Submit: Generate Results
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        orthomosaic_image: formData.orthomosaic,
        project: projectName,
        file_prefix: formData.orthomosaic.replace(".tif", ""),
        epsg: 4326,                              // Hardcoded for now
        boundary_shp: formData.boundary
      };
      const response = await axios.post("http://localhost:5000/generate-rgb-attributes", payload);
      console.log("Generate response:", response.data);
      alert("Attributes generated successfully!");
    } catch (err) {
      console.error("Error generating attributes:", err);
      setError(err.response?.data?.error || "Failed to generate attributes.");
    } finally {
      setSubmitting(false);
    }
  };

  // Download
  const handleDownload = async () => {
    try {
      const response = await axios.post("http://localhost:5000/download-rgb-attributes", {projectName}, { responseType: "blob" });
      // Create a blob URL from the response data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create an anchor element and trigger the download
      const link = document.createElement("a");
      link.href = url;
      // Optionally, get the filename from the response headers:
      const disposition = response.headers["content-disposition"];
      let filename = "attributes.xlsx";
      if (disposition && disposition.indexOf("filename=") !== -1) {
        const filenameRegex = /filename="?([^"]+)"?/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1];
        }
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Download RGB Attributes:", response.data);
      alert("Attributes downloaded successfully!");
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download files.");
    }
  };

  // Upload new boundary
  const handleBoundaryFileChange = (e) => {
    setBoundaryFile(e.target.files[0]);
  };

  const handleBoundaryUpload = async () => {
    if (!boundaryFile) return;
    try {
      setUploading(true);
      const data = new FormData();
      data.append("file", boundaryFile);
      data.append("projectId", projectId);

      await axios.post("http://localhost:5000/boundaries/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });
      alert("Boundary uploaded successfully!");
      setShowBoundaryUpload(false);
      setBoundaryFile(null);
      fetchDropdowns(); // re-fetch so the new boundary appears in the dropdown
    } catch (err) {
      console.error("Error uploading boundary:", err);
      alert("Failed to upload boundary.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload new orthomosaic
  const handleOrthomosaicFileChange = (e) => {
    setOrthomosaicFile(e.target.files[0]);
  };

  const handleOrthomosaicUpload = async () => {
    if (!orthomosaicFile) return;
    try {
      setUploading(true);
      const data = new FormData();
      data.append("file", orthomosaicFile);
      data.append("projectId", projectId);

      await axios.post("http://localhost:5000/orthomosaic/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });
      alert("Orthomosaic uploaded successfully!");
      setShowOrthomosaicUpload(false);
      setOrthomosaicFile(null);
      fetchDropdowns();
    } catch (err) {
      console.error("Error uploading orthomosaic:", err);
      alert("Failed to upload orthomosaic.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Upload new chm
  const handleChmFileChange = (e) => {
    setChmFile(e.target.files[0]);
  };

  const handleChmUpload = async () => {
    if (!chmFile) return;
    try {
      setUploading(true);
      const data = new FormData();
      data.append("file", chmFile);
      data.append("projectId", projectId);

      await axios.post("http://localhost:5000/chm/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });
      alert("Canopy Height Model uploaded successfully!");
      setShowChmUpload(false);
      setChmFile(null);
      fetchDropdowns();
    } catch (err) {
      console.error("Error uploading canopy height model:", err);
      alert("Failed to upload canopy height model.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Container fluid>
      {/* NAVBAR */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/homepage-pm">
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
                <Dropdown.Item eventKey="project-access">Project Access</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link href="/logout-pm">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* MAIN CONTENT */}
      <Container className="mt-4">
        <h2>RGB Attributes Generator</h2>
        <Card className="p-4">
          <Form onSubmit={handleSubmit}>
            {/* Project */}
            <Form.Group className="mb-3">
              <Form.Label>Project</Form.Label>
              <Form.Control type="text" value={projectName} readOnly />
            </Form.Group>
            <Row>
              <Col md={6}>
                {/* Platform */}
                <Form.Group className="mb-3">
                  <Form.Label>Platform</Form.Label>
                  <Form.Select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    {dropdownData.platforms.map((p) => (
                      <option key={p.id_platform} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                {/* Sensor */}
                <Form.Group className="mb-3">
                  <Form.Label>Sensor</Form.Label>
                  <Form.Select
                    name="sensor"
                    value={formData.sensor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    {dropdownData.sensors.map((s) => (
                      <option key={s.id_sensor} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Orthomosaics */}
            <Form.Group className="mb-3">
              <Form.Label>Orthomosaics</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select
                  name="orthomosaic"
                  value={formData.orthomosaic}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  {dropdownData.orthomosaics.map((o) => (
                    <option key={o.id_orthomosaic} value={o.ortho_file_name}>
                      {o.ortho_file_name}
                    </option>
                  ))}
                </Form.Select>
                <Button variant="link" onClick={() => setShowOrthomosaicUpload(true)}>
                    Upload New
                </Button>
              </div>
            </Form.Group>

            {/* CHM */}
            <Form.Group className="mb-3">
              <Form.Label>Canopy Height Models</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select
                  name="chms"
                  value={formData.chm}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  {dropdownData.chms.map((c) => (
                    <option key={c.id_chm} value={c.chm_file_name}>
                      {c.chm_file_name}
                    </option>
                  ))}
                </Form.Select>
                <Button variant="link" onClick={() => setShowChmUpload(true)}>
                    Upload New
                </Button>
              </div>
            </Form.Group>

            {/* Boundary */}
            <Form.Group className="mb-3">
              <Form.Label>Boundary</Form.Label>
              <div className="d-flex gap-2">
                <Form.Select
                  name="boundary"
                  value={formData.boundary}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  {dropdownData.boundaries.map((b) => (
                    <option key={b.id_boundary} value={b.boundary_file_name}>
                      {b.boundary_file_name}
                    </option>
                  ))}
                </Form.Select>
                <Button variant="link" onClick={() => setShowBoundaryUpload(true)}>
                  Upload New
                </Button>
              </div>
            </Form.Group>

            <Row>
              <Col md={6}>
                  {/* Select canopy features */}
                <Form.Group className="mb-3">
                  <Form.Label><strong>Select which canopy features to generate</strong></Form.Label>
                  <div className="ms-3">
                    {["Canopy Height", "Canopy Volume", "Canopy Cover", "ExG"].map((feature) => (
                      <Form.Check
                        key={feature}
                        type="checkbox"
                        label={feature}
                        value={feature}
                        checked={formData.canopyFeatures.includes(feature)}
                        onChange={handleCanopyFeatureChange}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                {/* Files to Download */}
                <Form.Group className="mb-3">
                  <Form.Label><strong>Select which files to download</strong></Form.Label>
                  <div className="ms-3">
                    {[".csv", ".xls", ".geoJSON", ".shp"].map((file) => (
                      <Form.Check
                        key={file}
                        type="checkbox"
                        label={file}
                        value={file}
                        checked={formData.downloadFiles.includes(file)}
                        onChange={handleDownloadFileChange}
                      />
                    ))}
                  </div>
                </Form.Group>              
              </Col>
            </Row>

            {/* Error message */}
            {error && <p className="text-danger">{error}</p>}

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit" className="flex-grow-1" disabled={submitting}>
                {submitting ? <Spinner animation="border" size="sm" /> : "Generate Results"}
              </Button>
              <Button variant="secondary" type="button" className="flex-grow-1" onClick={handleDownload}>
                Download Generated Files
              </Button>
            </div>
          </Form>
        </Card>
      </Container>

      {/* Modal for uploading a new Boundary */}
      <Modal show={showBoundaryUpload} onHide={() => setShowBoundaryUpload(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload New Boundary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Boundary File</Form.Label>
            <Form.Control type="file" onChange={handleBoundaryFileChange} />
          </Form.Group>
          {uploading && (
            <div style={{ marginTop: "10px" }}>
              <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBoundaryUpload(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleBoundaryUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for uploading a new orthomosaic */}
      <Modal show={showOrthomosaicUpload} onHide={() => setShowOrthomosaicUpload(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload New Orthomosaic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Orthomosaic File</Form.Label>
            <Form.Control type="file" onChange={handleOrthomosaicFileChange} />
          </Form.Group>
          {uploading && (
            <div style={{ marginTop: "10px" }}>
              <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrthomosaicUpload(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleOrthomosaicUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for uploading a new chm */}
      <Modal show={showChmUpload} onHide={() => setShowChmUpload(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload New Canopy Height Model</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Select Canopy Height Model File</Form.Label>
            <Form.Control type="file" onChange={handleChmFileChange} />
          </Form.Group>
          {uploading && (
            <div style={{ marginTop: "10px" }}>
              <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChmUpload(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleChmUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
