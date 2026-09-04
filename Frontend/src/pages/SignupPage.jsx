import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";

function SignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(
    searchParams.get("role") === "host" ? "host" : "guest",
  );
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (newMode) => {
    setMode(newMode);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await apiFetch("/api/users/register", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          role: mode === "host" ? "host" : "user",
        }),
      });

      localStorage.setItem("airbnbToken", data.token);
      localStorage.setItem("airbnbUser", JSON.stringify(data.user));

      // Host → dashboard, Guest → home page
      navigate(data.user?.role === "host" ? "/host" : "/");
    } catch (error) {
      setMessage(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isHost = mode === "host";

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="auth-modal__header">
          <button className="auth-modal__close" onClick={() => navigate("/")}>
            <svg
              viewBox="0 0 32 32"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M6 6l20 20M26 6L6 26" strokeLinecap="round" />
            </svg>
          </button>
          <span className="auth-modal__title">Sign up</span>
          <span />
        </div>

        <div className="auth-modal__body">
          {/* Guest / Host toggle */}
          <div className="auth-role-toggle">
            <button
              type="button"
              className={`auth-role-btn ${!isHost ? "auth-role-btn--active auth-role-btn--guest" : ""}`}
              onClick={() => switchMode("guest")}
            >
              <span className="auth-role-btn__icon">🏠</span>
              <span className="auth-role-btn__label">Guest</span>
              <span className="auth-role-btn__sub">
                I'm looking for a place
              </span>
            </button>
            <button
              type="button"
              className={`auth-role-btn ${isHost ? "auth-role-btn--active auth-role-btn--host" : ""}`}
              onClick={() => switchMode("host")}
            >
              <span className="auth-role-btn__icon">🔑</span>
              <span className="auth-role-btn__label">Host</span>
              <span className="auth-role-btn__sub">
                I want to list my place
              </span>
            </button>
          </div>

          {/* Context banner */}
          <div
            className={`auth-context-banner ${isHost ? "auth-context-banner--host" : "auth-context-banner--guest"}`}
          >
            {isHost ? (
              <>
                <strong>Creating a Host account</strong>
                <p>
                  After signing up you'll go straight to your dashboard to
                  create your first listing.
                </p>
              </>
            ) : (
              <>
                <strong>Creating a Guest account</strong>
                <p>
                  After signing up you'll go to the home page to start browsing
                  stays.
                </p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
                className="auth-input auth-input--top"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="auth-input auth-input--mid"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="auth-input auth-input--bottom"
              />
            </div>

            <p className="auth-terms">
              By selecting{" "}
              <strong>
                {isHost ? "Create Host account" : "Create Guest account"}
              </strong>
              , I agree to Airbnb's{" "}
              <a href="#" className="auth-link">
                Terms of Service
              </a>
              ,{" "}
              <a href="#" className="auth-link">
                Privacy Policy
              </a>
              , and{" "}
              <a href="#" className="auth-link">
                Nondiscrimination Policy
              </a>
              .
            </p>

            {message && <p className="auth-error">{message}</p>}

            <button
              type="submit"
              className={`auth-submit-btn ${isHost ? "auth-submit-btn--host" : ""}`}
              disabled={loading}
            >
              {loading
                ? "Creating account…"
                : isHost
                  ? "Create Host account"
                  : "Create Guest account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link
              to={isHost ? "/login?role=host" : "/login"}
              className="auth-link"
            >
              Log in as {isHost ? "a host" : "a guest"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
