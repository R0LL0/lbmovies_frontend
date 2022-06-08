import React from "react";

const IMGPATH = "https://image.tmdb.org/t/p/w1280";

const setVoteClass = (vote_average) => {
    if(vote_average >= 8){
        return 'green'
    }else if(vote_average >= 6){
        return 'orange'
    }else{
        return 'red'
    }
}


const Movie = ({ title, poster_path, overview, release_date, vote_average}) => 
    <div className="movie">
        <img src={poster_path ? (IMGPATH + poster_path) : 'https://images.unsplash.com/photo-1560109947-543149eceb16?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fG1vdmllfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60' } alt={title} />
        <div className="movie-info">
            <h3>{title}</h3>
            <span className={`tag ${setVoteClass(vote_average)}`}>{vote_average}</span>
            
        </div>
        <div className="movie-info">{release_date ? release_date.replace("-", "/") : ''}</div>
        <div className="movie-over">
            <h2>Overview</h2>
            <p>{overview}</p>
        </div>
    </div>;


export default Movie;