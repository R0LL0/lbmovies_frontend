import './App.css';
import Movie from './components/Movie';

function App() {
  const movies = ['Movie 1', 'Movie 2', 'Movie 3'];
  return (
    <div>
      {movies.map((movie) => (
        <Movie />
      ))}
    </div>
  );
}

export default App;
