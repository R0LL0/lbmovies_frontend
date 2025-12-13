import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { followUser, unfollowUser, isFollowing } from "../services/socialService";
import { getCurrentUser } from "../services/authService";
import "./UserCard.css";

const UserCard = ({ user, showFollowButton = true }) => {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkFollowing();
  }, [user]);

  const checkFollowing = async () => {
    const { user: current } = await getCurrentUser();
    setCurrentUser(current);
    if (current && user && current.id !== user.id) {
      const { isFollowing: followingStatus } = await isFollowing(
        current.id,
        user.id
      );
      setFollowing(followingStatus);
    }
    setLoading(false);
  };

  const handleFollow = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const { error } = following
      ? await unfollowUser(currentUser.id, user.id)
      : await followUser(currentUser.id, user.id);

    if (!error) {
      setFollowing(!following);
    }
  };

  const handleProfileClick = () => {
    // Navigate to user profile (you can create a user profile page)
    // For now, just show their username
  };

  return (
    <div className="user-card" onClick={handleProfileClick}>
      <div className="user-avatar-large">
        {user.username?.charAt(0).toUpperCase() ||
          user.email?.charAt(0).toUpperCase() ||
          "U"}
      </div>
      <div className="user-info">
        <h4 className="user-name">{user.username || "User"}</h4>
        <p className="user-email">{user.email}</p>
      </div>
      {showFollowButton &&
        currentUser &&
        currentUser.id !== user.id &&
        !loading && (
          <button
            className={`follow-button ${following ? "following" : ""}`}
            onClick={handleFollow}
          >
            {following ? "Following" : "Follow"}
          </button>
        )}
    </div>
  );
};

export default UserCard;

