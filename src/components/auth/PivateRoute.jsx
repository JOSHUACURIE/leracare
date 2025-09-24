// src/components/auth/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PrivateRoute({ children, allowedRole }) {
  const { user, token } = useAuth();

  // If no token or user, redirect
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // Normalize role check
  if (user.role?.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  // Authorized → render children
  return children;
}
