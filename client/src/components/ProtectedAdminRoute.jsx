import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedAdminRoute = () => {
  const userStr = localStorage.getItem("user");
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  if (user.platformRole !== 'PLATFORM_ADMIN') {
    return <Navigate to="/organization" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
