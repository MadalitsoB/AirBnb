import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch } from "../services/api";

const CATEGORIES = [
  { label: "Amazing views", icon: "🏔️" },
  { label: "Beachfront", icon: "🏖️" },
  { label: "Cabins", icon: "🏕️" },
  { label: "Trending", icon: "🔥" },
  { label: "Pools", icon: "🏊" },
  { label: "Tiny homes", icon: "🏠" },
  { label: "Mansions", icon: "🏰" },
  { label: "Lakefront", icon: "🏞️" },
  { label: "Skiing", icon: "⛷️" },
  { label: "Farms", icon: "🌾" },
];

const FALLBACK = [
  {
    _id: "1",
    title: "Cozy Mountain Cabin",
    location: "Cape Town, South Africa",
    type: "Entire cabin",
    price: 1250,
    rating: 4.92,
    reviewCount: 128,
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    _id: "2",
    title: "Modern City Apartment",
    location: "Johannesburg, South Africa",
    type: "Entire apartment",
    price: 980,
    rating: 4.85,
    reviewCount: 94,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    _id: "3",
    title: "Beachfront Villa",
    location: "Durban, South Africa",
    type: "Entire villa",
    price: 2500,
    rating: 4.97,
    reviewCount: 211,
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    _id: "4",
    title: "Rustic Farm Stay",
    location: "Stellenbosch, South Africa",
    type: "Private room",
    price: 750,
    rating: 4.78,
    reviewCount: 67,
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    _id: "5",
    title: "Luxury Penthouse",
    location: "Cape Town, South Africa",
    type: "Entire apartment",
    price: 3800,
    rating: 4.99,
    reviewCount: 45,
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    _id: "6",
    title: "Lakeside Retreat",
    location: "Knysna, South Africa",
    type: "Entire cabin",
    price: 1600,
    rating: 4.91,
    reviewCount: 183,
    images: [
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=80",
    ],
  },
];

const categoryMatchers = {
  "Amazing views": [/view|mountain|cliff|lake|hill|panorama|sunrise|scenic/i],
  Beachfront: [/beach|coastal|ocean|sea|shore|durban/i],
  Cabins: [/cabin|retreat|woodland|forest|log/i],
  Trending: [/luxury|penthouse|villa|popular|modern|top/i],
  Pools: [/pool|resort|villa|spa|waterfront/i],
  "Tiny homes": [/tiny|compact|studio|micro|small/i],
  Mansions: [/mansion|luxury|villa|penthouse|estate/i],
  Lakefront: [/lake|lakeside|waterfront|knysna|river/i],
  Skiing: [/ski|snow|alpine|mountain|winter/i],
  Farms: [/farm|rustic|countryside|rural|barn|orchard/i],
};

