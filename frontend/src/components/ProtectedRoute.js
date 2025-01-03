import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user")); // Assuming user info is stored in localStorage

  if (!user || !user.roles.some((role) => allowedRoles.includes(role))) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}