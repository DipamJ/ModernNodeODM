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
import RegisterForm from './components/RegisterForm';
import ModifyRole from "./components/ModifyRoleForm";
import ModifyUser from "./components/ModifyUser";
import LandingPage from "./components/LandingPage";
import RegisterMemberForm from './components/RegisterMemberForm';
import LoginMemberForm from './components/LoginMemberForm';
import LoginPMForm from './components/LoginPMForm';
import MemberHome from './components/MemberHome';
import HomePagePM from './components/HomePagePM';
import ProjectManagement from "./components/ProjectManagement";
import ProjectAccess from "./components/ProjectAccessControl";

export default function App() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/logout" element={<Navigate to="/login" />} />
      <Route path="/logout-pm" element={<Navigate to="/login-pm" />} />
      <Route path="/logout-member" element={<Navigate to="/login-member" />} />
      {/* All Forms */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/login-member" element={<LoginMemberForm />} />
      <Route path="/login-pm" element={<LoginPMForm />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/project" element={<ProjectForm />} />
      <Route path="/crop" element={<CropForm />} />
      <Route path="/platform" element={<PlatformForm />} />
      <Route path="/sensor" element={<SensorForm />} />
      <Route path="/flight" element={<FlightForm />} />
      <Route path="/product-type" element={<ProductTypeForm />} />
      <Route path="/data-product" element={<DataProductForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/register-member" element={<RegisterMemberForm />} />
      <Route path="/modify-roles" element={<ModifyRole />} />;
      <Route path="/modify-users" element={<ModifyUser />} />;
      <Route path="/home" element={<LandingPage />} />;
      <Route path="/member-home" element={<MemberHome />} />;
      <Route path="/homepage-pm" element={<HomePagePM />} />;
      <Route path="/project-management" element={<ProjectManagement />} />
      <Route path="/project-access" element={<ProjectAccess />} />
    </Routes>
  );
}