const matchesCategory = (item, categoryLabel) => {
  const patterns = categoryMatchers[categoryLabel] || [];
  const haystack = [
    item.title,
    item.location,
    item.type,
    item.description || "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return patterns.some((pattern) => pattern.test(haystack));
};

const buildMapMarkers = (items) => {
  return (items || []).map((item, index) => {
    const citySeed = (item.location || "Cape Town, South Africa").split(",")[0];
    const base = citySeed.length % 10;
    const left = 12 + (((index + base) * 13) % 70);
    const top = 18 + ((index * 17 + base * 7) % 58);

    return {
      ...item,
      mapLeft: `${left}%`,
      mapTop: `${top}%`,
    };
  });
};

function ListingsPage() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    maxPrice: "",
    minGuests: "",
  });

  useEffect(() => {
    apiFetch("/accommodations")
      .then((data) => {
        // API response is { success: true, data: [...] }
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
        // Always prefer real API data; only fall back if API returned nothing
        setListings(items.length > 0 ? items : FALLBACK);
      })
      .catch(() => {
        // API unreachable — use fallback so page isn't blank
        setListings(FALLBACK);
      })
      .finally(() => setLoading(false));
  }, []);

  const locationFilter = (searchParams.get("location") || "").trim();
  const guestFilter = Number.parseInt(searchParams.get("guests") || "0", 10);

  const selectedCategory = CATEGORIES[activeCategory]?.label || "Amazing views";
  const baseListings = listings.length ? listings : FALLBACK;
  const categoryFiltered =
    activeCategory === 0
      ? baseListings
      : baseListings.filter((item) => matchesCategory(item, selectedCategory));

  const filteredListings = categoryFiltered.filter((item) => {
    if (locationFilter) {
      const hasLocation = item.location
        ?.toLowerCase()
        .includes(locationFilter.toLowerCase());
      if (!hasLocation) return false;
    }

    if (guestFilter > 0) {
      const guestsCount = Number(item.guests || 0);
      if (!Number.isNaN(guestsCount) && guestsCount < guestFilter) {
        return false;
      }
    }

    if (filters.type && item.type !== filters.type) return false;
    if (filters.maxPrice && Number(item.price || 0) > Number(filters.maxPrice))
      return false;
    if (
      filters.minGuests &&
      Number(item.guests || 0) < Number(filters.minGuests)
    )
      return false;

    return true;
  });

  const displayedListings = filteredListings;
  const mapMarkers = buildMapMarkers(
    displayedListings.length ? displayedListings : FALLBACK,
  );
  const activeMapLocation =
    displayedListings[0]?.location ||
    listings[0]?.location ||
    "Cape Town, South Africa";

  return (
    <div className="listings-page">
      <Navbar />

      {/* Category chips */}
      <div className="category-bar">
        <div className="category-bar__chips">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              className={`category-chip ${i === activeCategory ? "category-chip--active" : ""}`}
              onClick={() => setActiveCategory(i)}
            >
              <span className="category-chip__icon">{cat.icon}</span>
              <span className="category-chip__label">{cat.label}</span>
            </button>
          ))}
        </div>
        <div className="category-bar__filters">
          <button
            className={`filter-btn ${showFilters ? "filter-btn--active" : ""}`}
            onClick={() => setShowFilters((value) => !value)}
          >
            <svg
              viewBox="0 0 16 16"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M1 3h14M4 8h8M7 13h2" strokeLinecap="round" />
            </svg>
            Filters
          </button>
          <button
            className={`total-btn ${showTotal ? "total-btn--active" : ""}`}
            onClick={() => setShowTotal(!showTotal)}
          >
            Display total before taxes
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="listing-filters-panel" aria-label="Listing filters">
          <label>
            Property type
            <select
              value={filters.type}
              onChange={(event) =>
                setFilters({ ...filters, type: event.target.value })
              }
            >
              <option value="">Any type</option>
              <option>Entire apartment</option>
              <option>Private room</option>
              <option>Shared room</option>
              <option>Hotel room</option>
            </select>
          </label>
          <label>
            Maximum price per night
            <input
              type="number"
              min="0"
              placeholder="Any price"
              value={filters.maxPrice}
              onChange={(event) =>
                setFilters({ ...filters, maxPrice: event.target.value })
              }
            />
          </label>
          <label>
            Minimum guests
            <input
              type="number"
              min="1"
              placeholder="Any capacity"
              value={filters.minGuests}
              onChange={(event) =>
                setFilters({ ...filters, minGuests: event.target.value })
              }
            />
          </label>
          <button
            type="button"
            className="listing-filters-panel__clear"
            onClick={() =>
              setFilters({ type: "", maxPrice: "", minGuests: "" })
            }
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Grid */}
      <main className="listings-grid-wrap">
        {showMap && !loading && (
          <div className="listings-map-panel">
            <div
              className="map-panel__canvas"
              aria-label="Google map of nearby stay locations"
            >
              <div className="map-panel__label">Explore stays</div>
              <iframe
                title="Google map of listings"
                className="map-panel__iframe"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  activeMapLocation,
                )}&z=10&output=embed`}
              />
              {mapMarkers.map((item) => (
                <div
                  key={item._id}
                  className="map-marker"
                  style={{ left: item.mapLeft, top: item.mapTop }}
                  title={`${item.title} — R${item.price?.toLocaleString()}`}
                >
                  <span>R{item.price?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="listings-loading">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="listing-skeleton">
                <div className="listing-skeleton__img" />
                <div className="listing-skeleton__line listing-skeleton__line--long" />
                <div className="listing-skeleton__line listing-skeleton__line--short" />
              </div>
            ))}
          </div>
        ) : (
          <div className="listings-grid">
            {displayedListings.length === 0 ? (
              <div className="listings-empty">
                No stays match this category yet. Try another option.
              </div>
            ) : (
              displayedListings.map((item) => (
                <Link
                  to={`/listings/${item._id}`}
                  key={item._id}
                  className="listing-card-link"
                >
                  <article className="listing-card">
                    <div className="listing-card__img-wrap">
                      <img
                        src={
                          item.images?.[0] ||
                          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={item.title}
                        className="listing-card__img"
                      />
                      <button
                        className="listing-card__heart"
                        aria-label="Save to wishlist"
                      >
                        <svg
                          viewBox="0 0 32 32"
                          width="18"
                          height="18"
                          fill="none"
                          stroke="white"
                          strokeWidth="2"
                        >
                          <path d="M16 28S4 20 4 11a7 7 0 0 1 12-4.9A7 7 0 0 1 28 11c0 9-12 17-12 17z" />
                        </svg>
                      </button>
                      <div className="listing-card__dots">
                        <span className="listing-card__dot listing-card__dot--active" />
                        <span className="listing-card__dot" />
                        <span className="listing-card__dot" />
                      </div>
                    </div>
                    <div className="listing-card__body">
                      <div className="listing-card__row">
                        <span className="listing-card__title">
                          {item.title}
                        </span>
                        <span className="listing-card__rating">
                          <svg
                            viewBox="0 0 16 16"
                            width="12"
                            height="12"
                            fill="currentColor"
                          >
                            <path d="M8 1l1.85 3.75L14 5.5l-3 2.92.71 4.13L8 10.4l-3.71 1.95.71-4.13L2 5.5l4.15-.75L8 1z" />
                          </svg>
                          {item.rating || "4.9"}
                        </span>
                      </div>
                      <p className="listing-card__location">{item.location}</p>
                      <p className="listing-card__type">{item.type}</p>
                      <p className="listing-card__price">
                        <strong>R{item.price?.toLocaleString()}</strong> night
                      </p>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        )}

        <div className="listings-map-btn-wrap">
          <button
            className="listings-map-btn"
            onClick={() => setShowMap((value) => !value)}
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M8 0a5 5 0 0 0-5 5c0 4.5 5 11 5 11s5-6.5 5-11a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg>
            {showMap ? "Hide map" : "Show map"}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ListingsPage;
