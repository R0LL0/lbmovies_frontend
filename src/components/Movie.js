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

const Movie = ({ id, title, poster_path, overview, release_date, vote_average }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [fav, setFav] = useState(false);
  const [watch, setWatch] = useState(false);
  const navigate = useNavigate();

  const imageUrl = poster_path ? `${IMGPATH}${poster_path}` : IMGPATH_FALLBACK;
  const displayImageUrl = imageError ? IMGPATH_FALLBACK : imageUrl;

  useEffect(() => {
    if (id) {
      setFav(isFavorite(id, "movie"));
      setWatch(isInWatchlist(id, "movie"));
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (imageLoading) setImageLoading(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [imageLoading]);

  const handleClick = () => {
    if (id) navigate(`/movie/${id}`);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    if (!id) return;
    if (fav) {
      removeFromFavorites(id, "movie");
      setFav(false);
    } else {
      addToFavorites({ id, title, poster_path, type: "movie" });
      setFav(true);
    }
  };

  const handleWatch = (e) => {
    e.stopPropagation();
    if (!id) return;
    if (watch) {
      removeFromWatchlist(id, "movie");
      setWatch(false);
    } else {
      addToWatchlist({ id, title, poster_path, type: "movie" });
      setWatch(true);
    }
  };

  return (
    <article
      className="movie"
      role="article"
      aria-label={`Movie: ${title}`}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div className="movie-image-wrapper">
        {imageLoading && (
          <div className="image-skeleton" aria-hidden="true">
            <div className="skeleton-shimmer"></div>
          </div>
        )}
        <img
          src={displayImageUrl}
          alt={title || "Movie poster"}
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

        <div className="movie-rating-badge">
          <span
            className={`tag ${setVoteClass(vote_average)}`}
            aria-label={`Rating: ${vote_average} out of 10`}
          >
            {vote_average ? vote_average.toFixed(1) : "N/A"}
          </span>
        </div>

        <span className="card-type-badge" aria-hidden="true">Movie</span>
      </div>

      <div className="movie-info">
        <h3 className="movie-title" title={title}>
          {title || "Untitled"}
        </h3>
        {release_date && (
          <time className="movie-date" dateTime={release_date}>
            {processReleaseDate(release_date)}
          </time>
        )}
      </div>

      {overview && (
        <div className="movie-over" role="region" aria-label="Movie overview">
          <h2 className="movie-over-title">Overview</h2>
          <p className="movie-over-text">{overview}</p>
        </div>
      )}
    </article>
  );
};

export default Movie;
