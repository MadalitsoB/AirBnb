import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiFetch } from "../services/api";

const AMENITIES = [
  { icon: "🌊", label: "Ocean view" },
  { icon: "🍳", label: "Kitchen" },
  { icon: "📶", label: "Fast wifi" },
  { icon: "🅿️", label: "Free parking" },
  { icon: "🏊", label: "Pool" },
  { icon: "❄️", label: "Air conditioning" },
  { icon: "🛁", label: "Bathtub" },
  { icon: "🏋️", label: "Gym" },
];

const ALL_AMENITIES = [
  ...AMENITIES,
  { icon: "🔥", label: "Indoor fireplace" },
  { icon: "🌿", label: "Private garden" },
  { icon: "🧺", label: "Washing machine" },
  { icon: "📺", label: "Smart TV" },
  { icon: "🧴", label: "Essentials" },
  { icon: "🛏️", label: "Bed linens" },
  { icon: "🚿", label: "Hot water" },
  { icon: "🔒", label: "Self check-in" },
  { icon: "🌅", label: "Outdoor dining" },
  { icon: "🧯", label: "Smoke alarm" },
  { icon: "🧳", label: "Luggage drop-off" },
];

const REVIEWS = [
  {
    name: "Sarah M.",
    date: "October 2024",
    avatar: "S",
    text: "Absolutely stunning place. The views were breathtaking and the host was incredibly attentive. Would definitely come back!",
  },
  {
    name: "James K.",
    date: "September 2024",
    avatar: "J",
    text: "Perfect getaway. Clean, modern and exactly as described. Great location close to restaurants and shops.",
  },
  {
    name: "Lerato N.",
    date: "August 2024",
    avatar: "L",
    text: "One of the best Airbnbs I've stayed in. Very spacious and comfortable. The check-in was seamless.",
  },
  {
    name: "Tom P.",
    date: "July 2024",
    avatar: "T",
    text: "Lovely property in a great area. The amenities were top-notch. Highly recommend for families.",
  },
];

function ListingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(4);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [reservationMessage, setReservationMessage] = useState({
    text: "",
    type: "",
  });
  const dismissTimer = useRef(null);

  const showAlert = (text, type) => {
    clearTimeout(dismissTimer.current);
    setReservationMessage({ text, type });
    dismissTimer.current = setTimeout(
      () => setReservationMessage({ text: "", type: "" }),
      4000,
    );
  };

  // Only the listing's own host can edit photos
  const currentUser = JSON.parse(localStorage.getItem("airbnbUser") || "null");
  const isOwner = currentUser && ["host", "admin"].includes(currentUser.role);

  useEffect(() => {
    apiFetch(`/accommodations/${id}`)
      .then((data) => {
        if (data?.success) {
          setListing(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="detail-loading">
        <Navbar />
        <div className="detail-loading__bar" />
      </div>
    );
  }

  // Use fallback data if no listing found
  const item = listing || {
    title: "Luxury Beachfront Villa",
    location: "Cape Town, South Africa",
    type: "Entire villa",
    price: 2500,
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    rating: 4.97,
    reviewCount: 211,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    ],
    host: { username: "Maria", email: "maria@example.com" },
    description:
      "A stunning beachfront villa with panoramic ocean views. This spacious retreat offers the perfect blend of luxury and comfort, featuring modern amenities, a private pool, and direct beach access. Ideal for families or groups looking for an unforgettable South African experience.",
  };

  const images = item.images?.length
    ? item.images
    : [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      ];

  const displayedImages = images;

  const maxGuests = Math.max(10, Number(item.guests) || 10);

  const nights =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000),
        )
      : 5;

  const subtotal = (item.price || 2500) * nights;
  const weeklyDiscount =
    nights >= 7 ? (subtotal * Number(item.weeklyDiscount || 0)) / 100 : 0;
  const cleaningFee = Number(item.cleaningFee || 0);
  const serviceFee = Number(item.serviceFee || 0);
  const occupancyTaxes = Number(item.occupancyTaxes || 0);
  const total =
    subtotal - weeklyDiscount + cleaningFee + serviceFee + occupancyTaxes;

  const jumpToReviews = (event) => {
    event.preventDefault();
    document.getElementById("reviews")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    document.getElementById("reviews")?.focus({ preventScroll: true });
  };

  const handleReserve = async () => {
    if (!localStorage.getItem("airbnbToken")) {
      showAlert("Please login to make a reservation.", "error");
      return;
    }

    if (!checkIn || !checkOut) {
      showAlert("Please select your check-in and check-out dates.", "error");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      showAlert("Check-out date must be after check-in.", "error");
      return;
    }

    try {
      await apiFetch("/reservations", {
        method: "POST",
        body: JSON.stringify({
          accommodation: item._id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: guests,
          priceBreakdown: {
            nightlyRate: item.price || 2500,
            numberOfNights: nights,
            subtotal,
            weeklyDiscount: 0,
            cleaningFee,
            serviceFee,
            occupancyTaxes: 0,
            total,
          },
        }),
      });
      showAlert("Reservation successful!", "success");
    } catch (error) {
      showAlert(error.message || "Could not create reservation.", "error");
    }
  };

  return (
    <div className="detail-page">
      <Navbar />

      {/* ── Top-of-page alert toast ── */}
      {reservationMessage.text && (
        <div
          className={`page-toast page-toast--${reservationMessage.type}`}
          role="alert"
        >
          <span className="page-toast__icon">
            {reservationMessage.type === "success" ? "✓" : "!"}
          </span>
          <span className="page-toast__text">{reservationMessage.text}</span>
          <button
            type="button"
            className="page-toast__close"
            onClick={() => setReservationMessage({ text: "", type: "" })}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      <div className="detail-wrap">
        {/* Title */}
        <div className="detail-header">
          <h1 className="detail-title">{item.title}</h1>
          <div className="detail-header__row">
            <div className="detail-header__meta">
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                fill="currentColor"
              >
                <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.71 4.13L8 10.4l-3.71 1.95.71-4.13L2 5.5l4.15-.75L8 1z" />
              </svg>
              <strong>{item.rating || 4.97}</strong>
              <span className="detail-header__dot">·</span>
              <a
                href="#reviews"
                className="detail-header__reviews"
                onClick={jumpToReviews}
              >
                {item.reviewCount || 211} reviews
              </a>
              <span className="detail-header__dot">·</span>
              <span className="detail-header__loc">{item.location}</span>
            </div>
            <div className="detail-header__actions">
              {isOwner && (
                <button
                  type="button"
                  className="detail-action-btn"
                  onClick={() => navigate(`/host`)}
                >
                  Edit listing
                </button>
              )}
              <button className="detail-action-btn">
                <svg
                  viewBox="0 0 16 16"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M2 8l4 4 8-8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Share
              </button>
              <button className="detail-action-btn">
                <svg
                  viewBox="0 0 16 16"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M8 2.5C5.5 2.5 3 4.5 3 7c0 3 5 7.5 5 7.5S13 10 13 7c0-2.5-2.5-4.5-5-4.5zm0 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Photo grid */}
        <div className="detail-gallery">
          <div className="detail-gallery__main">
            <img
              src={displayedImages[0]}
              alt={item.title}
              className="detail-gallery__img detail-gallery__img--main"
            />
          </div>
          <div className="detail-gallery__side">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="detail-gallery__side-cell">
                <img
                  src={displayedImages[i] || displayedImages[0]}
                  alt={`${item.title} ${i + 1}`}
                  className="detail-gallery__img"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="detail-gallery__all-btn"
            onClick={() => setShowAllPhotos(true)}
          >
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>
            Show all photos
          </button>
        </div>

        {showAllPhotos && (
          <div
            className="detail-gallery-modal"
            onClick={() => setShowAllPhotos(false)}
          >
            <div
              className="detail-gallery-modal__panel"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="detail-gallery-modal__header">
                <h3>Photos</h3>
                <button
                  type="button"
                  className="detail-gallery-modal__close"
                  onClick={() => setShowAllPhotos(false)}
                >
                  Close
                </button>
              </div>
              <div className="detail-gallery-modal__grid">
                {displayedImages.map((img, index) => (
                  <img
                    key={`${img}-${index}`}
                    src={img}
                    alt={`${item.title} ${index + 1}`}
                    className="detail-gallery-modal__img"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {showAllAmenities && (
          <div
            className="detail-gallery-modal"
            onClick={() => setShowAllAmenities(false)}
          >
            <div
              className="detail-gallery-modal__panel amenities-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="detail-gallery-modal__header">
                <h3>What this place offers</h3>
                <button
                  type="button"
                  className="detail-gallery-modal__close"
                  onClick={() => setShowAllAmenities(false)}
                >
                  Close
                </button>
              </div>
              <div className="amenities-modal__grid">
                {ALL_AMENITIES.map((amenity) => (
                  <div key={amenity.label} className="amenity-item">
                    <span className="amenity-item__icon">{amenity.icon}</span>
                    <span>{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="detail-body">
          {/* Left column */}
          <div className="detail-body__left">
            {/* Host info */}
            <div className="detail-host">
              <div className="detail-host__info">
                <h2 className="detail-host__title">
                  {item.type || "Entire villa"} hosted by{" "}
                  {item.host?.username || "Maria"}
                </h2>
                <p className="detail-host__meta">
                  {item.guests || 8} guests · {item.bedrooms || 4} bedrooms ·{" "}
                  {item.bathrooms || 3} bathrooms
                </p>
              </div>
              <div className="detail-host__avatar">
                <div className="detail-host__avatar-circle">
                  {(item.host?.username || "M")[0].toUpperCase()}
                </div>
              </div>
            </div>

            <hr className="detail-divider" />

            {/* Highlights */}
            <div className="detail-highlights">
              {[
                {
                  icon: "🏅",
                  title: "Maria is a Superhost",
                  sub: "Superhosts are experienced, highly rated hosts.",
                },
                {
                  icon: "📍",
                  title: "Great location",
                  sub: "100% of recent guests gave the location a 5-star rating.",
                },
                {
                  icon: "🗓️",
                  title: "Free cancellation for 48 hours",
                  sub: "Get a full refund if you change your mind.",
                },
              ].map((h) => (
                <div key={h.title} className="detail-highlight">
                  <span className="detail-highlight__icon">{h.icon}</span>
                  <div>
                    <p className="detail-highlight__title">{h.title}</p>
                    <p className="detail-highlight__sub">{h.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="detail-divider" />

            {/* Description */}
            <div className="detail-desc">
              <p>
                {item.description ||
                  "A beautiful and spacious property with stunning views. Perfect for a relaxing getaway or a family holiday. Fully equipped kitchen, fast WiFi, and all the comforts of home."}
              </p>
            </div>

            <hr className="detail-divider" />

            {/* Sleeping arrangements */}
            <div className="detail-static-section">
              <h3 className="detail-section-title">Where you&apos;ll sleep</h3>
              <div className="sleeping-grid">
                <div className="sleeping-card">
                  <span className="sleeping-card__icon">🛏️</span>
                  <strong>{item.bedrooms || 4} bedrooms</strong>
                  <span>Comfortable beds for a restful stay</span>
                </div>
                <div className="sleeping-card">
                  <span className="sleeping-card__icon">🛋️</span>
                  <strong>Shared living space</strong>
                  <span>Relax together after a day exploring</span>
                </div>
              </div>
            </div>

            <hr className="detail-divider" />

            {/* Amenities */}
            <div className="detail-amenities">
              <h3 className="detail-section-title">What this place offers</h3>
              <div className="amenities-grid">
                {AMENITIES.map((a) => (
                  <div key={a.label} className="amenity-item">
                    <span className="amenity-item__icon">{a.icon}</span>
                    <span>{a.label}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="detail-show-all-btn"
                onClick={() => setShowAllAmenities(true)}
              >
                Show all 20 amenities
              </button>
            </div>

            <hr className="detail-divider" />

            {/* Policies and practical information */}
            <div className="detail-policies">
              <h3 className="detail-section-title">Things to know</h3>
              <div className="detail-policies__grid">
                <div>
                  <h4>House rules</h4>
                  <p>Check-in after 15:00 · Checkout before 10:00</p>
                  <p>No smoking · No parties or events</p>
                </div>
                <div>
                  <h4>Health and safety</h4>
                  <p>Smoke alarm and carbon monoxide alarm installed</p>
                  <p>Enhanced cleaning between stays</p>
                </div>
                <div>
                  <h4>Cancellation policy</h4>
                  <p>Free cancellation for 48 hours after booking.</p>
                  <p>Review the full policy before reserving.</p>
                </div>
              </div>
            </div>

            <hr className="detail-divider" />

            {/* Reviews */}
            <div className="detail-reviews" id="reviews" tabIndex="-1">
              <div className="detail-reviews__header">
                <svg
                  viewBox="0 0 16 16"
                  width="18"
                  height="18"
                  fill="currentColor"
                >
                  <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.71 4.13L8 10.4l-3.71 1.95.71-4.13L2 5.5l4.15-.75L8 1z" />
                </svg>
                <span className="detail-reviews__score">
                  {item.rating || 4.97}
                </span>
                <span className="detail-reviews__dot">·</span>
                <span className="detail-reviews__count">
                  {item.reviewCount || 211} reviews
                </span>
              </div>

              {/* Rating breakdown */}
              <div className="reviews-breakdown">
                {[
                  "Cleanliness",
                  "Accuracy",
                  "Check-in",
                  "Communication",
                  "Location",
                  "Value",
                ].map((cat, index) => (
                  <div key={cat} className="review-bar">
                    <span className="review-bar__label">{cat}</span>
                    <div className="review-bar__track">
                      <div
                        className="review-bar__fill"
                        style={{ width: `${90 + (index % 3) * 3}%` }}
                      />
                    </div>
                    <span className="review-bar__score">
                      4.{index % 2 === 0 ? "9" : "8"}
                    </span>
                  </div>
                ))}
              </div>

              <div className="reviews-grid">
                {REVIEWS.map((r) => (
                  <div key={r.name} className="review-card">
                    <div className="review-card__top">
                      <div className="review-card__avatar">{r.avatar}</div>
                      <div>
                        <p className="review-card__name">{r.name}</p>
                        <p className="review-card__date">{r.date}</p>
                      </div>
                    </div>
                    <p className="review-card__text">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Booking widget */}
          <div className="detail-body__right">
            <div className="booking-widget">
              <div className="booking-widget__price">
                <strong className="booking-widget__amount">
                  R{(item.price || 2500).toLocaleString()}
                </strong>
                <span className="booking-widget__per"> night</span>
              </div>
              <div className="booking-widget__rating">
                <svg
                  viewBox="0 0 16 16"
                  width="12"
                  height="12"
                  fill="currentColor"
                >
                  <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.71 4.13L8 10.4l-3.71 1.95.71-4.13L2 5.5l4.15-.75L8 1z" />
                </svg>
                <strong>{item.rating || 4.97}</strong>
                <span> · {item.reviewCount || 211} reviews</span>
              </div>

              <div className="booking-widget__dates">
                <div className="booking-date-cell booking-date-cell--left">
                  <label>CHECK-IN</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="booking-date-cell booking-date-cell--right">
                  <label>CHECKOUT</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="booking-guests-cell">
                <label>GUESTS</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                >
                  {[...Array(maxGuests)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} guest{i > 0 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="booking-reserve-btn"
                onClick={handleReserve}
              >
                Reserve
              </button>
              <p className="booking-widget__note">You won't be charged yet</p>

              <div className="booking-widget__breakdown">
                <div className="booking-breakdown-row">
                  <span>
                    R{(item.price || 2500).toLocaleString()} × {nights} nights
                  </span>
                  <span>R{subtotal.toLocaleString()}</span>
                </div>
                {weeklyDiscount > 0 && (
                  <div className="booking-breakdown-row booking-breakdown-row--discount">
                    <span>Weekly discount</span>
                    <span>-R{weeklyDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="booking-breakdown-row">
                  <span>Cleaning fee</span>
                  <span>R{cleaningFee.toLocaleString()}</span>
                </div>
                <div className="booking-breakdown-row">
                  <span>Airbnb service fee</span>
                  <span>R{serviceFee.toLocaleString()}</span>
                </div>
                <div className="booking-breakdown-row">
                  <span>Occupancy taxes</span>
                  <span>R{occupancyTaxes.toLocaleString()}</span>
                </div>
              </div>

              <div className="booking-widget__total">
                <strong>Total before taxes</strong>
                <strong>R{total.toLocaleString()}</strong>
              </div>
            </div>

            {/* Report link */}
            <div className="detail-report">
              <svg
                viewBox="0 0 16 16"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M8 3v5M8 10v1" strokeLinecap="round" />
                <circle cx="8" cy="8" r="7" />
              </svg>
              Report this listing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingDetailsPage;
