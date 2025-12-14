import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const IMGPATH = "https://image.tmdb.org/t/p/w500"; // Using w500 for better performance
const IMGPATH_FALLBACK = "https://images.unsplash.com/photo-1560109947-543149eceb16?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fG1vdmllfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60";

const setVoteClass = (vote_average) => {
  if (vote_average >= 8) {
    return 'green';
  } else if (vote_average >= 6) {
    return 'orange';
  } else {
    return 'red';
  }
};

// Format Release Date
function processReleaseDate(date) {
  if (!date) return '';
  
  try {
    const dateArray = date.split("-");
    const day = dateArray[2];
    const month = dateArray[1];
    const year = dateArray[0];
    return `${day}/${month}/${year}`;
  } catch (error) {
    return date;
  }
}

const Movie = ({ id, title, poster_path, overview, release_date, vote_average }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const navigate = useNavigate();

  const imageUrl = poster_path ? `${IMGPATH}${poster_path}` : IMGPATH_FALLBACK;
  const displayImageUrl = imageError ? IMGPATH_FALLBACK : imageUrl;

  // Timeout to hide skeleton if image takes too long to load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (imageLoading) {
        setImageLoading(false);
      }
    }, 5000); // Hide skeleton after 5 seconds max

    return () => clearTimeout(timer);
  }, [imageLoading]);

  const handleClick = () => {
    if (id) {
      navigate(`/movie/${id}`);
    }
  };

  return (
    <article 
      className="movie" 
      role="article" 
      aria-label={`Movie: ${title}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="movie-image-wrapper">
        {imageLoading && (
          <div className="image-skeleton" aria-hidden="true">
            <div className="skeleton-shimmer"></div>
          </div>
        )}
        <img
          src={displayImageUrl}
          alt={title || 'Movie poster'}
          onError={() => {
            setImageError(true);
            setImageLoading(false);
          }}
          onLoad={() => {
            setImageLoading(false);
          }}
          style={{ 
            display: imageLoading ? 'none' : 'block',
            width: '100%',
            height: 'auto',
            objectFit: 'cover'
          }}
          loading="lazy"
        />
        <div className="movie-rating-badge">
          <span className={`tag ${setVoteClass(vote_average)}`} aria-label={`Rating: ${vote_average} out of 10`}>
            {vote_average ? vote_average.toFixed(1) : 'N/A'}
          </span>
        </div>
      </div>
      <div className="movie-info">
        <h3 className="movie-title" title={title}>{title || 'Untitled'}</h3>
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
