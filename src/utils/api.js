/**
 * API utility functions to call Netlify Functions instead of direct TMDB API
 * This keeps the API key secure on the server side
 */

const API_BASE = '/.netlify/functions/tmdb-proxy';

/**
 * Build query string from parameters
 */
const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    if (params[key] !== null && params[key] !== undefined) {
      queryParams.append(key, params[key]);
    }
  });
  return queryParams.toString();
};

/**
 * Generic function to call TMDB API through Netlify Function
 */
const callTMDB = async (endpoint, params = {}) => {
  const queryString = buildQueryString({
    endpoint,
    ...params,
  });

  const url = `${API_BASE}?${queryString}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calling TMDB API:', error);
    throw error;
  }
};

/**
 * Discover movies
 */
export const discoverMovies = async (page = 1, sortBy = 'popularity.desc') => {
  return callTMDB('discover/movie', {
    sort_by: sortBy,
    page: page.toString(),
  });
};

/**
 * Discover TV series
 */
export const discoverSeries = async (page = 1, sortBy = 'popularity.desc') => {
  return callTMDB('discover/tv', {
    sort_by: sortBy,
    page: page.toString(),
  });
};

/**
 * Search movies
 */
export const searchMovies = async (query, page = 1) => {
  return callTMDB('search/movie', {
    query: encodeURIComponent(query),
    page: page.toString(),
  });
};

/**
 * Search TV series
 */
export const searchSeries = async (query, page = 1) => {
  return callTMDB('search/tv', {
    query: encodeURIComponent(query),
    page: page.toString(),
  });
};

/**
 * Get movie details
 */
export const getMovieDetails = async (movieId, appendToResponse = '') => {
  const params = {
    language: 'en-US',
  };
  
  if (appendToResponse) {
    params.append_to_response = appendToResponse;
  }
  
  return callTMDB(`movie/${movieId}`, params);
};

/**
 * Get TV series details
 */
export const getSeriesDetails = async (seriesId, appendToResponse = '') => {
  const params = {
    language: 'en-US',
  };
  
  if (appendToResponse) {
    params.append_to_response = appendToResponse;
  }
  
  return callTMDB(`tv/${seriesId}`, params);
};

