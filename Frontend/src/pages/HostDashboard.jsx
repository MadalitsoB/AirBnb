import { useEffect, useState } from "react";
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

  const loadDashboard = async () => {
    try {
      const me = await apiFetch("/users/me");
      if (!['host', 'admin'].includes(me.data?.role)) {
        navigate("/listings");
        return;
      }
      setUser(me.data);
      const [listingResponse, reservationResponse] = await Promise.all([
        apiFetch("/accommodations"),
        apiFetch("/reservations/host"),
      ]);
      const ownedListings = (listingResponse.data || []).filter((listing) => {
        const ownerId = typeof listing.host === "object" ? listing.host?._id : listing.host;
        return ownerId === me.data.id;
      });
      setListings(ownedListings);
      setReservations(reservationResponse.data || []);
    } catch (loadError) {
      setError(loadError.message || "Please log in as a host to continue.");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
          images: form.images.split(/\r?\n|,/).map((image) => image.trim()).filter(Boolean),
        }),
      });
      setForm(initialForm);
      setMessage("Your listing is now live.");
      loadDashboard();
    } catch (createError) {
      setError(createError.message || "Could not create listing.");
    }
  };

  return (
    <div className="host-page">
      <Navbar />
      <main className="host-dashboard">
        <div className="host-dashboard__heading">
          <div>
            <p className="host-dashboard__eyebrow">Host workspace</p>
            <h1>Welcome{user?.username ? `, ${user.username}` : ""}</h1>
            <p>Manage your stays and keep an eye on upcoming guests.</p>
          </div>
          <Link to="/listings" className="host-dashboard__browse">Browse stays</Link>
        </div>

        {error && <p className="host-dashboard__error">{error}</p>}
        {message && <p className="host-dashboard__success">{message}</p>}

        <div className="host-dashboard__stats">
          <div><strong>{listings.length}</strong><span>Active listings</span></div>
          <div><strong>{reservations.length}</strong><span>Reservations</span></div>
          <div><strong>{reservations.filter((item) => item.status === "pending").length}</strong><span>Awaiting response</span></div>
        </div>

        <div className="host-dashboard__grid">
          <section className="host-panel">
            <h2>Create a listing</h2>
            <p className="host-panel__hint">Add a stay for guests to discover in South Africa.</p>
            <form className="host-form" onSubmit={handleSubmit}>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Listing title" required />
              <input name="location" value={form.location} onChange={handleChange} placeholder="Location, e.g. Sandton, South Africa" required />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the space" required rows="4" />
              <select name="type" value={form.type} onChange={handleChange}>
                <option>Entire apartment</option>
                <option>Private room</option>
                <option>Shared room</option>
                <option>Hotel room</option>
              </select>
              <div className="host-form__row">
                <input name="price" type="number" min="1" value={form.price} onChange={handleChange} placeholder="Price per night (R)" required />
                <input name="guests" type="number" min="1" value={form.guests} onChange={handleChange} placeholder="Guests" required />
              </div>
              <div className="host-form__row">
                <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} placeholder="Bedrooms" required />
                <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} placeholder="Bathrooms" required />
              </div>
              <textarea name="images" value={form.images} onChange={handleChange} placeholder="Image URLs, one per line" rows="3" />
              <button type="submit" className="host-form__submit">Publish listing</button>
            </form>
          </section>

          <section className="host-panel">
            <h2>Reservations</h2>
            {reservations.length === 0 ? (
              <p className="host-panel__empty">No reservations yet. They will appear here when a guest books one of your stays.</p>
            ) : (
              <div className="reservation-list">
                {reservations.map((reservation) => (
                  <article key={reservation._id} className="reservation-item">
                    <div>
                      <strong>{reservation.accommodation?.title || "Your listing"}</strong>
                      <p>{reservation.checkInDate} to {reservation.checkOutDate}</p>
                      <p>{reservation.numberOfGuests} guest{reservation.numberOfGuests === 1 ? "" : "s"}</p>
                    </div>
                    <span className={`reservation-status reservation-status--${reservation.status}`}>{reservation.status}</span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default HostDashboard;
