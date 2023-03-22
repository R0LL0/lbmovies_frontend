import React, {useEffect, useState} from 'react';
import Movie from './components/Movie';
import Serie from './components/Serie';
import Pagination from '@mui/material/Pagination';
import {Link} from "react-router-dom";
import './App.css';
import { makeStyles } from '@mui/styles';
import logo from "./images/2.png";

const APIURLMOVIES = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=5003d23dedc1001d745759e4c7ffe979&page=";
const APIURLSERIES = "https://api.themoviedb.org/3/discover/tv?sort_by=popularity.desc&api_key=5003d23dedc1001d745759e4c7ffe979&page=";
const SEARCHAPIMOVIES = "https://api.themoviedb.org/3/search/movie?&api_key=5003d23dedc1001d745759e4c7ffe979&query=";
const SEARCHAPISERIES = "https://api.themoviedb.org/3/search/tv?&api_key=5003d23dedc1001d745759e4c7ffe979&query=";

function App() {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageMovies, setPageMovies] = React.useState(1);
  const [pageSeries, setPageSeries] = React.useState(1);

  

  useEffect( () => {
    async function getMovies(url_movies, url_series) {
      const moviesResp = await fetch(url_movies)
      const moviesList = await moviesResp.json()
      setMovies(moviesList) 
      
      const seriesResp = await fetch(url_series)
      const seriesList = await seriesResp.json()
      setSeries(seriesList) 
    }

    if(searchTerm){
      const pagedURLMOVIES = SEARCHAPIMOVIES + searchTerm + '&page=' + pageMovies;
      const pagedURLSERIES = SEARCHAPISERIES + searchTerm + '&page=' + pageSeries;
      getMovies(pagedURLMOVIES, pagedURLSERIES);
    }else{
      getMovies(APIURLMOVIES + pageMovies, APIURLSERIES + pageSeries);
    }
    
    
  }, [pageMovies, pageSeries])


  const handleOnChange = (e) => {
    setSearchTerm(e.target.value);
    if(searchTerm) {
      async function getMovies(url_movies, url_series) {
        const moviesResp = await fetch(url_movies)
        const moviesList = await moviesResp.json()
        setMovies(moviesList) 
        
        const seriesResp = await fetch(url_series)
        const seriesList = await seriesResp.json()
        setSeries(seriesList) 
      }

      const pagedURLMOVIES = SEARCHAPIMOVIES + searchTerm + '&page=' + pageMovies;
      const pagedURLSERIES = SEARCHAPISERIES + searchTerm + '&page=' + pageSeries;
      getMovies(pagedURLMOVIES, pagedURLSERIES);
    }
  }
  
  const handleOnPageChangeMovies = (event, value) => {
    setPageMovies(value);
  }

  const handleOnPageChangeSeries = (event, value) => {
    setPageSeries(value);
  }

  const useStyles = makeStyles(() => ({
    ul: {
      "& .MuiPaginationItem-root": {
        color: "#fff"
      }
    }
  }));

  const classes = useStyles();
  return (
    <>
      <header className='img-logo' onClick={() => window.location.href = 'https://lbmovies.netlify.app/'}>
        <img src={logo} width="100" alt="LB Movies" />
      </header>
      <header>
            <input className="search" type="search" placeholder='Search' value={searchTerm} onChange={handleOnChange} />
      </header>
      
      <div className='serie-container'>
        <h1>Most Popular Movies</h1> 
      </div>

      {/* <div className="movie-pagination">
        <Pagination classes={{ ul: classes.ul }} count={movies.total_pages < 500 ? (movies.total_pages) : 500} page={page ?? 1} onChange={handleOnPageChange} variant="outlined" color="primary" />
      </div> */}

      <div className='movie-container'>   
        {movies.results?.length > 0 && movies.results.map((movie) => (
          <Movie key={movie.id} {...movie}/>
        ))}
      </div>

      <div className="movie-pagination">
        <Pagination classes={{ ul: classes.ul }} count={movies.total_pages < 500 ? (movies.total_pages) : 500} page={pageMovies ?? 1} onChange={handleOnPageChangeMovies} variant="outlined" color="primary" />
      </div>

      
      <div className='movie-container'>
        <h1>Most Popular Series</h1> 
      </div>

      {/* <div className="serie-pagination">
        <Pagination classes={{ ul: classes.ul }} count={series.total_pages < 500 ? (series.total_pages) : 500} page={page ?? 1} onChange={handleOnPageChange} variant="outlined" color="primary" />
      </div> */}

      <div className='serie-container'>  
        {series.results?.length > 0 && series.results.map((serie) => (
          <Serie key={serie.id} {...serie}/>
        ))}
      </div>

      <div className="serie-pagination">
        <Pagination classes={{ ul: classes.ul }} count={series.total_pages < 500 ? (series.total_pages) : 500} page={pageSeries ?? 1} onChange={handleOnPageChangeSeries} variant="outlined" color="primary" />
      </div>
      
      <div className="movie-footer">
        <span className="dd-footer">All Rights Reserved, LB Movies <script>document.write(new Date().getFullYear())</script>2021 © <br />
          <span className="dd-footer dd-footer-secondary footer-link" >Designed &amp; Developed by <a target="_blank" href="https://github.com/R0LL0">R0LL0 </a></span>
        </span>
       
      </div>



    </>
  );
}

export default App;
