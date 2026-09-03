import { Navigate } from "react-router-dom";

/**
 * Wraps a route so only users with an allowed role can access it.
 * - No token at all  → redirect to /login
 * - Token but wrong role → redirect to /
 *
 * Usage:
 *   <ProtectedRoute allowedRoles={["host","admin"]}>
 *     <HostDashboard />
 *   </ProtectedRoute>
 */
function ProtectedRoute({ allowedRoles = [], children }) {
  const token = localStorage.getItem("airbnbToken");
  const user = JSON.parse(localStorage.getItem("airbnbUser") || "null");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Logged in but wrong role — send guest back to home
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
