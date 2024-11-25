import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import only what's needed
import ProjectForm from './components/ProjectForm';
import CropForm from './components/CropForm';
import PlatformForm from './components/PlatformForm';
import SensorForm from './components/SensorForm';
import FlightForm from './components/FlightForm';
import ProductTypeForm from './components/ProductTypeForm';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import DataProductForm from './components/DataProductForm';

export default function App() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/logout" element={<Navigate to="/login" />} />
      {/* All Forms */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/project" element={<ProjectForm />} />
      <Route path="/crop" element={<CropForm />} />
      <Route path="/platform" element={<PlatformForm />} />
      <Route path="/sensor" element={<SensorForm />} />
      <Route path="/flight" element={<FlightForm />} />
      <Route path="/product-type" element={<ProductTypeForm />} />
      <Route path="/data-product" element={<DataProductForm />} />
    </Routes>
  );
}