import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  isFavorite,
  addToFavorites,
  removeFromFavorites,
  isInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../utils/favorites";

const IMGPATH = "https://image.tmdb.org/t/p/w500";
const IMGPATH_FALLBACK =
  "https://images.unsplash.com/photo-1560109947-543149eceb16?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fG1vdmllfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60";

const setVoteClass = (vote_average) => {
  if (vote_average >= 8) return "green";
  if (vote_average >= 6) return "orange";
  return "red";
};

function processReleaseDate(date) {
  if (!date) return "";
  try {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  } catch {
    return date;
  }
}

const Serie = ({ id, name, poster_path, overview, first_air_date, vote_average }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [watch, setWatch] = useState(false);
  const navigate = useNavigate();

  const imageUrl = poster_path ? `${IMGPATH}${poster_path}` : IMGPATH_FALLBACK;
  const displayImageUrl = imageError ? IMGPATH_FALLBACK : imageUrl;

  useEffect(() => {
    if (id) {
      setFav(isFavorite(id, "series"));
      setWatch(isInWatchlist(id, "series"));
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (imageLoading) setImageLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [imageLoading]);

  const handleClick = () => {
    if (id) navigate(`/series/${id}`);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    if (!id) return;
    if (fav) {
      removeFromFavorites(id, "series");
      setFav(false);
    } else {
      addToFavorites({ id, name, poster_path, type: "series" });
      setFav(true);
    }
  };

  const handleWatch = (e) => {
    e.stopPropagation();
    if (!id) return;
    if (watch) {
      removeFromWatchlist(id, "series");
      setWatch(false);
    } else {
      addToWatchlist({ id, name, poster_path, type: "series" });
      setWatch(true);
    }
  };

  return (
    <article
      className="serie"
      role="article"
      aria-label={`Series: ${name}`}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="serie-image-wrapper">
        {imageLoading && (
          <div className="image-skeleton" aria-hidden="true">
            <div className="skeleton-shimmer"></div>
          </div>
        )}
        <img
          src={displayImageUrl}
          alt={name || "Series poster"}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          onLoad={() => setImageLoading(false)}
          style={{
            display: imageLoading ? "none" : "block",
            width: "100%",
            height: "auto",
            objectFit: "cover",
          }}
          loading="lazy"
        />

        <div className="card-quick-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`quick-btn ${fav ? "is-active" : ""}`}
            onClick={handleFav}
            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
            title={fav ? "Remove from favorites" : "Add to favorites"}
          >
            {fav ? "♥" : "♡"}
          </button>
          <button
            type="button"
            className={`quick-btn ${watch ? "is-active" : ""}`}
            onClick={handleWatch}
            aria-label={watch ? "Remove from watchlist" : "Add to watchlist"}
            title={watch ? "Remove from watchlist" : "Add to watchlist"}
          >
            {watch ? "✓" : "+"}
          </button>
        </div>

        <div className="serie-rating-badge">
          <span
            className={`tag ${setVoteClass(vote_average)}`}
            aria-label={`Rating: ${vote_average} out of 10`}
          >
            {vote_average ? vote_average.toFixed(1) : "N/A"}
          </span>
        </div>

        <span className="card-type-badge card-type-badge--series" aria-hidden="true">Series</span>
      </div>

      <div className="serie-info">
        <h3 className="serie-title" title={name}>
          {name || "Untitled"}
        </h3>
        {first_air_date && (
          <time className="serie-date" dateTime={first_air_date}>
            {processReleaseDate(first_air_date)}
          </time>
        )}
      </div>

      {overview && (
        <div className="serie-over" role="region" aria-label="Series overview">
          <h2 className="serie-over-title">Overview</h2>
          <p className="serie-over-text">{overview}</p>
        </div>
      )}
    </article>
  );
};

export default Serie;
