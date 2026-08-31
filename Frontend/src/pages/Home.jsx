import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const destinations = [
  { city: "Kansas City", time: "45 minutes away", img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80" },
  { city: "Long City", time: "1 hour away", img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80" },
  { city: "West Weld", time: "2 hours away", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80" },
  { city: "Hutchinson", time: "2 hours away", img: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=80" },
];

const hostArticles = [
  {
    title: "It's easy to get started on Airbnb",
    subtitle: "Try hosting",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",
    dark: true,
  },
  {
    title: "AirCover for Hosts",
    subtitle: "Learn more",
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
    dark: false,
  },
];

const footerLinks = {
  Support: ["Help Centre", "AirCover", "Anti-discrimination", "Disability support", "Cancellation options", "Report neighbourhood concern"],
  Hosting: ["Airbnb your home", "AirCover for Hosts", "Explore hosting resources", "Visit our community forum", "How to host responsibly", "Airbnb-friendly apartments"],
  Airbnb: ["Newsroom", "Learn about new features", "Letter from our founders", "Careers", "Investors", "Gift cards"],
};

function Home() {
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
          <h1 className="hero__title">Not sure where to go?<br />Perfect.</h1>
          <Link to="/listings" className="hero__btn">
            I'm flexible
          </Link>
        </div>
      </section>

      <div className="home__content">

        {/* Nearby destinations */}
        <section className="home__section">
          <h2 className="home__section-title">Inspiration for your next trip</h2>
          <div className="destinations-grid">
            {destinations.map((d) => (
              <Link to="/listings" key={d.city} className="destination-card">
                <img src={d.img} alt={d.city} className="destination-card__img" />
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
              <div key={a.title} className={`host-article ${a.dark ? "host-article--dark" : ""}`}>
                <img src={a.img} alt={a.title} className="host-article__img" />
                <div className="host-article__body">
                  <p className="host-article__title">{a.title}</p>
                  <Link to="/listings" className="host-article__btn">
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
              <h2 className="gift-banner__title">Shop Airbnb<br />gift cards</h2>
              <Link to="/listings" className="gift-banner__btn">Shop now</Link>
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

        {/* Questions about hosting */}
        <section className="home__section">
          <div className="hosting-banner">
            <div className="hosting-banner__text">
              <h2>Questions about hosting?</h2>
              <Link to="/signup" className="hosting-banner__btn">Learn more</Link>
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
                    <li key={link}><a href="#" className="footer__link">{link}</a></li>
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
