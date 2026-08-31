import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ListingsPage from "./pages/ListingsPage";
import ListingDetailsPage from "./pages/ListingDetailsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<ListingsPage />} />
        <Route path="/listings/:id" element={<ListingDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
