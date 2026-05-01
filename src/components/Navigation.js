import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, onAuthStateChange } from "../services/authService";
import "./Navigation.css";

const NAV_ITEMS = [
  { id: "all", label: "All", icon: "🎬" },
  { id: "movies", label: "Movies", icon: "🎥" },
  { id: "series", label: "Series", icon: "📺" },
  { id: "activity", label: "Activity", icon: "📰", isRoute: true },
];

const SCROLL_TARGET_ID = "browse-section";

const scrollToBrowse = () => {
  const el = document.getElementById(SCROLL_TARGET_ID);
  if (!el) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const navHeight = document.querySelector(".navigation")?.offsetHeight || 0;
  const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
  window.scrollTo({ top, behavior: "smooth" });
};

const Navigation = ({
  searchTerm,
  onSearchChange,
  onSectionChange,
  activeSection,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { user: u } = await getCurrentUser();
      if (mounted) setUser(u);
    })();
    const {
      data: { subscription },
    } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSectionClick = (section) => {
    setIsMobileMenuOpen(false);

    const item = NAV_ITEMS.find((i) => i.id === section);
    if (item?.isRoute) {
      navigate(`/${section}`);
      return;
    }

    const onHome = window.location.pathname === "/";

    if (!onHome) {
      navigate("/");
      // give the home page a tick to mount
      setTimeout(() => {
        if (onSectionChange) onSectionChange(section);
        setTimeout(scrollToBrowse, 60);
      }, 80);
      return;
    }

    if (onSectionChange) onSectionChange(section);
    setTimeout(scrollToBrowse, 30);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (window.location.pathname !== "/") {
      navigate("/");
    }
    setTimeout(scrollToBrowse, 100);
  };

  return (
    <nav className={`navigation ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <div className="nav-left">
          <div
            className="logo-container"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/")}
            aria-label="Go to homepage"
          >
            <span className="logo-icon">🔥</span>
            <span className="logo-text">LBMOVIES</span>
          </div>
        </div>

        <div className="nav-center">
          <form className="search-container" onSubmit={handleSearchSubmit} role="search">
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              className="search-input"
              type="search"
              placeholder="Search movies and series..."
              value={searchTerm || ""}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              aria-label="Search movies and series"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange && onSearchChange("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </form>
        </div>

        <div className="nav-right">
          <ul className="nav-menu">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeSection === item.id ? "active" : ""}`}
                  onClick={() => handleSectionClick(item.id)}
                  aria-label={`View ${item.label}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
            {user ? (
              <li>
                <button
                  className="nav-item"
                  onClick={() => navigate("/profile")}
                  aria-label="View Profile"
                >
                  <span className="nav-icon">👤</span>
                  <span className="nav-label">Profile</span>
                </button>
              </li>
            ) : (
              <li>
                <button
                  className="nav-item nav-item--cta"
                  onClick={() => navigate("/login")}
                  aria-label="Sign In"
                >
                  <span className="nav-icon">🔐</span>
                  <span className="nav-label">Sign In</span>
                </button>
              </li>
            )}
          </ul>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <ul className="mobile-nav-menu">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                className={`mobile-nav-item ${activeSection === item.id ? "active" : ""}`}
                onClick={() => handleSectionClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
          {user ? (
            <li>
              <button
                className="mobile-nav-item"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/profile");
                }}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-label">Profile</span>
              </button>
            </li>
          ) : (
            <li>
              <button
                className="mobile-nav-item"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/login");
                }}
              >
                <span className="nav-icon">🔐</span>
                <span className="nav-label">Sign In</span>
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
