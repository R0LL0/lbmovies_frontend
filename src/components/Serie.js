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


const Serie = ({ name, poster_path, overview, first_air_date, vote_average}) => 
    <div className="serie">
        <img src={poster_path ? (IMGPATH + poster_path) : 'https://images.unsplash.com/photo-1560109947-543149eceb16?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTl8fG1vdmllfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60' } alt={name} />
        <div className="serie-info">
            <h3>{name}</h3>
            <span className={`tag ${setVoteClass(vote_average)}`}>{vote_average}</span>
            
        </div>
        <div className="serie-info">{first_air_date ? first_air_date.split("-")[0] : ''}</div>
        <div className="serie-over">
            <h2>Overview</h2>
            <p>{overview}</p>
        </div>
    </div>;


export default Serie;