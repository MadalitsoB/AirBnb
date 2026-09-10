import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";

/**
 * Two-step login/signup — matches the Airbnb mockup design:
 *  Step 1 — enter email  → Continue
 *  Step 2 — enter password (existing) or username + password (new account)
 *
 * ?role=host  pre-selects host mode (used from the hosting banner)
 */
function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isHostFlow = searchParams.get("role") === "host";

  const [step, setStep]       = useState(1); // 1 = email, 2 = password
  const [isNew, setIsNew]     = useState(false); // true = signup flow
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Step 1: check if email exists ── */
  const handleContinue = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setMessage("");
    setLoading(true);
    try {
      // Try to log in with a dummy password just to probe the account
      // If "invalid password" → account exists → login flow
      // If "not found" / network → treat as new account → signup flow
      await apiFetch("/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password: "__probe__" }),
      });
      // Unlikely to succeed, but just in case
      setIsNew(false);
    } catch (err) {
      const raw = (err.message || "").toLowerCase();
      if (raw.includes("offline") || raw.includes("system")) {
        setMessage("System offline. Please try again later.");
        setLoading(false);
        return;
      }
      // "invalid" password error means the account exists
      if (raw.includes("invalid") || raw.includes("password") || raw.includes("incorrect")) {
        setIsNew(false);
      } else {
        // Any other error (not found, etc.) → treat as new user
        setIsNew(true);
      }
    }
    setLoading(false);
    setStep(2);
  };

  /* ── Step 2: login or signup ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      let data;
      if (isNew) {
        // Signup
        data = await apiFetch("/users/register", {
          method: "POST",
          body: JSON.stringify({
            username: username || email.split("@")[0],
            email,
            password,
            role: isHostFlow ? "host" : "user",
          }),
        });
      } else {
        // Login
        data = await apiFetch("/users/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
      }

      localStorage.setItem("airbnbToken", data.token);
      localStorage.setItem("airbnbUser", JSON.stringify(data.user));

      const userIsHost = ["host", "admin"].includes(data.user?.role);

      // If they came from host flow but logged into a guest account — block
      if (isHostFlow && !userIsHost) {
        setMessage("Account not found. Please check your details or sign up.");
        localStorage.removeItem("airbnbToken");
        localStorage.removeItem("airbnbUser");
        setLoading(false);
        return;
      }

      navigate(userIsHost ? "/host" : "/");
    } catch (err) {
      const raw = (err.message || "").toLowerCase();
      if (raw.includes("offline") || raw.includes("system")) {
        setMessage("System offline. Please try again later.");
      } else if (raw.includes("exists") || raw.includes("already")) {
        setMessage("An account with that email already exists.");
      } else {
        setMessage("Incorrect email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal auth-modal--centered">

        {/* Header */}
        <div className="auth-modal__header">
          <button className="auth-modal__close" onClick={() => navigate("/")}>
            <svg viewBox="0 0 32 32" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 6l20 20M26 6L6 26" strokeLinecap="round" />
            </svg>
          </button>
          <span className="auth-modal__title">
            {step === 2 && isNew ? "Finish signing up" : "Log in or sign up"}
          </span>
          <span />
        </div>

        <div className="auth-modal__body">

          {/* Airbnb logo */}
          <div className="auth-logo">
            <svg viewBox="0 0 32 32" width="36" height="36" fill="#FF385C">
              <path d="M16 1C10.925 1 6 6.925 6 13c0 7.5 10 18 10 18s10-10.5 10-18C26 6.925 21.075 1 16 1zm0 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
            </svg>
          </div>

          <h2 className="auth-modal__heading">
            {step === 1 && "Log in or sign up"}
            {step === 2 && isNew && "Create your account"}
            {step === 2 && !isNew && "Welcome back"}
          </h2>

          {/* ── STEP 1: Email ── */}
          {step === 1 && (
            <>
              <form onSubmit={handleContinue} className="auth-form">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="auth-input-single"
                  autoFocus
                />
                {message && <p className="auth-error">{message}</p>}
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading ? "Checking…" : "Continue"}
                </button>
              </form>

              <div className="auth-divider"><span>or</span></div>

              {/* Social buttons — icon only style */}
              <div className="auth-social-icons">
                <button type="button" className="auth-social-icon-btn" aria-label="Continue with Google">
                  {/* Google */}
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                <button type="button" className="auth-social-icon-btn" aria-label="Continue with Apple">
                  {/* Apple */}
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.32.07 2.24.74 3.01.8.94-.19 1.84-.88 3.05-.94 1.52-.08 2.68.58 3.44 1.68-3.14 1.87-2.39 6 .5 7.17-.59 1.56-1.33 3.1-2 4.17zM12.03 7.25c-.16-2.48 1.82-4.52 4.13-4.75.31 2.86-2.61 5-4.13 4.75z"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* ── STEP 2: Password (+ username if new) ── */}
          {step === 2 && (
            <>
              <p className="auth-step2-email">
                {email}
                <button type="button" className="auth-step2-change" onClick={() => { setStep(1); setMessage(""); setPassword(""); }}>
                  Change
                </button>
              </p>

              <form onSubmit={handleSubmit} className="auth-form">
                {isNew && (
                  <input
                    type="text"
                    placeholder="Your name"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="auth-input-single"
                    style={{ marginBottom: 10 }}
                    autoFocus
                  />
                )}
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="auth-input-single"
                  autoFocus={!isNew}
                />

                {message && <p className="auth-error">{message}</p>}

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                  {loading
                    ? isNew ? "Creating account…" : "Logging in…"
                    : isNew ? "Agree and continue" : "Continue"}
                </button>
              </form>

              {isNew && (
                <p className="auth-terms">
                  By selecting <strong>Agree and continue</strong>, I agree to Airbnb's{" "}
                  <a href="#" className="auth-link">Terms of Service</a>,{" "}
                  <a href="#" className="auth-link">Privacy Policy</a>, and{" "}
                  <a href="#" className="auth-link">Nondiscrimination Policy</a>.
                </p>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
