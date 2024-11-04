import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import only what's needed
import ProjectForm from './components/ProjectForm';
import CropForm from './components/CropForm';
import PlatformForm from './components/PlatformForm';
import SensorForm from './components/SensorForm';

export default function App() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/project" replace />} />
      {/* Project Form Route */}
      <Route path="/project" element={<ProjectForm />} />
      {/* Crop Form Route */}
      <Route path="/crop" element={<CropForm />} />
      <Route path="/platform" element={<PlatformForm />} />
      <Route path="/sensor" element={<SensorForm />} />
    </Routes>
  );
}