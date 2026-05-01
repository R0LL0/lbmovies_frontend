import React, { useRef, useState, useEffect } from "react";
import Movie from "./Movie";
import Serie from "./Serie";
import "./MediaRow.css";

/**
 * Horizontal scrolling row of movie/series cards.
 *
 * Props:
 * - title: section title
 * - icon: emoji/icon prefix
 * - items: array of TMDB items (mixed media types supported)
 * - mediaType: "movie" | "tv" | "mixed" — disambiguates when items have no media_type field
 * - loading: show skeletons
 */
const MediaRow = ({ title, icon, items = [], mediaType = "mixed", loading = false }) => {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollState();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [items]);

  const scrollByAmount = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85 * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const resolveType = (item) => {
    if (mediaType !== "mixed") return mediaType === "tv" ? "series" : "movie";
    if (item.media_type === "tv") return "series";
    if (item.media_type === "movie") return "movie";
    return item.title ? "movie" : "series";
  };

  return (
    <section className="media-row" aria-label={title}>
      <header className="media-row-header">
        <h2 className="media-row-title">
          {icon && <span className="media-row-icon" aria-hidden="true">{icon}</span>}
          {title}
        </h2>
        <div className="media-row-controls">
          <button
            type="button"
            className="media-row-nav"
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${title} left`}
          >
            ‹
          </button>
          <button
            type="button"
            className="media-row-nav"
            onClick={() => scrollByAmount(1)}
            disabled={!canScrollRight}
            aria-label={`Scroll ${title} right`}
          >
            ›
          </button>
        </div>
      </header>

      <div className="media-row-track-wrap">
        <div className="media-row-track" ref={trackRef}>
          {loading
            ? [...Array(8)].map((_, i) => (
                <div key={i} className="media-row-skeleton">
                  <div className="media-row-skeleton-img" />
                  <div className="media-row-skeleton-line" />
                  <div className="media-row-skeleton-line short" />
                </div>
              ))
            : items.map((item) => {
                const t = resolveType(item);
                return t === "movie" ? (
                  <div key={`m-${item.id}`} className="media-row-card">
                    <Movie {...item} />
                  </div>
                ) : (
                  <div key={`s-${item.id}`} className="media-row-card">
                    <Serie {...item} />
                  </div>
                );
              })}
        </div>

        {canScrollLeft && <div className="media-row-fade media-row-fade--left" />}
        {canScrollRight && <div className="media-row-fade media-row-fade--right" />}
      </div>
    </section>
  );
};

export default MediaRow;
