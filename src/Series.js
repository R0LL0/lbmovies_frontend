import React, { useEffect, useState } from "react";
import Movie from "./components/Movie";
import Pagination from "@mui/material/Pagination";
import { Link } from "react-router-dom";
import "./App.css";
import { makeStyles } from "@mui/styles";
import { discoverSeries, searchSeries } from "./utils/api";

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = React.useState(1);

  useEffect(() => {
    async function getMovies() {
      try {
        const data = searchTerm
          ? await searchSeries(searchTerm, page)
          : await discoverSeries(page);
        setMovies(data);
      } catch (error) {
        console.error("Error fetching series:", error);
        setMovies({ results: [], total_pages: 0 });
      }
    }

    getMovies();
  }, [page, searchTerm]);

  console.log(movies);

  const handleOnChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      try {
        const data = await searchSeries(value, 1);
        setMovies(data);
        setPage(1);
      } catch (error) {
        console.error("Error searching series:", error);
      }
    } else {
      // Reset to discover if search is cleared
      try {
        const data = await discoverSeries(1);
        setMovies(data);
        setPage(1);
      } catch (error) {
        console.error("Error fetching series:", error);
      }
    }
  };

  const handleOnPageChange = (event, value) => {
    console.log(value);
    setPage(value);
  };

  const useStyles = makeStyles(() => ({
    ul: {
      "& .MuiPaginationItem-root": {
        color: "#fff",
      },
    },
  }));

  const classes = useStyles();
  return (
    <>
      <header>
        <input
          className="search"
          type="search"
          placeholder="Search"
          value={searchTerm}
          onChange={handleOnChange}
        />
      </header>

      <header>
        <ul>
          <li>
            <Link to="App">Movies</Link>
          </li>
          <li>
            <Link to="Series">Series</Link>
          </li>
        </ul>
      </header>

      <div className="movie-container">
        <h1>Most Popular</h1>
      </div>

      <div className="movie-pagination">
        <Pagination
          classes={{ ul: classes.ul }}
          count={movies.total_pages < 500 ? movies.total_pages : 500}
          page={page ?? 1}
          onChange={handleOnPageChange}
          variant="outlined"
          color="primary"
        />
      </div>

      <div className="movie-container">
        {movies.results?.length > 0 &&
          movies.results.map((movie) => <Movie key={movie.id} {...movie} />)}
      </div>

      <div className="movie-pagination">
        <Pagination
          classes={{ ul: classes.ul }}
          count={movies.total_pages < 500 ? movies.total_pages : 500}
          page={page ?? 1}
          onChange={handleOnPageChange}
          variant="outlined"
          color="primary"
        />
      </div>

      <div className="movie-footer">
        <span className="dd-footer">
          All Rights Reserved, LB Movies{" "}
          <script>document.write(new Date().getFullYear())</script>2021 © <br />
          <span className="dd-footer dd-footer-secondary footer-link">
            Designed &amp; Developed by{" "}
            <a target="_blank" href="https://github.com/R0LL0">
              R0LL0{" "}
            </a>
          </span>
        </span>
      </div>
    </>
  );
}

export default App;
