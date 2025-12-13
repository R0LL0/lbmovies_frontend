import { supabase } from '../config/supabase';

// Get User Favorites
export const getUserFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Add to Favorites
export const addToFavorites = async (userId, movieId, movieType, movieData) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([
        {
          user_id: userId,
          movie_id: movieId,
          movie_type: movieType,
          movie_data: movieData,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Remove from Favorites
export const removeFromFavorites = async (userId, movieId, movieType) => {
  try {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .eq('movie_type', movieType);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Get User Watchlist
export const getUserWatchlist = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Add to Watchlist
export const addToWatchlist = async (userId, movieId, movieType, movieData) => {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .insert([
        {
          user_id: userId,
          movie_id: movieId,
          movie_type: movieType,
          movie_data: movieData,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Remove from Watchlist
export const removeFromWatchlist = async (userId, movieId, movieType) => {
  try {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId)
      .eq('movie_type', movieType);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Get User Reviews
export const getUserReviews = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Create Review
export const createReview = async (userId, movieId, movieType, rating, content) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: userId,
          movie_id: movieId,
          movie_type: movieType,
          rating: rating,
          content: content,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

