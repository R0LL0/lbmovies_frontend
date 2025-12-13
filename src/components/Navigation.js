import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, onAuthStateChange } from '../services/authService';
import './Navigation.css';

const Navigation = ({ searchTerm, onSearchChange, onSectionChange, activeSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionClick = (section) => {
    // If we're not on the home page, navigate there first
    if (window.location.pathname !== '/') {
      navigate('/');
      // Wait for navigation, then set section
      setTimeout(() => {
        if (onSectionChange) {
          onSectionChange(section);
        }
        // Scroll to section after navigation
        setTimeout(() => {
          const element = document.getElementById(`${section === 'all' ? 'movies' : section}-section`);
          if (element) {
            const navHeight = document.querySelector('.navigation')?.offsetHeight || 0;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navHeight - 20;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          } else if (section === 'all') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 300);
      }, 100);
    } else {
      // We're on home page, just change section
      if (onSectionChange) {
        onSectionChange(section);
      }
      setIsMobileMenuOpen(false);
      // Smooth scroll to section with offset for sticky nav
      setTimeout(() => {
        const element = document.getElementById(`${section === 'all' ? 'movies' : section}-section`);
        if (element) {
          const navHeight = document.querySelector('.navigation')?.offsetHeight || 0;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navHeight - 20;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        } else if (section === 'all') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const checkUser = async () => {
    const { user } = await getCurrentUser();
    setUser(user);
  };

  const navItems = [
    { id: 'all', label: 'All', icon: '🎬' },
    { id: 'movies', label: 'Movies', icon: '🎥' },
    { id: 'series', label: 'Series', icon: '📺' },
  ];

  return (
    <nav className={`navigation ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="nav-left">
          <div 
            className="logo-container" 
            onClick={() => navigate('/')} 
            role="button" 
            tabIndex={0} 
            onKeyDown={(e) => e.key === 'Enter' && navigate('/')} 
            aria-label="Go to homepage"
          >
            <span className="logo-icon">🔥</span>
            <span className="logo-text">LBMOVIES</span>
          </div>
        </div>

        <div className="nav-center">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input 
              className="search-input" 
              type="search" 
              placeholder="Search movies and series..." 
              value={searchTerm} 
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search movies and series"
            />
            {searchTerm && (
              <button 
                className="search-clear-btn" 
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="nav-right">
          <ul className="nav-menu">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
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
                  onClick={() => navigate('/profile')}
                  aria-label="View Profile"
                >
                  <span className="nav-icon">👤</span>
                  <span className="nav-label">Profile</span>
                </button>
              </li>
            ) : (
              <li>
                <button
                  className="nav-item"
                  onClick={() => navigate('/login')}
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
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-menu">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                className={`mobile-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => handleSectionClick(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;

