import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState(
    searchParams.get("role") === "host" ? "host" : "guest"
  );
  const [form, setForm] = useState({ email: "", password: "" });
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
      const data = await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      localStorage.setItem("airbnbToken", data.token);
      localStorage.setItem("airbnbUser", JSON.stringify(data.user));

      const isHost = ["host", "admin"].includes(data.user?.role);

      // Wrong tab — tell them clearly, don't proceed
      if (mode === "host" && !isHost) {
        setMessage(
          "This is a guest account. Please use the Guest tab to log in, or sign up as a host."
        );
        localStorage.removeItem("airbnbToken");
        localStorage.removeItem("airbnbUser");
        return;
      }

      if (mode === "guest" && isHost) {
        setMessage(
          "This is a host account. Please use the Host tab to log in."
        );
        localStorage.removeItem("airbnbToken");
        localStorage.removeItem("airbnbUser");
        return;
      }

      // Correct tab — redirect to the right place
      navigate(isHost ? "/host" : "/");
    } catch (error) {
      setMessage(error.message || "Login failed. Check your email and password.");
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
            <svg viewBox="0 0 32 32" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l20 20M26 6L6 26" strokeLinecap="round" />
            </svg>
          </button>
          <span className="auth-modal__title">Log in</span>
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
              <span className="auth-role-btn__sub">I'm looking for a place</span>
            </button>
            <button
              type="button"
              className={`auth-role-btn ${isHost ? "auth-role-btn--active auth-role-btn--host" : ""}`}
              onClick={() => switchMode("host")}
            >
              <span className="auth-role-btn__icon">🔑</span>
              <span className="auth-role-btn__label">Host</span>
              <span className="auth-role-btn__sub">I manage listings</span>
            </button>
          </div>

          {/* Context banner */}
          <div className={`auth-context-banner ${isHost ? "auth-context-banner--host" : "auth-context-banner--guest"}`}>
            {isHost ? (
              <>
                <strong>Signing in as a Host</strong>
                <p>You'll be taken to your dashboard to manage listings and reservations.</p>
              </>
            ) : (
              <>
                <strong>Signing in as a Guest</strong>
                <p>You'll be taken to the home page to browse stays.</p>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="auth-input auth-input--top"
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

            {message && <p className="auth-error">{message}</p>}

            <button
              type="submit"
              className={`auth-submit-btn ${isHost ? "auth-submit-btn--host" : ""}`}
              disabled={loading}
            >
              {loading
                ? "Logging in…"
                : isHost
                ? "Log in to Host Dashboard"
                : "Log in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to={isHost ? "/signup?role=host" : "/signup"} className="auth-link">
              Sign up as {isHost ? "a host" : "a guest"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
