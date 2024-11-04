import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    planting_date: '',
    harvest_date: '',
    description: ''
  });

  useEffect(() => {
    axios.get('http://localhost:5000/projects')
      .then(response => setProjects(response.data));
  }, []);

  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const addProject = () => {
    axios.post('http://localhost:5000/projects', newProject)
      .then(() => window.location.reload());
  };

  const deleteProject = (id) => {
    axios.delete(`http://localhost:5000/projects/${id}`)
      .then(() => window.location.reload());
  };

  return (
    <div>
      <h2>Project Management</h2>
      <input name="name" placeholder="Project Name" onChange={handleChange} />
      <input name="planting_date" placeholder="Planting Date" type="date" onChange={handleChange} />
      <input name="harvest_date" placeholder="Harvest Date" type="date" onChange={handleChange} />
      <input name="description" placeholder="Description" onChange={handleChange} />
      <button onClick={addProject}>Add Project</button>

      <ul>
        {projects.map(project => (
          <li key={project.id}>
            {project.Name} - {project.PlantingDate} to {project.HarvestDate} - {project.Description}
            <button onClick={() => deleteProject(project.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectManagement;