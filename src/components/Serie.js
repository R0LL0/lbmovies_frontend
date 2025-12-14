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

const Serie = ({ id, name, poster_path, overview, first_air_date, vote_average }) => {
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
      navigate(`/series/${id}`);
    }
  };

  return (
    <article 
      className="serie" 
      role="article" 
      aria-label={`Series: ${name}`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="serie-image-wrapper">
        {imageLoading && (
          <div className="image-skeleton" aria-hidden="true">
            <div className="skeleton-shimmer"></div>
          </div>
        )}
        <img
          src={displayImageUrl}
          alt={name || 'Series poster'}
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
            height: '100%',
            objectFit: 'cover'
          }}
          loading="lazy"
        />
        <div className="serie-rating-badge">
          <span className={`tag ${setVoteClass(vote_average)}`} aria-label={`Rating: ${vote_average} out of 10`}>
            {vote_average ? vote_average.toFixed(1) : 'N/A'}
          </span>
        </div>
      </div>
      <div className="serie-info">
        <h3 className="serie-title" title={name}>{name || 'Untitled'}</h3>
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
