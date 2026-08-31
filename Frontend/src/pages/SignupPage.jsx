import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.message || "Signup failed"); return; }
      localStorage.setItem("airbnbToken", data.token);
      navigate("/listings");
    } catch {
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        {/* Header */}
        <div className="auth-modal__header">
          <button className="auth-modal__close" onClick={() => navigate("/")}>
            <svg viewBox="0 0 32 32" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l20 20M26 6L6 26" strokeLinecap="round" />
            </svg>
          </button>
          <span className="auth-modal__title">Sign up</span>
          <span />
        </div>

        <div className="auth-modal__body">
          <h2 className="auth-modal__heading">Welcome to Airbnb</h2>

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
              By selecting <strong>Agree and continue</strong>, I agree to Airbnb's{" "}
              <a href="#" className="auth-link">Terms of Service</a>,{" "}
              <a href="#" className="auth-link">Payments Terms of Service</a>,{" "}
              <a href="#" className="auth-link">Privacy Policy</a>, and{" "}
              <a href="#" className="auth-link">Nondiscrimination Policy</a>.
            </p>

            {message && <p className="auth-error">{message}</p>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? "Creating account…" : "Agree and continue"}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <div className="auth-social">
            <button className="auth-social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <button className="auth-social-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.029 4.388 11.02 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.268h3.328l-.532 3.49h-2.796v8.437C19.612 23.093 24 18.102 24 12.073z"/></svg>
              Continue with Facebook
            </button>
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="auth-link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
