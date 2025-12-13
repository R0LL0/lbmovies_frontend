// Favorites utility functions using localStorage

const FAVORITES_KEY = 'lbmovies_favorites';
const WATCHLIST_KEY = 'lbmovies_watchlist';

export const getFavorites = () => {
  try {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const addToFavorites = (item) => {
  try {
    const favorites = getFavorites();
    if (!favorites.find(fav => fav.id === item.id && fav.type === item.type)) {
      favorites.push({ ...item, type: item.type || 'movie' });
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return false;
  }
};

export const removeFromFavorites = (id, type = 'movie') => {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(fav => !(fav.id === id && fav.type === type));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

export const isFavorite = (id, type = 'movie') => {
  const favorites = getFavorites();
  return favorites.some(fav => fav.id === id && fav.type === type);
};

export const getWatchlist = () => {
  try {
    const watchlist = localStorage.getItem(WATCHLIST_KEY);
    return watchlist ? JSON.parse(watchlist) : [];
  } catch (error) {
    console.error('Error getting watchlist:', error);
    return [];
  }
};

export const addToWatchlist = (item) => {
  try {
    const watchlist = getWatchlist();
    if (!watchlist.find(wlItem => wlItem.id === item.id && wlItem.type === item.type)) {
      watchlist.push({ ...item, type: item.type || 'movie' });
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return false;
  }
};

export const removeFromWatchlist = (id, type = 'movie') => {
  try {
    const watchlist = getWatchlist();
    const filtered = watchlist.filter(item => !(item.id === id && item.type === type));
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return false;
  }
};

export const isInWatchlist = (id, type = 'movie') => {
  const watchlist = getWatchlist();
  return watchlist.some(item => item.id === id && item.type === type);
};

