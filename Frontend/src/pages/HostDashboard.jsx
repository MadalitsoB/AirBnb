import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiFetch } from "../services/api";

const TABS = ["Dashboard", "My Listings", "Create Listing", "Reservations"];

const initialForm = {
  title: "",
  description: "",
  location: "",
  type: "Entire apartment",
  price: "",
  bedrooms: "1",
  bathrooms: "1",
  guests: "2",
  images: "",
};

function HostDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const me = await apiFetch("/users/me");
      if (!me.data || !["host", "admin"].includes(me.data.role)) {
        navigate("/", { replace: true });
        return;
      }
      setUser(me.data);
      const [listingRes, reservationRes] = await Promise.all([
        apiFetch("/accommodations"),
        apiFetch("/reservations/host"),
      ]);
      const owned = (listingRes.data || []).filter((l) => {
        const oid = typeof l.host === "object" ? l.host?._id?.toString() : l.host?.toString();
        return oid === me.data.id?.toString();
      });
      setListings(owned);
      setReservations(reservationRes.data || []);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const notify = (msg, isError = false) => {
    if (isError) setError(msg); else setMessage(msg);
    setTimeout(() => { setMessage(""); setError(""); }, 4000);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      await apiFetch("/accommodations", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          guests: Number(form.guests),
          images: form.images.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean),
        }),
      });
      setForm(initialForm);
      notify("Your listing is now live and visible to guests.");
      setActiveTab("My Listings");
      loadDashboard();
    } catch (err) {
      notify(err.message || "Could not create listing.", true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await apiFetch(`/accommodations/${id}`, { method: "DELETE" });
      notify("Listing deleted.");
      loadDashboard();
    } catch (err) {
      notify(err.message || "Could not delete listing.", true);
    }
  };

  const handleReservationStatus = async (id, status) => {
    try {
      await apiFetch(`/reservations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      notify(`Reservation ${status}.`);
      loadDashboard();
    } catch (err) {
      notify(err.message || "Could not update reservation.", true);
    }
  };

  if (!user) return null;

  const pending = reservations.filter(r => r.status === "pending").length;

  return (
    <div className="host-page">
      <Navbar />

      <main className="host-dashboard">

        {/* ── Page header ── */}
        <div className="host-dashboard__heading">
          <div>
            <p className="host-dashboard__eyebrow">Host workspace</p>
            <h1>Welcome, {user.username}</h1>
          </div>
          <Link to="/listings" className="host-dashboard__browse">
            Preview guest view
          </Link>
        </div>

        {/* ── Tab bar ── */}
        <nav className="host-tabs" aria-label="Dashboard sections">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`host-tab ${activeTab === tab ? "host-tab--active" : ""}`}
              onClick={() => { setActiveTab(tab); setMessage(""); setError(""); }}
            >
              {tab}
              {tab === "Reservations" && pending > 0 && (
                <span className="host-tab__badge">{pending}</span>
              )}
            </button>
          ))}
        </nav>

        {/* ── Toasts ── */}
        {error   && <p className="host-toast host-toast--error"   role="alert">{error}</p>}
        {message && <p className="host-toast host-toast--success" role="status">{message}</p>}

        {/* ══════════ DASHBOARD tab ══════════ */}
        {activeTab === "Dashboard" && (
          <div className="host-tab-content">
            <div className="host-stats">
              <div className="host-stat-card">
                <strong>{listings.length}</strong>
                <span>Active listings</span>
              </div>
              <div className="host-stat-card">
                <strong>{reservations.length}</strong>
                <span>Total reservations</span>
              </div>
              <div className="host-stat-card host-stat-card--alert">
                <strong>{pending}</strong>
                <span>Awaiting response</span>
              </div>
              <div className="host-stat-card">
                <strong>
                  R{listings.reduce((s, l) => s + Number(l.price || 0), 0).toLocaleString()}
                </strong>
                <span>Combined nightly value</span>
              </div>
            </div>

            <div className="host-quick-actions">
              <button className="host-quick-btn" onClick={() => setActiveTab("Create Listing")}>
                <span>＋</span> Create a new listing
              </button>
              <button className="host-quick-btn host-quick-btn--secondary" onClick={() => setActiveTab("My Listings")}>
                <span>🏠</span> View my listings
              </button>
              <button className="host-quick-btn host-quick-btn--secondary" onClick={() => setActiveTab("Reservations")}>
                <span>📅</span> View reservations
              </button>
            </div>
          </div>
        )}

        {/* ══════════ MY LISTINGS tab ══════════ */}
        {activeTab === "My Listings" && (
          <div className="host-tab-content">
            <div className="host-tab-header">
              <h2>My Listings</h2>
              <button className="host-tab-header__action" onClick={() => setActiveTab("Create Listing")}>
                + New listing
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="host-empty">
                <p className="host-empty__icon">🏠</p>
                <p className="host-empty__title">No listings yet</p>
                <p className="host-empty__sub">Create your first listing to start hosting guests.</p>
                <button className="host-empty__btn" onClick={() => setActiveTab("Create Listing")}>
                  Create a listing
                </button>
              </div>
            ) : (
              <div className="host-listings-grid">
                {listings.map((l) => (
                  <article key={l._id} className="host-listing-card">
                    <div className="host-listing-card__img-wrap">
                      <img
                        src={l.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"}
                        alt={l.title}
                        className="host-listing-card__img"
                      />
                    </div>
                    <div className="host-listing-card__body">
                      <p className="host-listing-card__type">{l.type}</p>
                      <h3 className="host-listing-card__title">{l.title}</h3>
                      <p className="host-listing-card__loc">📍 {l.location}</p>
                      <p className="host-listing-card__meta">
                        {l.bedrooms} bed · {l.bathrooms} bath · {l.guests} guests
                      </p>
                      <p className="host-listing-card__price">
                        R{Number(l.price).toLocaleString()} <span>/ night</span>
                      </p>
                    </div>
                    <div className="host-listing-card__actions">
                      <Link to={`/listings/${l._id}`} className="host-listing-card__preview">
                        Preview
                      </Link>
                      <button
                        type="button"
                        className="host-listing-card__delete"
                        onClick={() => handleDelete(l._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════ CREATE LISTING tab ══════════ */}
        {activeTab === "Create Listing" && (
          <div className="host-tab-content">
            <div className="host-tab-header">
              <h2>Create Listing</h2>
              <p className="host-tab-header__sub">Your listing will go live immediately on the guest page.</p>
            </div>

            <form className="host-form-card" onSubmit={handleSubmit}>
              <div className="host-form-section">
                <label className="host-form-label">Listing title *</label>
                <input className="host-form-input" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Stunning Sea Point Apartment" required />
              </div>

              <div className="host-form-section">
                <label className="host-form-label">Location *</label>
                <input className="host-form-input" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Sea Point, Cape Town" required />
              </div>

              <div className="host-form-section">
                <label className="host-form-label">Description *</label>
                <textarea className="host-form-input host-form-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Describe the space, views, neighbourhood…" required rows={5} />
              </div>

              <div className="host-form-row">
                <div className="host-form-section">
                  <label className="host-form-label">Property type *</label>
                  <select className="host-form-input" name="type" value={form.type} onChange={handleChange}>
                    <option>Entire apartment</option>
                    <option>Private room</option>
                    <option>Shared room</option>
                    <option>Hotel room</option>
                  </select>
                </div>
                <div className="host-form-section">
                  <label className="host-form-label">Price per night (R) *</label>
                  <input className="host-form-input" name="price" type="number" min="1" value={form.price} onChange={handleChange} placeholder="e.g. 1500" required />
                </div>
              </div>

              <div className="host-form-row">
                <div className="host-form-section">
                  <label className="host-form-label">Bedrooms *</label>
                  <input className="host-form-input" name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} required />
                </div>
                <div className="host-form-section">
                  <label className="host-form-label">Bathrooms *</label>
                  <input className="host-form-input" name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} required />
                </div>
                <div className="host-form-section">
                  <label className="host-form-label">Max guests *</label>
                  <input className="host-form-input" name="guests" type="number" min="1" value={form.guests} onChange={handleChange} required />
                </div>
              </div>

              <div className="host-form-section">
                <label className="host-form-label">Image URLs</label>
                <textarea className="host-form-input host-form-textarea" name="images" value={form.images} onChange={handleChange} placeholder="Paste one URL per line or comma-separated" rows={3} />
                <p className="host-form-hint">Leave blank to use a default image. Use Unsplash URLs for best results.</p>
              </div>

              <div className="host-form-footer">
                <button type="button" className="host-form-cancel" onClick={() => { setForm(initialForm); setActiveTab("My Listings"); }}>
                  Cancel
                </button>
                <button type="submit" className="host-form-submit">
                  Publish listing
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ══════════ RESERVATIONS tab ══════════ */}
        {activeTab === "Reservations" && (
          <div className="host-tab-content">
            <div className="host-tab-header">
              <h2>Reservations</h2>
              {pending > 0 && (
                <span className="host-tab-header__badge">{pending} pending</span>
              )}
            </div>

            {reservations.length === 0 ? (
              <div className="host-empty">
                <p className="host-empty__icon">📅</p>
                <p className="host-empty__title">No reservations yet</p>
                <p className="host-empty__sub">Reservations will appear here when guests book your stays.</p>
              </div>
            ) : (
              <div className="host-reservations-list">
                {reservations.map((r) => (
                  <article key={r._id} className="host-reservation-card">
                    <div className="host-reservation-card__info">
                      <p className="host-reservation-card__listing">
                        {r.accommodation?.title || "Your listing"}
                      </p>
                      <p className="host-reservation-card__dates">
                        📅 {r.checkInDate} → {r.checkOutDate}
                      </p>
                      <p className="host-reservation-card__guests">
                        👥 {r.numberOfGuests} guest{r.numberOfGuests === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="host-reservation-card__right">
                      <span className={`host-reservation-status host-reservation-status--${r.status}`}>
                        {r.status}
                      </span>
                      {r.status === "pending" && (
                        <div className="host-reservation-card__actions">
                          <button
                            type="button"
                            className="host-res-btn host-res-btn--approve"
                            onClick={() => handleReservationStatus(r._id, "confirmed")}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="host-res-btn host-res-btn--decline"
                            onClick={() => handleReservationStatus(r._id, "cancelled")}
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

export default HostDashboard;
