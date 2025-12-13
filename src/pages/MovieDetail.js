import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Button,
} from "@mui/material";
import Navigation from "../components/Navigation";
import Comments from "../components/Comments";
import {
  isFavorite,
  addToFavorites,
  removeFromFavorites,
  isInWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../utils/favorites";
import "./DetailPage.css";

const API_KEY = "5003d23dedc1001d745759e4c7ffe979";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w1280";
const IMG_POSTER_URL = "https://image.tmdb.org/t/p/w500";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [videos, setVideos] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [watchProviders, setWatchProviders] = useState(null);
  const [images, setImages] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("all");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    if (movie) {
      setIsFav(isFavorite(movie.id, "movie"));
      setInWatchlist(isInWatchlist(movie.id, "movie"));
    }
  }, [movie]);

  useEffect(() => {
    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch movie details with all additional data
        const movieResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=en-US&append_to_response=credits,videos,similar,watch/providers,images,reviews`
        );

        if (!movieResponse.ok) {
          throw new Error("Failed to fetch movie details");
        }

        const movieData = await movieResponse.json();
        setMovie(movieData);
        setCast(movieData.credits?.cast?.slice(0, 12) || []);
        setVideos(
          movieData.videos?.results
            ?.filter((v) => v.type === "Trailer" || v.type === "Teaser")
            .slice(0, 3) || []
        );
        setSimilar(movieData.similar?.results?.slice(0, 6) || []);
        setWatchProviders(movieData["watch/providers"]?.results || null);
        setImages(movieData.images || null);
        setReviews(movieData.reviews?.results?.slice(0, 5) || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching movie:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieData();
    }
  }, [id]);

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return "#4ade80";
    if (rating >= 6) return "#fbbf24";
    return "#f87171";
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <CircularProgress size={60} thickness={4} />
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="detail-error">
        <Alert severity="error">{error || "Movie not found"}</Alert>
        <button onClick={() => navigate(-1)} className="back-button">
          Go Back
        </button>
      </div>
    );
  }

  const backdropUrl = movie.backdrop_path
    ? `${IMG_BASE_URL}${movie.backdrop_path}`
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
          backgroundImage: backdropUrl
            ? `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(${backdropUrl})`
            : "linear-gradient(135deg, #1a1f2e 0%, #0a0e1a 100%)",
        }}
      >
        <div className="detail-hero-content">
          <IconButton
            className="back-nav-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <span style={{ fontSize: "1.5rem" }}>←</span>
          </IconButton>

          <div className="detail-hero-info">
            <div className="detail-poster">
              <img
                src={
                  movie.poster_path
                    ? `${IMG_POSTER_URL}${movie.poster_path}`
                    : "https://via.placeholder.com/500x750"
                }
                alt={movie.title}
              />
            </div>

            <div className="detail-main-info">
              <h1 className="detail-title">{movie.title}</h1>

              <div className="detail-meta">
                {movie.release_date && (
                  <span className="meta-item">
                    📅 {new Date(movie.release_date).getFullYear()}
                  </span>
                )}
                {movie.runtime && (
                  <span className="meta-item">
                    ⏱️ {formatRuntime(movie.runtime)}
                  </span>
                )}
                {movie.vote_average && (
                  <span
                    className="meta-item rating"
                    style={{ color: getRatingColor(movie.vote_average) }}
                  >
                    ⭐ {movie.vote_average.toFixed(1)}/10
                  </span>
                )}
              </div>

              <div className="detail-genres">
                {movie.genres?.map((genre) => (
                  <Chip
                    key={genre.id}
                    label={genre.name}
                    className="genre-chip"
                    size="small"
                  />
                ))}
              </div>

              <p className="detail-tagline">{movie.tagline}</p>

              <div className="detail-overview">
                <h3>Overview</h3>
                <p>{movie.overview || "No overview available."}</p>
              </div>

              <div className="detail-stats">
                {movie.budget > 0 && (
                  <div className="stat-item">
                    <span className="stat-label">Budget</span>
                    <span className="stat-value">
                      {formatCurrency(movie.budget)}
                    </span>
                  </div>
                )}
                {movie.revenue > 0 && (
                  <div className="stat-item">
                    <span className="stat-label">Revenue</span>
                    <span className="stat-value">
                      {formatCurrency(movie.revenue)}
                    </span>
                  </div>
                )}
                {movie.status && (
                  <div className="stat-item">
                    <span className="stat-label">Status</span>
                    <span className="stat-value">{movie.status}</span>
                  </div>
                )}
              </div>

              <div className="detail-actions">
                <button
                  className={`favorite-button ${isFav ? "active" : ""}`}
                  onClick={() => {
                    if (isFav) {
                      removeFromFavorites(movie.id, "movie");
                      setIsFav(false);
                    } else {
                      addToFavorites({
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path,
                        type: "movie",
                      });
                      setIsFav(true);
                    }
                  }}
                >
                  {isFav ? "❤️" : "🤍"}{" "}
                  {isFav ? "Favorited" : "Add to Favorites"}
                </button>
                <button
                  className={`watchlist-button ${inWatchlist ? "active" : ""}`}
                  onClick={() => {
                    if (inWatchlist) {
                      removeFromWatchlist(movie.id, "movie");
                      setInWatchlist(false);
                    } else {
                      addToWatchlist({
                        id: movie.id,
                        title: movie.title,
                        poster_path: movie.poster_path,
                        type: "movie",
                      });
                      setInWatchlist(true);
                    }
                  }}
                >
                  {inWatchlist ? "✓" : "+"}{" "}
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </button>
              </div>

              {videos.length > 0 && (
                <div className="detail-trailers">
                  <h3>Trailers</h3>
                  <div className="trailer-list">
                    {videos.map((video) => (
                      <a
                        key={video.key}
                        href={`https://www.youtube.com/watch?v=${video.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trailer-button"
                      >
                        <span style={{ fontSize: "1.5rem" }}>▶</span>
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
              {cast.map((actor) => (
                <div key={actor.id} className="cast-card">
                  <div className="cast-image">
                    <img
                      src={
                        actor.profile_path
                          ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
                          : "https://via.placeholder.com/300x450"
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
                          {watchProviders.US.flatrate.map((provider) => (
                            <div
                              key={provider.provider_id}
                              className="provider-item"
                            >
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
                          {watchProviders.US.rent.map((provider) => (
                            <div
                              key={provider.provider_id}
                              className="provider-item"
                            >
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
                          {watchProviders.US.buy.map((provider) => (
                            <div
                              key={provider.provider_id}
                              className="provider-item"
                            >
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
        {images &&
          (images.posters?.length > 0 || images.backdrops?.length > 0) && (
            <section className="detail-section">
              <h2 className="section-title">Gallery</h2>
              <div className="image-gallery">
                {images.backdrops?.slice(0, 8).map((image, index) => (
                  <div
                    key={index}
                    className="gallery-item"
                    onClick={() =>
                      setSelectedImage(
                        `https://image.tmdb.org/t/p/w1280${image.file_path}`
                      )
                    }
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
                    onClick={() =>
                      setSelectedImage(
                        `https://image.tmdb.org/t/p/w1280${image.file_path}`
                      )
                    }
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
              {reviews.map((review) => (
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
                      ⭐{" "}
                      {review.author_details.rating
                        ? `${review.author_details.rating}/10`
                        : "N/A"}
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

        {/* Comments Section */}
        <section className="detail-section">
          <Comments movieId={movie.id} movieType="movie" />
        </section>

        {/* Comments Section */}
        <section className="detail-section">
          <Comments movieId={movie.id} movieType="movie" />
        </section>

        {/* Similar Movies */}
        {similar.length > 0 && (
          <section className="detail-section">
            <h2 className="section-title">Similar Movies</h2>
            <div className="similar-grid">
              {similar.map((similarMovie) => (
                <div
                  key={similarMovie.id}
                  className="similar-card"
                  onClick={() => navigate(`/movie/${similarMovie.id}`)}
                >
                  <img
                    src={
                      similarMovie.poster_path
                        ? `${IMG_POSTER_URL}${similarMovie.poster_path}`
                        : "https://via.placeholder.com/500x750"
                    }
                    alt={similarMovie.title}
                  />
                  <div className="similar-info">
                    <h4>{similarMovie.title}</h4>
                    <span className="similar-rating">
                      ⭐ {similarMovie.vote_average?.toFixed(1)}
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
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lightbox-close"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img src={selectedImage} alt="Full size" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
