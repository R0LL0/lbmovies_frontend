import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroCarousel.css";

const BACKDROP_BASE = "https://image.tmdb.org/t/p/original";
const POSTER_BASE = "https://image.tmdb.org/t/p/w500";

const HeroCarousel = ({ items = [], autoPlayMs = 7000 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  const slides = (items || []).filter((it) => it && it.backdrop_path).slice(0, 6);

  const goTo = useCallback(
    (idx) => {
      if (slides.length === 0) return;
      const next = (idx + slides.length) % slides.length;
      setActiveIndex(next);
    },
    [slides.length]
  );

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, autoPlayMs);
    return () => clearInterval(id);
  }, [isPaused, slides.length, autoPlayMs]);

  if (slides.length === 0) {
    return (
      <div className="hero-carousel hero-carousel--empty" aria-hidden="true" />
    );
  }

  const current = slides[activeIndex];
  const mediaType = current.media_type || (current.title ? "movie" : "tv");
  const title = current.title || current.name || "Untitled";
  const overview = current.overview || "";
  const releaseDate = current.release_date || current.first_air_date || "";
  const year = releaseDate ? releaseDate.split("-")[0] : "";
  const rating = current.vote_average ? current.vote_average.toFixed(1) : null;

  const goToDetail = () => {
    const path = mediaType === "tv" ? `/series/${current.id}` : `/movie/${current.id}`;
    navigate(path);
  };

  return (
    <section
      className="hero-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Featured trending content"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`hero-slide ${i === activeIndex ? "is-active" : ""}`}
          style={{
            backgroundImage: `url(${BACKDROP_BASE}${slide.backdrop_path})`,
          }}
          aria-hidden={i !== activeIndex}
        />
      ))}

      <div className="hero-overlay" />

      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          {mediaType === "tv" ? "Trending Series" : "Trending Movie"}
        </div>

        <h1 className="hero-title">{title}</h1>

        <div className="hero-meta">
          {rating && (
            <span className="hero-meta-rating">
              <span className="hero-star">★</span>
              {rating}
            </span>
          )}
          {year && <span className="hero-meta-item">{year}</span>}
          <span className="hero-meta-item hero-meta-tag">
            {mediaType === "tv" ? "Series" : "Movie"}
          </span>
        </div>

        {overview && <p className="hero-overview">{overview}</p>}

        <div className="hero-actions">
          <button
            type="button"
            className="hero-btn hero-btn--primary"
            onClick={goToDetail}
          >
            <span aria-hidden="true">▶</span> Watch Details
          </button>
          <button
            type="button"
            className="hero-btn hero-btn--ghost"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight * 0.85, behavior: "smooth" })
            }
          >
            Browse Catalog
          </button>
        </div>
      </div>

      <div className="hero-poster" aria-hidden="true">
        {current.poster_path && (
          <img
            src={`${POSTER_BASE}${current.poster_path}`}
            alt=""
            loading="eager"
          />
        )}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="hero-nav hero-nav--prev"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Previous featured item"
          >
            ‹
          </button>
          <button
            type="button"
            className="hero-nav hero-nav--next"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Next featured item"
          >
            ›
          </button>

          <div className="hero-dots" role="tablist">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`hero-dot ${i === activeIndex ? "is-active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={i === activeIndex}
                role="tab"
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroCarousel;
