import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    // If the user does not have the required role, redirect to a safe page.
    // For now, redirect to the root or a "Not Authorized" page
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
