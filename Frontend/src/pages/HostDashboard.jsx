import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiFetch } from "../services/api";

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
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const me = await apiFetch("/users/me");

      // Hard block — guests cannot access this page at all
      if (!me.data || !["host", "admin"].includes(me.data.role)) {
        navigate("/", { replace: true });
        return;
      }

      setUser(me.data);

      const [listingResponse, reservationResponse] = await Promise.all([
        apiFetch("/accommodations"),
        apiFetch("/reservations/host"),
      ]);

      // Only show this host's own listings
      const ownedListings = (listingResponse.data || []).filter((listing) => {
        const ownerId =
          typeof listing.host === "object"
            ? listing.host?._id?.toString()
            : listing.host?.toString();
        return ownerId === me.data.id?.toString();
      });

      setListings(ownedListings);
      setReservations(reservationResponse.data || []);
    } catch {
      // No valid token or network error — send to login
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await apiFetch("/accommodations", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          bedrooms: Number(form.bedrooms),
          bathrooms: Number(form.bathrooms),
          guests: Number(form.guests),
          images: form.images
            .split(/\r?\n|,/)
            .map((img) => img.trim())
            .filter(Boolean),
        }),
      });
      setForm(initialForm);
      setMessage("Your listing is now live and visible to guests.");
      loadDashboard();
    } catch (err) {
      setError(err.message || "Could not create listing.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing? This cannot be undone.")) return;
    try {
      await apiFetch(`/accommodations/${id}`, { method: "DELETE" });
      setMessage("Listing deleted.");
      loadDashboard();
    } catch (err) {
      setError(err.message || "Could not delete listing.");
    }
  };

  const handleReservationStatus = async (id, status) => {
    try {
      await apiFetch(`/reservations/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMessage(`Reservation ${status}.`);
      loadDashboard();
    } catch (err) {
      setError(err.message || "Could not update reservation.");
    }
  };

  // Show nothing while auth check runs
  if (!user) return null;

  return (
    <div className="host-page">
      <Navbar />
      <main className="host-dashboard">

        <div className="host-dashboard__heading">
          <div>
            <p className="host-dashboard__eyebrow">Host workspace</p>
            <h1>Welcome, {user.username}</h1>
            <p>Create and manage your South African listings.</p>
          </div>
          <Link to="/listings" className="host-dashboard__browse">
            Preview guest view
          </Link>
        </div>

        {error && <p className="host-dashboard__error">{error}</p>}
        {message && <p className="host-dashboard__success">{message}</p>}

        <div className="host-dashboard__stats">
          <div>
            <strong>{listings.length}</strong>
            <span>Active listings</span>
          </div>
          <div>
            <strong>{reservations.length}</strong>
            <span>Reservations</span>
          </div>
          <div>
            <strong>{reservations.filter((r) => r.status === "pending").length}</strong>
            <span>Awaiting response</span>
          </div>
        </div>

        <div className="host-dashboard__grid">

          {/* Create listing form */}
          <section className="host-panel">
            <h2>Create a new listing</h2>
            <p className="host-panel__hint">
              Fill in the details below and hit Publish. Your listing will immediately appear on the guest listings page.
            </p>
            <form className="host-form" onSubmit={handleSubmit}>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Listing title"
                required
              />
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location — e.g. Sandton, Johannesburg"
                required
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the space for guests"
                required
                rows={4}
              />
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Entire apartment</option>
                <option>Private room</option>
                <option>Shared room</option>
                <option>Hotel room</option>
              </select>
              <div className="host-form__row">
                <input
                  name="price"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price per night (R)"
                  required
                />
                <input
                  name="guests"
                  type="number"
                  min="1"
                  value={form.guests}
                  onChange={handleChange}
                  placeholder="Max guests"
                  required
                />
              </div>
              <div className="host-form__row">
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={handleChange}
                  placeholder="Bedrooms"
                  required
                />
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  value={form.bathrooms}
                  onChange={handleChange}
                  placeholder="Bathrooms"
                  required
                />
              </div>
              <textarea
                name="images"
                value={form.images}
                onChange={handleChange}
                placeholder="Image URLs — one per line or comma-separated"
                rows={3}
              />
              <button type="submit" className="host-form__submit">
                Publish listing
              </button>
            </form>
          </section>

          {/* Reservations panel */}
          <section className="host-panel">
            <h2>Reservations</h2>
            {reservations.length === 0 ? (
              <p className="host-panel__empty">
                No reservations yet. They'll appear here when guests book your stays.
              </p>
            ) : (
              <div className="reservation-list">
                {reservations.map((r) => (
                  <article key={r._id} className="reservation-item">
                    <div>
                      <strong>{r.accommodation?.title || "Your listing"}</strong>
                      <p>{r.checkInDate} → {r.checkOutDate}</p>
                      <p>{r.numberOfGuests} guest{r.numberOfGuests === 1 ? "" : "s"}</p>
                    </div>
                    <span className={`reservation-status reservation-status--${r.status}`}>
                      {r.status}
                    </span>
                    {r.status === "pending" && (
                      <div className="reservation-item__actions">
                        <button type="button" onClick={() => handleReservationStatus(r._id, "confirmed")}>
                          Approve
                        </button>
                        <button type="button" onClick={() => handleReservationStatus(r._id, "cancelled")}>
                          Decline
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Your listings */}
        <section className="host-panel host-panel--listings">
          <h2>Your published listings</h2>
          {listings.length === 0 ? (
            <p className="host-panel__empty">
              No listings yet. Use the form above to create your first one.
            </p>
          ) : (
            <div className="host-listing-list">
              {listings.map((l) => (
                <article key={l._id} className="host-listing-item">
                  {l.images?.[0] && (
                    <img src={l.images[0]} alt={l.title} className="host-listing-item__img" />
                  )}
                  <div className="host-listing-item__body">
                    <strong>{l.title}</strong>
                    <p>{l.location}</p>
                    <p className="host-listing-item__price">
                      R{Number(l.price).toLocaleString()} / night
                    </p>
                  </div>
                  <div className="host-listing-item__actions">
                    <Link to={`/listings/${l._id}`} className="host-listing-item__preview">
                      Preview
                    </Link>
                    <button type="button" className="host-listing-item__delete" onClick={() => handleDelete(l._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default HostDashboard;
