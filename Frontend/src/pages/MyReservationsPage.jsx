import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiFetch } from "../services/api";

const STATUS_LABELS = {
  pending:   { label: "Pending",   cls: "res-status--pending"   },
  confirmed: { label: "Confirmed", cls: "res-status--confirmed" },
  cancelled: { label: "Cancelled", cls: "res-status--cancelled" },
  completed: { label: "Completed", cls: "res-status--completed" },
};

function fmtDate(str) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-ZA", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function MyReservationsPage() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [cancelMsg, setCancelMsg]       = useState("");

  const token = localStorage.getItem("airbnbToken");
  const user  = JSON.parse(localStorage.getItem("airbnbUser") || "null");

  useEffect(() => {
    if (!token) { navigate("/login", { replace: true }); return; }

    apiFetch("/reservations/user")
      .then((data) => setReservations(data?.data || []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    try {
      await apiFetch(`/reservations/${id}`, { method: "DELETE" });
      setCancelMsg("Reservation cancelled.");
      setReservations((prev) => prev.filter((r) => r._id !== id));
      setTimeout(() => setCancelMsg(""), 4000);
    } catch (err) {
      setCancelMsg(err.message || "Could not cancel reservation.");
    }
  };

  return (
    <div className="my-res-page">
      <Navbar />

      <main className="my-res-wrap">
        <div className="my-res-header">
          <div>
            <h1 className="my-res-title">My Reservations</h1>
            <p className="my-res-sub">All stays you have booked are listed here.</p>
          </div>
          <Link to="/listings" className="my-res-browse">Browse more stays</Link>
        </div>

        {cancelMsg && (
          <div className={`res-toast ${cancelMsg.includes("cancelled") ? "res-toast--success" : "res-toast--error"}`}>
            {cancelMsg}
          </div>
        )}

        {loading ? (
          <div className="my-res-skeletons">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="my-res-skeleton">
                <div className="my-res-skeleton__img" />
                <div className="my-res-skeleton__lines">
                  <div className="my-res-skeleton__line my-res-skeleton__line--long" />
                  <div className="my-res-skeleton__line my-res-skeleton__line--short" />
                </div>
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="my-res-empty">
            <p className="my-res-empty__icon">🏡</p>
            <h2>No reservations yet</h2>
            <p>When you book a stay it will appear here.</p>
            <Link to="/listings" className="my-res-empty__btn">Start exploring</Link>
          </div>
        ) : (
          <div className="my-res-list">
            {reservations.map((r) => {
              const acc    = r.accommodation || {};
              const status = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
              const nights = r.priceBreakdown?.numberOfNights || "—";
              const img    = acc.images?.[0] ||
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

              return (
                <article key={r._id} className="res-card">
                  {/* Image */}
                  <Link to={`/listings/${acc._id}`} className="res-card__img-wrap">
                    <img src={img} alt={acc.title} className="res-card__img" />
                  </Link>

                  {/* Details */}
                  <div className="res-card__body">
                    <div className="res-card__top">
                      <div>
                        <p className="res-card__type">{acc.type || "Stay"}</p>
                        <h3 className="res-card__title">
                          <Link to={`/listings/${acc._id}`}>{acc.title || "Your reservation"}</Link>
                        </h3>
                        <p className="res-card__loc">📍 {acc.location || "South Africa"}</p>
                      </div>
                      <span className={`res-status ${status.cls}`}>{status.label}</span>
                    </div>

                    <div className="res-card__dates">
                      <div className="res-card__date-block">
                        <span className="res-card__date-label">Check-in</span>
                        <span className="res-card__date-value">{fmtDate(r.checkInDate)}</span>
                      </div>
                      <div className="res-card__date-arrow">→</div>
                      <div className="res-card__date-block">
                        <span className="res-card__date-label">Check-out</span>
                        <span className="res-card__date-value">{fmtDate(r.checkOutDate)}</span>
                      </div>
                      <div className="res-card__date-block">
                        <span className="res-card__date-label">Nights</span>
                        <span className="res-card__date-value">{nights}</span>
                      </div>
                      <div className="res-card__date-block">
                        <span className="res-card__date-label">Guests</span>
                        <span className="res-card__date-value">{r.numberOfGuests}</span>
                      </div>
                    </div>

                    <div className="res-card__footer">
                      <p className="res-card__total">
                        Total: <strong>R{(r.totalPrice || r.priceBreakdown?.total || 0).toLocaleString()}</strong>
                      </p>
                      {r.status !== "cancelled" && r.status !== "completed" && (
                        <button
                          type="button"
                          className="res-card__cancel"
                          onClick={() => handleCancel(r._id)}
                        >
                          Cancel reservation
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyReservationsPage;
