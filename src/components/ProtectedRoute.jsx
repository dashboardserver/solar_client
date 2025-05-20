import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  console.log("🔐 ProtectedRoute → token =", token);

  if (!token) {
    console.warn("🚫 No token → redirect to /");
    return <Navigate to="/" replace />;
  }

  return children;
}
