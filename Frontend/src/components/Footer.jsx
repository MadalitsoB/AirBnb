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
  Discover: [
    "Gift cards",
    "Airbnb Luxe",
    "Work stays",
    "South Africa stays",
    "Popular destinations",
    "All stays",
  ],
};

function Footer({
  language = "English (ZA)",
  currency = "R ZAR",
  onLanguageChange,
  onCurrencyChange,
}) {
  return (
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
        <div className="footer__controls">
          <label className="footer-select">
            <span className="sr-only">Language</span>
            <select
              value={language}
              onChange={(event) => onLanguageChange?.(event.target.value)}
            >
              <option>English (ZA)</option>
              <option>English (US)</option>
              <option>isiZulu</option>
              <option>Français</option>
            </select>
          </label>
          <label className="footer-select">
            <span className="sr-only">Currency</span>
            <select
              value={currency}
              onChange={(event) => onCurrencyChange?.(event.target.value)}
            >
              <option>R ZAR</option>
              <option>$ USD</option>
              <option>€ EUR</option>
              <option>£ GBP</option>
            </select>
          </label>
          <a href="#" aria-label="Instagram">
            Instagram
          </a>
          <a href="#" aria-label="Facebook">
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
