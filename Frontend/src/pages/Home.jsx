import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const destinations = [
  {
    city: "Cape Town",
    time: "Ocean stays",
    location: "Cape Town",
    img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80",
  },
  {
    city: "Durban",
    time: "Beachfront stays",
    location: "Durban",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80",
  },
  {
    city: "Knysna",
    time: "Lake and forest stays",
    location: "Knysna",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80",
  },
  {
    city: "Stellenbosch",
    time: "Farm stays",
    location: "Stellenbosch",
    img: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=80",
  },
];

const hostArticles = [
  {
    title: "It's easy to get started on Airbnb",
    subtitle: "Try hosting",
    to: "/signup",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",
    dark: true,
  },
  {
    title: "AirCover for Hosts",
    subtitle: "Learn more",
    to: "/listings?location=Johannesburg",
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    dark: false,
  },
];

const footerLinks = {
  Support: [
    "Help Centre",
    "AirCover",
    "Anti-discrimination",
    "Disability support",
    "Cancellation options",
    "Report neighbourhood concern",
  ],
  Hosting: [
    "Airbnb your home",
    "AirCover for Hosts",
    "Explore hosting resources",
    "Visit our community forum",
    "How to host responsibly",
    "Airbnb-friendly apartments",
  ],
  Airbnb: [
    "Newsroom",
    "Learn about new features",
    "Letter from our founders",
    "Careers",
    "Investors",
    "Gift cards",
  ],
};

function Home() {
  const [showGiftCards, setShowGiftCards] = useState(false);
  const [giftAmount, setGiftAmount] = useState(1000);
  const [giftEmail, setGiftEmail] = useState("");
  const [giftMessage, setGiftMessage] = useState("");

  const handleGiftCardPurchase = (event) => {
    event.preventDefault();
    if (!giftEmail.trim()) return;
    setGiftMessage(`Your R${giftAmount.toLocaleString()} gift card is ready for ${giftEmail}.`);
  };

  return (
    <div className="home">
      <Navbar />

      {/* Hero */}
      <section className="hero">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
          alt="Beautiful home"
          className="hero__img"
        />
        <div className="hero__overlay">
          <h1 className="hero__title">
            Not sure where to go?
            <br />
            Perfect.
          </h1>
          <Link to="/listings" className="hero__btn">
            I'm flexible
          </Link>
        </div>
      </section>

      <div className="home__content">
        {/* Nearby destinations */}
        <section className="home__section">
          <h2 className="home__section-title">
            Inspiration for your next trip
          </h2>
          <div className="destinations-grid">
            {destinations.map((d) => (
              <Link
                to={`/listings?location=${encodeURIComponent(d.location)}`}
                key={d.city}
                className="destination-card"
              >
                <img
                  src={d.img}
                  alt={d.city}
                  className="destination-card__img"
                />
                <div className="destination-card__body">
                  <strong className="destination-card__city">{d.city}</strong>
                  <span className="destination-card__time">{d.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Host articles */}
        <section className="home__section">
          <h2 className="home__section-title">Explore things to do near you</h2>
          <div className="host-articles">
            {hostArticles.map((a) => (
              <div
                key={a.title}
                className={`host-article ${a.dark ? "host-article--dark" : ""}`}
              >
                <img src={a.img} alt={a.title} className="host-article__img" />
                <div className="host-article__body">
                  <p className="host-article__title">{a.title}</p>
                  <Link to={a.to} className="host-article__btn">
                    {a.subtitle}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shop gift cards banner */}
        <section className="home__section">
          <div className="gift-banner">
            <div className="gift-banner__left">
              <h2 className="gift-banner__title">
                Shop Airbnb
                <br />
                gift cards
              </h2>
              <button
                type="button"
                onClick={() => {
                  setGiftMessage("");
                  setShowGiftCards(true);
                }}
                className="gift-banner__btn"
              >
                Shop now
              </button>
            </div>
            <div className="gift-banner__right">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80"
                alt="Gift cards"
                className="gift-banner__img"
              />
            </div>
          </div>
        </section>

        {showGiftCards && (
          <div
            className="gift-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gift-modal-title"
            onClick={() => setShowGiftCards(false)}
          >
            <div className="gift-modal__panel" onClick={(event) => event.stopPropagation()}>
              <div className="gift-modal__header">
                <div>
                  <p className="gift-modal__eyebrow">Airbnb gift cards</p>
                  <h2 id="gift-modal-title">Give a stay they’ll remember</h2>
                </div>
                <button
                  type="button"
                  className="gift-modal__close"
                  aria-label="Close gift card shop"
                  onClick={() => setShowGiftCards(false)}
                >
                  ×
                </button>
              </div>
              {giftMessage ? (
                <div className="gift-modal__success" role="status">
                  <strong>{giftMessage}</strong>
                  <button type="button" onClick={() => setShowGiftCards(false)}>Done</button>
                </div>
              ) : (
                <form onSubmit={handleGiftCardPurchase}>
                  <label className="gift-modal__label">Choose an amount</label>
                  <div className="gift-modal__amounts">
                    {[500, 1000, 2500, 5000].map((amount) => (
                      <button
                        type="button"
                        key={amount}
                        className={giftAmount === amount ? "gift-modal__amount gift-modal__amount--active" : "gift-modal__amount"}
                        onClick={() => setGiftAmount(amount)}
                      >
                        R{amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <label className="gift-modal__label" htmlFor="gift-email">Recipient email</label>
                  <input
                    id="gift-email"
                    type="email"
                    required
                    value={giftEmail}
                    onChange={(event) => setGiftEmail(event.target.value)}
                    placeholder="friend@example.com"
                  />
                  <button type="submit" className="gift-modal__submit">Continue to purchase</button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Questions about hosting */}
        <section className="home__section">
          <div className="hosting-banner">
            <div className="hosting-banner__text">
              <h2>Questions about hosting?</h2>
              <Link to="/signup" className="hosting-banner__btn">
                Learn more
              </Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
              alt="Host smiling"
              className="hosting-banner__img"
            />
          </div>
        </section>

        {/* Support links */}
        <section className="home__support">
          <p className="home__support-title">Support</p>
          <div className="home__support-links">
            <a href="#">Help Centre</a>
            <a href="#">AirCover</a>
            <a href="#">Combating discrimination</a>
            <a href="#">Supporting people with disabilities</a>
            <a href="#">Cancellation options</a>
            <a href="#">Report neighbourhood concern</a>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer__top">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section} className="footer__col">
                <h4 className="footer__col-title">{section}</h4>
                <ul className="footer__list">
                  {links.map((link) => (
                    <li key={link}>
                      <a href="#" className="footer__link">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer__bottom">
            <span>© 2024 Airbnb, Inc.</span>
            <div className="footer__bottom-links">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Sitemap</a>
              <a href="#">Company details</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Home;
