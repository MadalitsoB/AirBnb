import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

const FALLBACK_LOCATIONS = [
  "Sea Point, Cape Town",
  "Clifton, Cape Town",
  "Maboneng, Johannesburg",
  "Sandton, Johannesburg",
  "Golden Mile, Durban",
  "Stellenbosch, Western Cape",
  "Hermanus, Western Cape",
  "Knysna, Garden Route",
  "Central Drakensberg, KwaZulu-Natal",
  "Franschhoek, Western Cape",
  "Tsitsikamma, Eastern Cape",
  "V&A Waterfront, Cape Town",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/* ── tiny calendar ── */
function MiniCalendar({ value, minDate, maxDate, onChange, onClose }) {
  const today = new Date();
  const initDate = value ? new Date(value + "T00:00:00") : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const toStr = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="mini-cal">
      <div className="mini-cal__nav">
        <button type="button" className="mini-cal__nav-btn" onClick={prevMonth}>
          ‹
        </button>
        <span className="mini-cal__heading">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button type="button" className="mini-cal__nav-btn" onClick={nextMonth}>
          ›
        </button>
      </div>
      <div className="mini-cal__grid">
        {DAYS.map((d) => (
          <span key={d} className="mini-cal__dow">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`e${i}`} />;
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = dateStr === value;
          const isToday = dateStr === toStr(today);
          const tooEarly = minDate && dateStr < minDate;
          const tooLate = maxDate && dateStr > maxDate;
          const disabled = tooEarly || tooLate;
          return (
            <button
              key={dateStr}
              type="button"
              disabled={disabled}
              className={`mini-cal__day ${isSelected ? "mini-cal__day--selected" : ""} ${isToday && !isSelected ? "mini-cal__day--today" : ""} ${disabled ? "mini-cal__day--disabled" : ""}`}
              onClick={() => {
                onChange(dateStr);
                onClose();
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── counter row used in guests dropdown ── */
function CounterRow({ label, sub, value, onDec, onInc, min = 0, max = 16 }) {
  return (
    <div className="guests-counter">
      <div className="guests-counter__info">
        <span className="guests-counter__label">{label}</span>
        <span className="guests-counter__sub">{sub}</span>
      </div>
      <div className="guests-counter__controls">
        <button
          type="button"
          className="guests-counter__btn"
          onClick={onDec}
          disabled={value <= min}
        >
          −
        </button>
        <span className="guests-counter__num">{value}</span>
        <button
          type="button"
          className="guests-counter__btn"
          onClick={onInc}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════ */
function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [availableLocations, setAvailableLocations] =
    useState(FALLBACK_LOCATIONS);

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [guestsOpen, setGuestsOpen] = useState(false);
  const [adults, setAdults] = useState(0);
  const [children, setChildren] = useState(0);

  const locationRef = useRef(null);
  const checkInRef = useRef(null);
  const checkOutRef = useRef(null);
  const guestsRef = useRef(null);
  const locationInputRef = useRef(null);

  const token = localStorage.getItem("airbnbToken");
  const user = JSON.parse(localStorage.getItem("airbnbUser") || "null");
  const isHost = ["host", "admin"].includes(user?.role);

  /* fetch real locations */
  useEffect(() => {
    apiFetch("/api/accommodations")
      .then((data) => {
        const items = Array.isArray(data?.data) ? data.data : [];
        if (!items.length) return;
        const seen = new Set();
        const locs = [];
        items.forEach((item) => {
          const loc = (item.location || "").trim();
          if (loc && !seen.has(loc)) {
            seen.add(loc);
            locs.push(loc);
          }
        });
        if (locs.length) setAvailableLocations(locs);
      })
      .catch(() => {});
  }, []);

  /* close all dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationOpen(false);
        setLocationQuery("");
      }
      if (checkInRef.current && !checkInRef.current.contains(e.target))
        setCheckInOpen(false);
      if (checkOutRef.current && !checkOutRef.current.contains(e.target))
        setCheckOutOpen(false);
      if (guestsRef.current && !guestsRef.current.contains(e.target))
        setGuestsOpen(false);
      if (menuOpen && !e.target.closest(".navbar__user")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  useEffect(() => {
    if (locationOpen && locationInputRef.current)
      locationInputRef.current.focus();
  }, [locationOpen]);

  const closeAll = () => {
    setLocationOpen(false);
    setCheckInOpen(false);
    setCheckOutOpen(false);
    setGuestsOpen(false);
    setLocationQuery("");
  };

  const handleLogout = () => {
    localStorage.removeItem("airbnbToken");
    localStorage.removeItem("airbnbUser");
    navigate("/");
    setMenuOpen(false);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    const total = adults + children;
    if (total > 0) params.set("guests", String(total));
    navigate(`/listings${params.toString() ? `?${params.toString()}` : ""}`);
    closeAll();
    setMenuOpen(false);
  };

  const filteredLocations = locationQuery.trim()
    ? availableLocations.filter((l) =>
        l.toLowerCase().includes(locationQuery.toLowerCase()),
      )
    : availableLocations;

  const today = new Date().toISOString().split("T")[0];

  const fmtDate = (d) =>
    d
      ? new Date(d + "T00:00:00").toLocaleDateString("en-ZA", {
          day: "numeric",
          month: "short",
        })
      : null;

  const totalGuests = adults + children;
  const guestsLabel =
    totalGuests > 0
      ? `${totalGuests} guest${totalGuests > 1 ? "s" : ""}`
      : "Add guests";

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <svg viewBox="0 0 32 32" width="30" height="30" fill="#FF385C">
            <path d="M16 1C10.925 1 6 6.925 6 13c0 7.5 10 18 10 18s10-10.5 10-18C26 6.925 21.075 1 16 1zm0 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
          </svg>
          <span>airbnb</span>
        </Link>

        {/* ── Search pill (guests & logged-out only) ── */}
        <div
          className={`navbar__search ${isHost ? "navbar__search--hidden" : ""}`}
        >
          <div className="navbar__search-pill">
            {/* LOCATION */}
            <div className="navbar__search-field" ref={locationRef}>
              <button
                type="button"
                className={`navbar__search-option ${locationOpen ? "navbar__search-option--active" : ""}`}
                onClick={() => {
                  setLocationOpen((v) => !v);
                  setCheckInOpen(false);
                  setCheckOutOpen(false);
                  setGuestsOpen(false);
                  setMenuOpen(false);
                }}
              >
                <span className="navbar__search-label">Location</span>
                <span
                  className={`navbar__search-value ${!location ? "navbar__search-value--placeholder" : ""}`}
                >
                  {location || "Where are you going?"}
                </span>
              </button>

              {locationOpen && (
                <div className="search-dropdown search-dropdown--location">
                  <div className="search-dropdown__search-wrap">
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="#717171"
                      strokeWidth="1.5"
                    >
                      <circle cx="6.5" cy="6.5" r="4.5" />
                      <path d="M10 10l3 3" strokeLinecap="round" />
                    </svg>
                    <input
                      ref={locationInputRef}
                      type="text"
                      className="search-dropdown__search-input"
                      placeholder="Search destinations…"
                      value={locationQuery}
                      onChange={(e) => setLocationQuery(e.target.value)}
                    />
                    {locationQuery && (
                      <button
                        type="button"
                        className="search-dropdown__search-clear"
                        onClick={() => setLocationQuery("")}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  <p className="search-dropdown__title">
                    {locationQuery
                      ? `Results for "${locationQuery}"`
                      : "Available destinations"}
                  </p>
                  <div className="search-dropdown__list">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          className={`search-dropdown__item ${location === loc ? "search-dropdown__item--active" : ""}`}
                          onClick={() => {
                            setLocation(loc);
                            setLocationOpen(false);
                            setLocationQuery("");
                          }}
                        >
                          <span className="search-dropdown__item-icon">📍</span>
                          <span className="search-dropdown__item-text">
                            {locationQuery
                              ? (() => {
                                  const idx = loc
                                    .toLowerCase()
                                    .indexOf(locationQuery.toLowerCase());
                                  if (idx === -1) return loc;
                                  return (
                                    <>
                                      {loc.slice(0, idx)}
                                      <strong>
                                        {loc.slice(
                                          idx,
                                          idx + locationQuery.length,
                                        )}
                                      </strong>
                                      {loc.slice(idx + locationQuery.length)}
                                    </>
                                  );
                                })()
                              : loc}
                          </span>
                          {location === loc && (
                            <svg
                              viewBox="0 0 16 16"
                              width="14"
                              height="14"
                              style={{ marginLeft: "auto", flexShrink: 0 }}
                            >
                              <path
                                d="M2 8l4 4 8-8"
                                stroke="#FF385C"
                                strokeWidth="2"
                                fill="none"
                                strokeLinecap="round"
                              />
                            </svg>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="search-dropdown__empty">
                        No destinations match "{locationQuery}"
                      </p>
                    )}
                  </div>
                  {location && (
                    <button
                      type="button"
                      className="search-dropdown__clear"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation("");
                        setLocationQuery("");
                      }}
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              )}
            </div>

            <span className="navbar__search-divider" />

            {/* CHECK IN — custom calendar */}
            <div className="navbar__search-field" ref={checkInRef}>
              <button
                type="button"
                className={`navbar__search-option ${checkInOpen ? "navbar__search-option--active" : ""}`}
                onClick={() => {
                  setCheckInOpen((v) => !v);
                  setLocationOpen(false);
                  setCheckOutOpen(false);
                  setGuestsOpen(false);
                  setMenuOpen(false);
                }}
              >
                <span className="navbar__search-label">Check in</span>
                <span
                  className={`navbar__search-value ${!checkIn ? "navbar__search-value--placeholder" : ""}`}
                >
                  {fmtDate(checkIn) || "Add date"}
                </span>
              </button>
              {checkInOpen && (
                <div className="search-dropdown search-dropdown--calendar">
                  <MiniCalendar
                    value={checkIn}
                    minDate={today}
                    onChange={(d) => {
                      setCheckIn(d);
                      if (checkOut && d > checkOut) setCheckOut("");
                    }}
                    onClose={() => {
                      setCheckInOpen(false);
                      setCheckOutOpen(true);
                    }}
                  />
                </div>
              )}
            </div>

            <span className="navbar__search-divider" />

            {/* CHECK OUT — custom calendar */}
            <div className="navbar__search-field" ref={checkOutRef}>
              <button
                type="button"
                className={`navbar__search-option ${checkOutOpen ? "navbar__search-option--active" : ""}`}
                onClick={() => {
                  setCheckOutOpen((v) => !v);
                  setLocationOpen(false);
                  setCheckInOpen(false);
                  setGuestsOpen(false);
                  setMenuOpen(false);
                }}
              >
                <span className="navbar__search-label">Check out</span>
                <span
                  className={`navbar__search-value ${!checkOut ? "navbar__search-value--placeholder" : ""}`}
                >
                  {fmtDate(checkOut) || "Add date"}
                </span>
              </button>
              {checkOutOpen && (
                <div className="search-dropdown search-dropdown--calendar">
                  <MiniCalendar
                    value={checkOut}
                    minDate={checkIn || today}
                    onChange={(d) => setCheckOut(d)}
                    onClose={() => setCheckOutOpen(false)}
                  />
                </div>
              )}
            </div>

            <span className="navbar__search-divider" />

            {/* GUESTS — adults + children */}
            <div className="navbar__search-field" ref={guestsRef}>
              <button
                type="button"
                className={`navbar__search-option navbar__search-option--guests ${guestsOpen ? "navbar__search-option--active" : ""}`}
                onClick={() => {
                  setGuestsOpen((v) => !v);
                  setLocationOpen(false);
                  setCheckInOpen(false);
                  setCheckOutOpen(false);
                  setMenuOpen(false);
                }}
              >
                <span className="navbar__search-label">Guests</span>
                <span
                  className={`navbar__search-value ${totalGuests === 0 ? "navbar__search-value--placeholder" : ""}`}
                >
                  {guestsLabel}
                </span>
              </button>

              {guestsOpen && (
                <div className="search-dropdown search-dropdown--guests">
                  <CounterRow
                    label="Adults"
                    sub="Age 13 or above"
                    value={adults}
                    onDec={() => setAdults((v) => Math.max(0, v - 1))}
                    onInc={() => setAdults((v) => Math.min(16, v + 1))}
                  />
                  <div className="guests-divider" />
                  <CounterRow
                    label="Children"
                    sub="Ages 2–12"
                    value={children}
                    onDec={() => setChildren((v) => Math.max(0, v - 1))}
                    onInc={() => setChildren((v) => Math.min(10, v + 1))}
                  />
                  {totalGuests > 0 && (
                    <button
                      type="button"
                      className="search-dropdown__clear"
                      onClick={() => {
                        setAdults(0);
                        setChildren(0);
                      }}
                    >
                      Clear guests
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* SEARCH BTN */}
            <button
              type="button"
              className="navbar__search-btn"
              onClick={handleSearch}
              aria-label="Search stays"
            >
              <svg viewBox="0 0 32 32" width="14" height="14" fill="white">
                <path d="M13 2a11 11 0 1 0 7.05 19.464l6.243 6.243 1.414-1.414-6.243-6.243A11 11 0 0 0 13 2zm0 2a9 9 0 1 1 0 18A9 9 0 0 1 13 4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right side */}
        <div className="navbar__right">
          {isHost && (
            <Link to="/host" className="navbar__host-link">
              Host dashboard
            </Link>
          )}
          {!isHost && (
            <Link to="/signup?role=host" className="navbar__host-link">
              Become a host
            </Link>
          )}
          <button className="navbar__globe" aria-label="Language">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM5.5 8A2.5 2.5 0 1 0 8 5.5 2.5 2.5 0 0 0 5.5 8z" />
            </svg>
          </button>

          <div
            className="navbar__user"
            onClick={() => {
              setMenuOpen((v) => !v);
              closeAll();
            }}
          >
            <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor">
              <path
                d="M3 8h26M3 16h26M3 24h26"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {user && <span className="navbar__user-name">{user.username}</span>}
            <div className="navbar__avatar">
              {user ? (
                <span className="navbar__avatar-initial">
                  {user.username?.[0]?.toUpperCase() || "U"}
                </span>
              ) : (
                <svg viewBox="0 0 32 32" width="22" height="22" fill="#717171">
                  <path d="M16 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0 2c-5.33 0-16 2.67-16 8v2h32v-2c0-5.33-10.67-8-16-8z" />
                </svg>
              )}
            </div>

            {menuOpen && (
              <div className="navbar__dropdown">
                {token ? (
                  <>
                    <div className="navbar__dropdown-role">
                      {isHost ? "🔑 Host account" : "🏠 Guest account"}
                    </div>
                    <hr className="navbar__dropdown-hr" />
                    {isHost && (
                      <Link
                        to="/host"
                        className="navbar__dropdown-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        Host dashboard
                      </Link>
                    )}
                    {!isHost && (
                      <Link
                        to="/listings"
                        className="navbar__dropdown-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        Browse stays
                      </Link>
                    )}
                    {!isHost && (
                      <Link
                        to="/my-reservations"
                        className="navbar__dropdown-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        My reservations
                      </Link>
                    )}
                    <button
                      className="navbar__dropdown-item navbar__dropdown-item--logout"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="navbar__dropdown-item navbar__dropdown-item--bold"
                      onClick={() => setMenuOpen(false)}
                    >
                      Log in
                    </Link>
                    <Link
                      to="/signup"
                      className="navbar__dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
