import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Alert, Chip, IconButton } from '@mui/material';
import Navigation from '../components/Navigation';
import { isFavorite, addToFavorites, removeFromFavorites, isInWatchlist, addToWatchlist, removeFromWatchlist } from '../utils/favorites';
import './DetailPage.css';

const API_KEY = "5003d23dedc1001d745759e4c7ffe979";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const IMG_POSTER_URL = "https://image.tmdb.org/t/p/w500";

const SeriesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [series, setSeries] = useState(null);
  const [cast, setCast] = useState([]);
  const [videos, setVideos] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [watchProviders, setWatchProviders] = useState(null);
  const [images, setImages] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (series) {
      setIsFav(isFavorite(series.id, 'series'));
      setInWatchlist(isInWatchlist(series.id, 'series'));
    }
  }, [series]);

  useEffect(() => {
    const fetchSeriesData = async () => {
      setLoading(true);
      setError(null);
      try {
        const seriesResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos,similar,watch/providers,images,reviews`
        );
        
        if (!seriesResponse.ok) {
          throw new Error('Failed to fetch series details');
        }
        
        const seriesData = await seriesResponse.json();
        setSeries(seriesData);
        setCast(seriesData.credits?.cast?.slice(0, 12) || []);
        setVideos(seriesData.videos?.results?.filter(v => v.type === 'Trailer' || v.type === 'Teaser').slice(0, 3) || []);
        setSimilar(seriesData.similar?.results?.slice(0, 6) || []);
        setWatchProviders(seriesData['watch/providers']?.results || null);
        setImages(seriesData.images || null);
        setReviews(seriesData.reviews?.results?.slice(0, 5) || []);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching series:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchSeriesData();
    }
  }, [id]);

  const formatRuntime = (minutes) => {
    if (!minutes || minutes.length === 0) return 'N/A';
    const avgRuntime = minutes.reduce((a, b) => a + b, 0) / minutes.length;
    const hours = Math.floor(avgRuntime / 60);
    const mins = Math.round(avgRuntime % 60);
    return `${hours}h ${mins}m`;
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4ade80';
    if (rating >= 6) return '#fbbf24';
    return '#f87171';
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <CircularProgress size={60} thickness={4} />
        <p>Loading series details...</p>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="detail-error">
        <Alert severity="error">{error || 'Series not found'}</Alert>
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  const backdropUrl = series.backdrop_path 
    ? `${IMG_BASE_URL}${series.backdrop_path}` 
    : null;

  return (
    <div className="detail-page">
      <Navigation 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSectionChange={setActiveSection}
        activeSection={activeSection}
      />
      {/* Backdrop Hero Section */}
      <div 
        className="detail-hero" 
        style={{
          backgroundImage: backdropUrl ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(${backdropUrl})` : 'linear-gradient(135deg, #1a1f2e 0%, #0a0e1a 100%)',
        }}
      >
        <div className="detail-hero-content">
          <IconButton 
            className="back-nav-button" 
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <span style={{ fontSize: '1.5rem' }}>←</span>
          </IconButton>

          <div className="detail-hero-info">
            <div className="detail-poster">
              <img 
                src={series.poster_path ? `${IMG_POSTER_URL}${series.poster_path}` : 'https://via.placeholder.com/500x750'} 
                alt={series.name}
              />
            </div>

            <div className="detail-main-info">
              <h1 className="detail-title">{series.name}</h1>
              
              <div className="detail-meta">
                {series.first_air_date && (
                  <span className="meta-item">
                    📅 {new Date(series.first_air_date).getFullYear()}
                    {series.last_air_date && series.last_air_date !== series.first_air_date && 
                      ` - ${new Date(series.last_air_date).getFullYear()}`
                    }
                  </span>
                )}
                {series.episode_run_time && series.episode_run_time.length > 0 && (
                  <span className="meta-item">
                    ⏱️ {formatRuntime(series.episode_run_time)}
                  </span>
                )}
                {series.vote_average && (
                  <span 
                    className="meta-item rating"
                    style={{ color: getRatingColor(series.vote_average) }}
                  >
                    ⭐ {series.vote_average.toFixed(1)}/10
                  </span>
                )}
              </div>

              <div className="detail-genres">
                {series.genres?.map(genre => (
                  <Chip 
                    key={genre.id} 
                    label={genre.name} 
                    className="genre-chip"
                    size="small"
                  />
                ))}
              </div>

              <p className="detail-tagline">{series.tagline}</p>

              <div className="detail-overview">
                <h3>Overview</h3>
                <p>{series.overview || 'No overview available.'}</p>
              </div>

              <div className="detail-stats">
                {series.number_of_seasons && (
                  <div className="stat-item">
                    <span className="stat-label">Seasons</span>
                    <span className="stat-value">{series.number_of_seasons}</span>
                  </div>
                )}
                {series.number_of_episodes && (
                  <div className="stat-item">
                    <span className="stat-label">Episodes</span>
                    <span className="stat-value">{series.number_of_episodes}</span>
                  </div>
                )}
                {series.status && (
                  <div className="stat-item">
                    <span className="stat-label">Status</span>
                    <span className="stat-value">{series.status}</span>
                  </div>
                )}
                {series.networks && series.networks.length > 0 && (
                  <div className="stat-item">
                    <span className="stat-label">Network</span>
                    <span className="stat-value">{series.networks[0].name}</span>
                  </div>
                )}
              </div>

              <div className="detail-actions">
                <button
                  className={`favorite-button ${isFav ? 'active' : ''}`}
                  onClick={() => {
                    if (isFav) {
                      removeFromFavorites(series.id, 'series');
                      setIsFav(false);
                    } else {
                      addToFavorites({ id: series.id, name: series.name, poster_path: series.poster_path, type: 'series' });
                      setIsFav(true);
                    }
                  }}
                >
                  {isFav ? '❤️' : '🤍'} {isFav ? 'Favorited' : 'Add to Favorites'}
                </button>
                <button
                  className={`watchlist-button ${inWatchlist ? 'active' : ''}`}
                  onClick={() => {
                    if (inWatchlist) {
                      removeFromWatchlist(series.id, 'series');
                      setInWatchlist(false);
                    } else {
                      addToWatchlist({ id: series.id, name: series.name, poster_path: series.poster_path, type: 'series' });
                      setInWatchlist(true);
                    }
                  }}
                >
                  {inWatchlist ? '✓' : '+'} {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              </div>

              {videos.length > 0 && (
                <div className="detail-trailers">
                  <h3>Trailers</h3>
                  <div className="trailer-list">
                    {videos.map(video => (
                      <a
                        key={video.key}
                        href={`https://www.youtube.com/watch?v=${video.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trailer-button"
                      >
                        <span style={{ fontSize: '1.5rem' }}>▶</span>
                        {video.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="detail-content">
        {/* Cast Section */}
        {cast.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">Cast</h2>
            <div className="cast-grid">
              {cast.map(actor => (
                <div key={actor.id} className="cast-card">
                  <div className="cast-image">
                    <img 
                      src={actor.profile_path 
                        ? `https://image.tmdb.org/t/p/w300${actor.profile_path}` 
                        : 'https://via.placeholder.com/300x450'
                      } 
                      alt={actor.name}
                    />
                  </div>
                  <div className="cast-info">
                    <h4>{actor.name}</h4>
                    <p>{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Watch Providers */}
        {watchProviders && (watchProviders.US || watchProviders.GB) && (
          <section className="detail-section">
            <h2 className="section-title">Where to Watch</h2>
            <div className="watch-providers">
              {watchProviders.US && (
                <div className="provider-country">
                  <h3>United States</h3>
                  <div className="providers-grid">
                    {watchProviders.US.flatrate && (
                      <div className="provider-type">
                        <h4>Stream</h4>
                        <div className="provider-list">
                          {watchProviders.US.flatrate.map(provider => (
                            <div key={provider.provider_id} className="provider-item">
                              <img 
                                src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                alt={provider.provider_name}
                                title={provider.provider_name}
                              />
                              <span>{provider.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {watchProviders.US.rent && (
                      <div className="provider-type">
                        <h4>Rent</h4>
                        <div className="provider-list">
                          {watchProviders.US.rent.map(provider => (
                            <div key={provider.provider_id} className="provider-item">
                              <img 
                                src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                alt={provider.provider_name}
                                title={provider.provider_name}
                              />
                              <span>{provider.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {watchProviders.US.buy && (
                      <div className="provider-type">
                        <h4>Buy</h4>
                        <div className="provider-list">
                          {watchProviders.US.buy.map(provider => (
                            <div key={provider.provider_id} className="provider-item">
                              <img 
                                src={`https://image.tmdb.org/t/p/w200${provider.logo_path}`}
                                alt={provider.provider_name}
                                title={provider.provider_name}
                              />
                              <span>{provider.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Image Gallery */}
        {images && (images.posters?.length > 0 || images.backdrops?.length > 0) && (
          <section className="detail-section">
            <h2 className="section-title">Gallery</h2>
            <div className="image-gallery">
              {images.backdrops?.slice(0, 8).map((image, index) => (
                <div 
                  key={index} 
                  className="gallery-item"
                  onClick={() => setSelectedImage(`https://image.tmdb.org/t/p/w1280${image.file_path}`)}
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                    alt={`Backdrop ${index + 1}`}
                  />
                </div>
              ))}
              {images.posters?.slice(0, 8).map((image, index) => (
                <div 
                  key={`poster-${index}`} 
                  className="gallery-item"
                  onClick={() => setSelectedImage(`https://image.tmdb.org/t/p/w1280${image.file_path}`)}
                >
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${image.file_path}`}
                    alt={`Poster ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">Reviews</h2>
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-author">
                      <div className="review-avatar">
                        {review.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4>{review.author}</h4>
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="review-rating">
                      ⭐ {review.author_details.rating ? `${review.author_details.rating}/10` : 'N/A'}
                    </div>
                  </div>
                  <p className="review-content">{review.content}</p>
                  {review.url && (
                    <a 
                      href={review.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="review-link"
                    >
                      Read full review →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Series */}
        {similar.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">Similar Series</h2>
            <div className="similar-grid">
              {similar.map(similarSeries => (
                <div 
                  key={similarSeries.id} 
                  className="similar-card"
                  onClick={() => navigate(`/series/${similarSeries.id}`)}
                >
                  <img 
                    src={similarSeries.poster_path 
                      ? `${IMG_POSTER_URL}${similarSeries.poster_path}` 
                      : 'https://via.placeholder.com/500x750'
                    } 
                    alt={similarSeries.name}
                  />
                  <div className="similar-info">
                    <h4>{similarSeries.name}</h4>
                    <span className="similar-rating">
                      ⭐ {similarSeries.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {selectedImage && (
        <div className="image-lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedImage(null)}>×</button>
            <img src={selectedImage} alt="Full size" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SeriesDetail;

