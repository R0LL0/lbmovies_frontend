import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { getActivityFeed } from "../services/socialService";
import { getCurrentUser } from "../services/authService";
import "./ActivityFeed.css";

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    const { user } = await getCurrentUser();
    if (user) {
      setSignedIn(true);
      const { data, error } = await getActivityFeed(user.id);
      if (!error && data) {
        setActivities(data);
      }
    } else {
      setSignedIn(false);
    }
    setLoading(false);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "favorite":
        return "❤️";
      case "watchlist":
        return "➕";
      case "review":
        return "⭐";
      case "comment":
        return "💬";
      case "follow":
        return "👥";
      default:
        return "📝";
    }
  };

  const getActivityText = (activity) => {
    const username = activity.profiles?.username || "User";
    switch (activity.activity_type) {
      case "favorite":
        return `${username} favorited a ${activity.movie_type}`;
      case "watchlist":
        return `${username} added a ${activity.movie_type} to watchlist`;
      case "review":
        return `${username} reviewed a ${activity.movie_type}`;
      case "comment":
        return `${username} commented on a ${activity.movie_type}`;
      case "follow":
        return `${username} started following someone`;
      default:
        return `${username} did something`;
    }
  };

  const handleMovieClick = (activity) => {
    if (activity.movie_id && activity.movie_type) {
      navigate(`/${activity.movie_type}/${activity.movie_id}`);
    }
  };

  if (loading) {
    return (
      <div className="activity-feed-container">
        <Navigation
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSectionChange={setActiveSection}
          activeSection={activeSection}
        />
        <div className="activity-loading">Loading activity feed...</div>
      </div>
    );
  }

  return (
    <div className="activity-feed-container">
      <Navigation
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSectionChange={setActiveSection}
        activeSection={activeSection}
      />
      <div className="activity-content">
        <h1 className="activity-title">Activity Feed</h1>
        <p className="activity-subtitle">
          See what your friends are watching and discussing
        </p>

        {!signedIn ? (
          <div className="no-activities">
            <div className="no-activities-icon">🔐</div>
            <h2>Sign in to see your feed</h2>
            <p>Follow other users to see what they're watching and reviewing.</p>
            <button
              type="button"
              className="empty-state-cta"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="no-activities">
            <div className="no-activities-icon">📭</div>
            <h2>No activities yet</h2>
            <p>Follow other users to see their activity in your feed</p>
            <button
              type="button"
              className="empty-state-cta"
              onClick={() => navigate("/")}
            >
              Discover users
            </button>
          </div>
        ) : (
          <div className="activities-list">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="activity-item"
                onClick={() => handleMovieClick(activity)}
              >
                <div className="activity-icon">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="activity-content-wrapper">
                  <p className="activity-text">{getActivityText(activity)}</p>
                  {activity.metadata?.movie_data && (
                    <div className="activity-movie">
                      <img
                        src={
                          activity.metadata.movie_data.poster_path
                            ? `https://image.tmdb.org/t/p/w200${activity.metadata.movie_data.poster_path}`
                            : "https://via.placeholder.com/200x300"
                        }
                        alt={
                          activity.metadata.movie_data.title ||
                          activity.metadata.movie_data.name
                        }
                      />
                      <div>
                        <h4>
                          {activity.metadata.movie_data.title ||
                            activity.metadata.movie_data.name}
                        </h4>
                        {activity.metadata.rating && (
                          <span className="activity-rating">
                            ⭐ {activity.metadata.rating}/10
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <span className="activity-time">
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
