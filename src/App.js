import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Routes, Route } from "react-router-dom";
import Movie from "./components/Movie";
import Serie from "./components/Serie";
import Navigation from "./components/Navigation";
import MovieDetail from "./pages/MovieDetail";
import SeriesDetail from "./pages/SeriesDetail";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import EmailConfirmation from "./components/EmailConfirmation";
import Pagination from "@mui/material/Pagination";
import { CircularProgress, Alert, Typography } from "@mui/material";
import "./App.css";

const APIURLMOVIES =
  "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=5003d23dedc1001d745759e4c7ffe979&page=";
const APIURLSERIES =
  "https://api.themoviedb.org/3/discover/tv?sort_by=popularity.desc&api_key=5003d23dedc1001d745759e4c7ffe979&page=";
const SEARCHAPIMOVIES =
  "https://api.themoviedb.org/3/search/movie?&api_key=5003d23dedc1001d745759e4c7ffe979&query=";
const SEARCHAPISERIES =
  "https://api.themoviedb.org/3/search/tv?&api_key=5003d23dedc1001d745759e4c7ffe979&query=";

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function App() {
  const [movies, setMovies] = useState(null);
  const [series, setSeries] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("all");
  const [pageMovies, setPageMovies] = useState(1);
  const [pageSeries, setPageSeries] = useState(1);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [errorMovies, setErrorMovies] = useState(null);
  const [errorSeries, setErrorSeries] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setPageMovies(1);
    setPageSeries(1);
  }, [debouncedSearchTerm]);

  const fetchMovies = useCallback(async () => {
    setLoadingMovies(true);
    setErrorMovies(null);
    try {
      const url = debouncedSearchTerm
        ? `${SEARCHAPIMOVIES}${encodeURIComponent(
            debouncedSearchTerm
          )}&page=${pageMovies}`
        : `${APIURLMOVIES}${pageMovies}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMovies(data);
    } catch (err) {
      setErrorMovies(err.message);
      console.error("Error fetching movies:", err);
    } finally {
      setLoadingMovies(false);
    }
  }, [debouncedSearchTerm, pageMovies]);

  const fetchSeries = useCallback(async () => {
    setLoadingSeries(true);
    setErrorSeries(null);
    try {
      const url = debouncedSearchTerm
        ? `${SEARCHAPISERIES}${encodeURIComponent(
            debouncedSearchTerm
          )}&page=${pageSeries}`
        : `${APIURLSERIES}${pageSeries}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSeries(data);
    } catch (err) {
      setErrorSeries(err.message);
      console.error("Error fetching series:", err);
    } finally {
      setLoadingSeries(false);
    }
  }, [debouncedSearchTerm, pageSeries]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const handleOnPageChangeMovies = (event, value) => {
    setPageMovies(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOnPageChangeSeries = (event, value) => {
    setPageSeries(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  const paginationStyles = useMemo(
    () => ({
      ul: {
        "& .MuiPaginationItem-root": {
          color: "var(--text-primary)",
          fontSize: "1rem",
          fontWeight: 500,
          borderColor: "rgba(255, 255, 255, 0.2)",
          "&:hover": {
            backgroundColor: "rgba(255, 87, 34, 0.2)",
            borderColor: "rgba(255, 87, 34, 0.4)",
            color: "var(--accent-color)",
          },
          "&.Mui-selected": {
            backgroundColor: "var(--gradient-primary)",
            borderColor: "var(--accent-color)",
            color: "#fff",
            fontWeight: 700,
            boxShadow: "0 4px 12px rgba(255, 87, 34, 0.4)",
            "&:hover": {
              backgroundColor: "var(--gradient-primary)",
              opacity: 0.9,
            },
          },
          "&.Mui-disabled": {
            opacity: 0.3,
          },
        },
      },
    }),
    []
  );

  const shouldShowMovies =
    activeSection === "all" || activeSection === "movies";
  const shouldShowSeries =
    activeSection === "all" || activeSection === "series";

  return (
    <Routes>
      <Route path="/movie/:id" element={<MovieDetail />} />
      <Route path="/series/:id" element={<SeriesDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/auth/callback" element={<EmailConfirmation />} />
      <Route
        path="/"
        element={
          <div className="app-container">
            <Navigation
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onSectionChange={handleSectionChange}
              activeSection={activeSection}
            />

            <main className="main-content">
              {/* Movies Section */}
              {shouldShowMovies && (
                <section
                  id="movies-section"
                  className="content-section"
                  aria-labelledby="movies-heading"
                >
                  <div className="section-header">
                    <Typography
                      variant="h2"
                      component="h1"
                      id="movies-heading"
                      className="section-title"
                    >
                      {debouncedSearchTerm ? (
                        <>🔍 Search Results for "{debouncedSearchTerm}"</>
                      ) : (
                        <>🎥 Most Popular Movies</>
                      )}
                    </Typography>
                    {movies && !loadingMovies && (
                      <Typography variant="body2" className="section-subtitle">
                        {movies.total_results}{" "}
                        {movies.total_results === 1 ? "result" : "results"}{" "}
                        found
                      </Typography>
                    )}
                  </div>

                  {errorMovies && (
                    <Alert severity="error" className="error-alert">
                      Failed to load movies: {errorMovies}
                    </Alert>
                  )}

                  {loadingMovies ? (
                    <>
                      <div className="skeleton-grid">
                        {[...Array(6)].map((_, index) => (
                          <div key={index} className="skeleton-card">
                            <div className="skeleton-image"></div>
                            <div className="skeleton-content">
                              <div className="skeleton-line"></div>
                              <div className="skeleton-line short"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="movie-container">
                        {movies?.results?.length > 0
                          ? movies.results.map((movie) => (
                              <Movie key={movie.id} {...movie} />
                            ))
                          : !errorMovies && (
                              <div className="empty-state">
                                <div
                                  style={{
                                    fontSize: "4rem",
                                    marginBottom: "1rem",
                                  }}
                                >
                                  🎬
                                </div>
                                <Typography variant="h5">
                                  No movies found
                                </Typography>
                                <Typography variant="body2">
                                  Try adjusting your search terms or browse
                                  popular movies
                                </Typography>
                              </div>
                            )}
                      </div>

                      {movies?.total_pages > 1 && (
                        <div className="movie-pagination">
                          <Pagination
                            classes={paginationStyles}
                            count={Math.min(movies.total_pages, 500)}
                            page={pageMovies}
                            onChange={handleOnPageChangeMovies}
                            variant="outlined"
                            color="primary"
                            size="large"
                          />
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}

              {/* Series Section */}
              {shouldShowSeries && (
                <section
                  id="series-section"
                  className="content-section"
                  aria-labelledby="series-heading"
                >
                  <div className="section-header">
                    <Typography
                      variant="h2"
                      component="h1"
                      id="series-heading"
                      className="section-title"
                    >
                      {debouncedSearchTerm ? (
                        <>🔍 Search Results for "{debouncedSearchTerm}"</>
                      ) : (
                        <>📺 Most Popular Series</>
                      )}
                    </Typography>
                    {series && !loadingSeries && (
                      <Typography variant="body2" className="section-subtitle">
                        {series.total_results}{" "}
                        {series.total_results === 1 ? "result" : "results"}{" "}
                        found
                      </Typography>
                    )}
                  </div>

                  {errorSeries && (
                    <Alert severity="error" className="error-alert">
                      Failed to load series: {errorSeries}
                    </Alert>
                  )}

                  {loadingSeries ? (
                    <>
                      <div className="skeleton-grid">
                        {[...Array(6)].map((_, index) => (
                          <div key={index} className="skeleton-card">
                            <div className="skeleton-image"></div>
                            <div className="skeleton-content">
                              <div className="skeleton-line"></div>
                              <div className="skeleton-line short"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="serie-container">
                        {series?.results?.length > 0
                          ? series.results.map((serie) => (
                              <Serie key={serie.id} {...serie} />
                            ))
                          : !errorSeries && (
                              <div className="empty-state">
                                <div
                                  style={{
                                    fontSize: "4rem",
                                    marginBottom: "1rem",
                                  }}
                                >
                                  📺
                                </div>
                                <Typography variant="h5">
                                  No series found
                                </Typography>
                                <Typography variant="body2">
                                  Try adjusting your search terms or browse
                                  popular series
                                </Typography>
                              </div>
                            )}
                      </div>

                      {series?.total_pages > 1 && (
                        <div className="serie-pagination">
                          <Pagination
                            classes={paginationStyles}
                            count={Math.min(series.total_pages, 500)}
                            page={pageSeries}
                            onChange={handleOnPageChangeSeries}
                            variant="outlined"
                            color="primary"
                            size="large"
                          />
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}
            </main>

            <footer className="movie-footer">
              <div className="footer-content">
                <Typography variant="body2" className="dd-footer">
                  All Rights Reserved, LB Movies {currentYear} ©
                </Typography>
                <Typography
                  variant="body2"
                  className="dd-footer dd-footer-secondary footer-link"
                >
                  Designed &amp; Developed by{" "}
                  <a
                    target="_blank"
                    href="https://github.com/R0LL0"
                    rel="noopener noreferrer"
                    aria-label="Visit R0LL0's GitHub profile"
                  >
                    R0LL0
                  </a>
                </Typography>
              </div>
            </footer>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
