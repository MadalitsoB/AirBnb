import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const LOCATION_OPTIONS = [
  "Anywhere",
  "Cape Town",
  "Durban",
  "Johannesburg",
  "Knysna",
  "Stellenbosch",
  "Hermanus",
  "Franschhoek",
  "Drakensberg",
];

const WEEK_OPTIONS = ["Any week", "Weekend", "1 week", "2 weeks", "Month"];
const GUEST_OPTIONS = [
  "Add guests",
  "2 guests",
  "4 guests",
  "6 guests",
  "8+ guests",
];

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location, setLocation] = useState("Anywhere");
  const [week, setWeek] = useState("Any week");
  const [guests, setGuests] = useState("Add guests");
  const token = localStorage.getItem("airbnbToken");

  const handleLogout = () => {
    localStorage.removeItem("airbnbToken");
    navigate("/");
    setMenuOpen(false);
  };

  const cycleValue = (list, current, setter) => {
    const currentIndex = list.indexOf(current);
    const nextIndex = (currentIndex + 1) % list.length;
    setter(list[nextIndex]);
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (location !== "Anywhere") {
      params.set("location", location);
    }

    if (guests !== "Add guests") {
      const guestValue = Number.parseInt(guests, 10);
      if (!Number.isNaN(guestValue) && guestValue > 0) {
        params.set("guests", String(guestValue));
      }
    }

    if (week !== "Any week") {
      params.set("week", week);
    }

    navigate(`/listings${params.toString() ? `?${params.toString()}` : ""}`);
  };

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

        {/* Center search */}
        <div className="navbar__search">
          <div className="navbar__search-pill">
            <button
              type="button"
              className="navbar__search-option"
              onClick={() =>
                cycleValue(LOCATION_OPTIONS, location, setLocation)
              }
            >
              <span>{location}</span>
            </button>
            <span className="navbar__search-divider" />
            <button
              type="button"
              className="navbar__search-option"
              onClick={() => cycleValue(WEEK_OPTIONS, week, setWeek)}
            >
              <span>{week}</span>
            </button>
            <span className="navbar__search-divider" />
            <button
              type="button"
              className="navbar__search-option navbar__search-guests"
              onClick={() => cycleValue(GUEST_OPTIONS, guests, setGuests)}
            >
              <span>{guests}</span>
            </button>
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
          <Link to="/listings" className="navbar__host-link">
            Airbnb your home
          </Link>

          <button className="navbar__globe" aria-label="Language">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zM5.5 8A2.5 2.5 0 1 0 8 5.5 2.5 2.5 0 0 0 5.5 8z" />
            </svg>
          </button>

          <div className="navbar__user" onClick={() => setMenuOpen(!menuOpen)}>
            <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor">
              <path
                d="M3 8h26M3 16h26M3 24h26"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="navbar__avatar">
              <svg viewBox="0 0 32 32" width="22" height="22" fill="#717171">
                <path d="M16 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12zm0 2c-5.33 0-16 2.67-16 8v2h32v-2c0-5.33-10.67-8-16-8z" />
              </svg>
            </div>

            {menuOpen && (
              <div className="navbar__dropdown">
                {token ? (
                  <>
                    <Link
                      to="/listings"
                      className="navbar__dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      Listings
                    </Link>
                    <button
                      className="navbar__dropdown-item"
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
                    <hr className="navbar__dropdown-hr" />
                    <Link
                      to="/listings"
                      className="navbar__dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      Airbnb your home
                    </Link>
                    <Link
                      to="/listings"
                      className="navbar__dropdown-item"
                      onClick={() => setMenuOpen(false)}
                    >
                      Help
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
