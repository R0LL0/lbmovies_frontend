import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import {
  getCurrentUser,
  getUserProfile,
  updateProfile,
  signOut,
} from "../services/authService";
import { getUserFavorites, getUserWatchlist } from "../services/userService";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      if (!currentUser) {
        navigate("/login");
        return;
      }

      setUser(currentUser);

      const { data: profileData } = await getUserProfile(currentUser.id);
      if (profileData) {
        setProfile(profileData);
        setUsername(profileData.username || "");
      }

      const { data: favoritesData } = await getUserFavorites(currentUser.id);
      if (favoritesData) setFavorites(favoritesData);

      const { data: watchlistData } = await getUserWatchlist(currentUser.id);
      if (watchlistData) setWatchlist(watchlistData);
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { data, error } = await updateProfile(user.id, { username });
      if (error) throw error;
      setProfile(data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    window.location.reload();
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <Navigation
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSectionChange={setActiveSection}
        activeSection={activeSection}
      />
      <div className="profile-header">
        <h1>My Profile</h1>
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
        </button>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <h2>{profile?.username || "User"}</h2>
          <p className="profile-email">{user.email}</p>

          {editing ? (
            <div className="edit-form">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
              />
              <div className="edit-actions">
                <button onClick={handleUpdateProfile} className="save-button">
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="edit-button">
              Edit Profile
            </button>
          )}
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <h3>{favorites.length}</h3>
            <p>Favorites</p>
          </div>
          <div className="stat-card">
            <h3>{watchlist.length}</h3>
            <p>Watchlist</p>
          </div>
        </div>

        {favorites.length > 0 && (
          <div className="profile-section">
            <h2>My Favorites</h2>
            <div className="items-grid">
              {favorites.map((fav) => (
                <div key={fav.id} className="item-card">
                  <img
                    src={
                      fav.movie_data?.poster_path
                        ? `https://image.tmdb.org/t/p/w500${fav.movie_data.poster_path}`
                        : "https://via.placeholder.com/500x750"
                    }
                    alt={fav.movie_data?.title || fav.movie_data?.name}
                  />
                  <h4>{fav.movie_data?.title || fav.movie_data?.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}

        {watchlist.length > 0 && (
          <div className="profile-section">
            <h2>My Watchlist</h2>
            <div className="items-grid">
              {watchlist.map((item) => (
                <div key={item.id} className="item-card">
                  <img
                    src={
                      item.movie_data?.poster_path
                        ? `https://image.tmdb.org/t/p/w500${item.movie_data.poster_path}`
                        : "https://via.placeholder.com/500x750"
                    }
                    alt={item.movie_data?.title || item.movie_data?.name}
                  />
                  <h4>{item.movie_data?.title || item.movie_data?.name}</h4>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
