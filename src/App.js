import React, {useEffect, useState} from 'react';
import Movie from './components/Movie';
import Pagination from '@mui/material/Pagination';

import './App.css';
import { makeStyles } from '@mui/styles';

const APIURL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=5003d23dedc1001d745759e4c7ffe979&page=";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=5003d23dedc1001d745759e4c7ffe979&query=";

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = React.useState(1);

  

  useEffect( () => {
    async function getMovies(url) {
      const moviesResp = await fetch(url)
      const moviesList = await moviesResp.json()
      setMovies(moviesList)    
    }

    if(searchTerm){
      const pagedURL = SEARCHAPI + searchTerm + '&page=' + page;
      getMovies(pagedURL);
    }else{
      getMovies(APIURL + page);
    }
    
    
  }, [page])

  console.log(movies)  

  const handleOnChange = (e) => {
    setSearchTerm(e.target.value);
    if(searchTerm) {
      async function getMovies(url) {
        const moviesResp = await fetch(url)
        const moviesList = await moviesResp.json()
        setMovies(moviesList)
      }
      getMovies(SEARCHAPI + searchTerm);
    }
  }
  
  const handleOnPageChange = (event, value) => {
    console.log(value)
    setPage(value);
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
      <header>
          <input className="search" type="search" placeholder='Search' value={searchTerm} onChange={handleOnChange} />
      </header>
      <div className='movie-container'>      
        {movies.results?.length > 0 && movies.results.map((movie) => (
          <Movie key={movie.id} {...movie}/>
        ))}
      </div>
      <div className="movie-pagination">
        <Pagination classes={{ ul: classes.ul }} count={movies.total_pages < 500 ? (movies.total_pages) : 500} page={page ?? 1} onChange={handleOnPageChange} variant="outlined" color="primary" />
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