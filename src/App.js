import React, {useEffect, useState} from 'react';

import Movie from './components/Movie';
import './App.css';

const APIURL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=5003d23dedc1001d745759e4c7ffe979&page=1";
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=5003d23dedc1001d745759e4c7ffe979&query=";

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  async function getMovies(url) {
    const moviesResp = await fetch(url)
    const moviesList = await moviesResp.json()
    setMovies(moviesList)
  }

  useEffect( () => {
    
    getMovies(APIURL);
    
  }, [])

  console.log(movies)

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if(searchTerm) {
      getMovies(SEARCHAPI + searchTerm);
      setSearchTerm("");
    }
    
  }

  const handleOnChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <>
      <header>
        <form onSubmit={handleOnSubmit}>
          <input className="search" type="search" placeholder='Search' valur={searchTerm} onChange={handleOnChange} />
        </form>
      </header>
      <div className='movie-container'>      
        {movies.results?.length > 0 && movies.results.map((movie) => (
          <Movie key={movie.id} {...movie}/>
        ))}
      </div>
    </>
  );
}

export default App;
