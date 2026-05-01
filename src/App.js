import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Movie from "./components/Movie";
import Serie from "./components/Serie";
import Navigation from "./components/Navigation";
import HeroCarousel from "./components/HeroCarousel";
import MediaRow from "./components/MediaRow";
import MovieDetail from "./pages/MovieDetail";
import SeriesDetail from "./pages/SeriesDetail";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ActivityFeed from "./pages/ActivityFeed";
import EmailConfirmation from "./components/EmailConfirmation";
import Pagination from "@mui/material/Pagination";
import { Alert, Typography } from "@mui/material";
import {
  discoverMovies,
  discoverSeries,
  searchMovies,
  searchSeries,
  getTrending,
  getTopRatedMovies,
  getTopRatedSeries,
  getUpcomingMovies,
  getOnTheAirSeries,
} from "./utils/api";
import "./App.css";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function App() {
  const location = useLocation();
  const consumedNavKeyRef = useRef(null);

  // Browse grid (search / discover) state — preserved from prior version
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

  // Curated rows state
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [topMovies, setTopMovies] = useState([]);
  const [topMoviesLoading, setTopMoviesLoading] = useState(true);
  const [topSeries, setTopSeries] = useState([]);
  const [topSeriesLoading, setTopSeriesLoading] = useState(true);
  const [upcoming, setUpcoming] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);
  const [airing, setAiring] = useState([]);
  const [airingLoading, setAiringLoading] = useState(true);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPageMovies(1);
    setPageSeries(1);
  }, [debouncedSearchTerm]);

  const fetchMovies = useCallback(async () => {
    setLoadingMovies(true);
    setErrorMovies(null);
    try {
      const data = debouncedSearchTerm
        ? await searchMovies(debouncedSearchTerm, pageMovies)
        : await discoverMovies(pageMovies);
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
      const data = debouncedSearchTerm
        ? await searchSeries(debouncedSearchTerm, pageSeries)
        : await discoverSeries(pageSeries);
      setSeries(data);
    } catch (err) {
      setErrorSeries(err.message);
      console.error("Error fetching series:", err);
    } finally {
      setLoadingSeries(false);
    }
  }, [debouncedSearchTerm, pageSeries]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);
  useEffect(() => { fetchSeries(); }, [fetchSeries]);

  // Fetch curated rows once on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getTrending("all", "week");
        if (mounted) setTrending(data?.results || []);
      } catch (e) { console.error("trending:", e); }
      finally { if (mounted) setTrendingLoading(false); }
    })();

    (async () => {
      try {
        const data = await getTopRatedMovies();
        if (mounted) setTopMovies(data?.results || []);
      } catch (e) { console.error("top movies:", e); }
      finally { if (mounted) setTopMoviesLoading(false); }
    })();

    (async () => {
      try {
        const data = await getTopRatedSeries();
        if (mounted) setTopSeries(data?.results || []);
      } catch (e) { console.error("top series:", e); }
      finally { if (mounted) setTopSeriesLoading(false); }
    })();

    (async () => {
      try {
        const data = await getUpcomingMovies();
        if (mounted) setUpcoming(data?.results || []);
      } catch (e) { console.error("upcoming:", e); }
      finally { if (mounted) setUpcomingLoading(false); }
    })();

    (async () => {
      try {
        const data = await getOnTheAirSeries();
        if (mounted) setAiring(data?.results || []);
      } catch (e) { console.error("on the air:", e); }
      finally { if (mounted) setAiringLoading(false); }
    })();

    return () => { mounted = false; };
  }, []);

  const handleSearchChange = (value) => setSearchTerm(value);
  const handleSectionChange = (section) => setActiveSection(section);

  // Consume cross-page navigation: another page can do
  //   navigate("/", { state: { section: "movies", scrollToBrowse: true } })
  // and we apply it once per navigation (location.key is unique per nav).
  useEffect(() => {
    if (location.pathname !== "/") return;
    const navKey = location.key;
    const incoming = location.state;
    if (!incoming || consumedNavKeyRef.current === navKey) return;
    consumedNavKeyRef.current = navKey;

    if (incoming.section) {
      setActiveSection(incoming.section);
    }
    if (incoming.scrollToBrowse) {
      // Wait for the section change + content render before scrolling.
      setTimeout(() => {
        const el = document.getElementById("browse-section");
        if (!el) return;
        const navHeight =
          document.querySelector(".navigation")?.offsetHeight || 0;
        const top =
          el.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
        window.scrollTo({ top, behavior: "smooth" });
      }, 120);
    }
  }, [location]);

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
          "&.Mui-disabled": { opacity: 0.3 },
        },
      },
    }),
    []
  );

  const displayItems = useMemo(() => {
    if (activeSection === "all") {
      const moviesList = (movies?.results || []).map((item) => ({ ...item, type: "movie" }));
      const seriesList = (series?.results || []).map((item) => ({ ...item, type: "series" }));
      return [...moviesList, ...seriesList].sort((a, b) => {
        const aScore = (a.vote_average || 0) * (a.vote_count || 0);
        const bScore = (b.vote_average || 0) * (b.vote_count || 0);
        return bScore - aScore;
      });
    } else if (activeSection === "movies") {
      return (movies?.results || []).map((item) => ({ ...item, type: "movie" }));
    } else if (activeSection === "series") {
      return (series?.results || []).map((item) => ({ ...item, type: "series" }));
    }
    return [];
  }, [activeSection, movies, series]);

  const currentPage =
    activeSection === "movies" ? pageMovies :
    activeSection === "series" ? pageSeries : pageMovies;

  const totalPages =
    activeSection === "movies" ? (movies?.total_pages || 0) :
    activeSection === "series" ? (series?.total_pages || 0) :
    Math.max(movies?.total_pages || 0, series?.total_pages || 0);

  const isLoading =
    activeSection === "movies" ? loadingMovies :
    activeSection === "series" ? loadingSeries :
    (loadingMovies || loadingSeries);

  const hasError =
    activeSection === "movies" ? errorMovies :
    activeSection === "series" ? errorSeries :
    (errorMovies || errorSeries);

  const totalResults =
    activeSection === "all" ? ((movies?.total_results || 0) + (series?.total_results || 0)) :
    activeSection === "movies" ? (movies?.total_results || 0) :
    (series?.total_results || 0);

  const handlePageChange = (event, value) => {
    if (activeSection === "movies") setPageMovies(value);
    else if (activeSection === "series") setPageSeries(value);
    else { setPageMovies(value); setPageSeries(value); }
    const browse = document.getElementById("browse-section");
    if (browse) {
      const navHeight = document.querySelector(".navigation")?.offsetHeight || 0;
      const top = browse.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
      window.scrollTo({ top, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isSearching = !!debouncedSearchTerm;

  return (
    <Routes>
      <Route path="/movie/:id" element={<MovieDetail />} />
      <Route path="/series/:id" element={<SeriesDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/activity" element={<ActivityFeed />} />
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
              {/* Hero & curated rows hide while searching to surface results */}
              {!isSearching && (
                <>
                  <HeroCarousel items={trending.slice(0, 6)} />

                  <MediaRow
                    title="Trending This Week"
                    icon="🔥"
                    items={trending.slice(0, 18)}
                    mediaType="mixed"
                    loading={trendingLoading}
                  />

                  <MediaRow
                    title="Top Rated Movies"
                    icon="🏆"
                    items={topMovies.slice(0, 18)}
                    mediaType="movie"
                    loading={topMoviesLoading}
                  />

                  <MediaRow
                    title="Top Rated Series"
                    icon="📺"
                    items={topSeries.slice(0, 18)}
                    mediaType="tv"
                    loading={topSeriesLoading}
                  />

                  <MediaRow
                    title="Coming Soon"
                    icon="🎬"
                    items={upcoming.slice(0, 18)}
                    mediaType="movie"
                    loading={upcomingLoading}
                  />

                  <MediaRow
                    title="On The Air"
                    icon="📡"
                    items={airing.slice(0, 18)}
                    mediaType="tv"
                    loading={airingLoading}
                  />
                </>
              )}

              {/* Browse / Search Grid */}
              <section id="browse-section" className="content-section">
                <div className="section-header">
                  <Typography variant="h2" component="h1" className="section-title">
                    {isSearching ? (
                      <>🔍 Search Results for "{debouncedSearchTerm}"</>
                    ) : activeSection === "all" ? (
                      <>🎞️ Browse Catalog</>
                    ) : activeSection === "movies" ? (
                      <>🎥 Movies</>
                    ) : (
                      <>📺 Series</>
                    )}
                  </Typography>
                  {!isLoading && totalResults > 0 && (
                    <Typography variant="body2" className="section-subtitle">
                      {totalResults} {totalResults === 1 ? "result" : "results"} found
                    </Typography>
                  )}

                  {!isSearching && (
                    <div className="section-tabs" role="tablist">
                      {[
                        { id: "all", label: "All", icon: "🎬" },
                        { id: "movies", label: "Movies", icon: "🎥" },
                        { id: "series", label: "Series", icon: "📺" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={activeSection === tab.id}
                          className={`section-tab ${activeSection === tab.id ? "is-active" : ""}`}
                          onClick={() => handleSectionChange(tab.id)}
                        >
                          <span aria-hidden="true">{tab.icon}</span>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {hasError && (
                  <Alert severity="error" className="error-alert">
                    Failed to load content: {hasError}
                  </Alert>
                )}

                {isLoading ? (
                  <div className="skeleton-grid">
                    {[...Array(12)].map((_, index) => (
                      <div key={index} className="skeleton-card">
                        <div className="skeleton-image"></div>
                        <div className="skeleton-content">
                          <div className="skeleton-line"></div>
                          <div className="skeleton-line short"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="unified-content-grid">
                      {displayItems.length > 0 ? (
                        displayItems.map((item) =>
                          item.type === "movie" ? (
                            <Movie key={`movie-${item.id}`} {...item} />
                          ) : (
                            <Serie key={`series-${item.id}`} {...item} />
                          )
                        )
                      ) : (
                        !hasError && (
                          <div className="empty-state">
                            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
                              {activeSection === "all" ? "🎬" : activeSection === "movies" ? "🎥" : "📺"}
                            </div>
                            <Typography variant="h5">
                              No {activeSection === "all" ? "content" : activeSection === "movies" ? "movies" : "series"} found
                            </Typography>
                            <Typography variant="body2">
                              Try adjusting your search terms or browse popular content
                            </Typography>
                          </div>
                        )
                      )}
                    </div>

                    {totalPages > 1 && (
                      <div className="unified-pagination">
                        <Pagination
                          classes={paginationStyles}
                          count={Math.min(totalPages, 500)}
                          page={currentPage}
                          onChange={handlePageChange}
                          variant="outlined"
                          color="primary"
                          size="large"
                        />
                      </div>
                    )}
                  </>
                )}
              </section>
            </main>

            <footer className="movie-footer">
              <div className="footer-content">
                <Typography variant="body2" className="dd-footer">
                  All Rights Reserved, LB Movies {currentYear} ©
                </Typography>
                <Typography variant="body2" className="dd-footer dd-footer-secondary footer-link">
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
