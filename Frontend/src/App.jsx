import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailsPage from "./pages/ListingDetailsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HostDashboard from "./pages/HostDashboard";
import MyReservationsPage from "./pages/MyReservationsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — accessible by everyone */}
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Host-only route — guests are redirected to / */}
        <Route
          path="/host"
          element={
            <ProtectedRoute allowedRoles={["host", "admin"]}>
              <HostDashboard />
            </ProtectedRoute>
          }
        />

        {/* Guest-only route — must be logged in */}
        <Route
          path="/my-reservations"
          element={
            <ProtectedRoute allowedRoles={[]}>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
