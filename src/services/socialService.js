import { supabase } from "../config/supabase";

// Follow a user
export const followUser = async (followerId, followingId) => {
  try {
    const { data, error } = await supabase
      .from("user_follows")
      .insert([
        {
          follower_id: followerId,
          following_id: followingId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create activity
    await createActivity(followerId, "follow", null, null, followingId);

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Unfollow a user
export const unfollowUser = async (followerId, followingId) => {
  try {
    const { error } = await supabase
      .from("user_follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Check if user is following another user
export const isFollowing = async (followerId, followingId) => {
  try {
    const { data, error } = await supabase
      .from("user_follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return { isFollowing: !!data, error: null };
  } catch (error) {
    return { isFollowing: false, error: error.message };
  }
};

// Get user's followers
export const getFollowers = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_follows")
      .select("follower_id, profiles!user_follows_follower_id_fkey(*)")
      .eq("following_id", userId);

    if (error) {
      if (
        error.code === "PGRST116" ||
        error.message.includes("406") ||
        error.message.includes("relation")
      ) {
        return { data: [], error: null };
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Get users that a user is following
export const getFollowing = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_follows")
      .select("following_id, profiles!user_follows_following_id_fkey(*)")
      .eq("follower_id", userId);

    if (error) {
      if (
        error.code === "PGRST116" ||
        error.message.includes("406") ||
        error.message.includes("relation")
      ) {
        return { data: [], error: null };
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Add comment to movie/series
export const addComment = async (userId, movieId, movieType, content) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          user_id: userId,
          movie_id: movieId,
          movie_type: movieType,
          content: content,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Create activity
    await createActivity(userId, "comment", movieId, movieType, null, {
      content: content,
    });

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Get comments for a movie/series
export const getComments = async (movieId, movieType) => {
  try {
    // Try to get comments with profiles join
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(*)")
      .eq("movie_id", movieId)
      .eq("movie_type", movieType)
      .order("created_at", { ascending: false });

    if (error) {
      // If relationship error, try fetching comments without profiles
      if (
        error.code === "PGRST200" ||
        error.message.includes("relationship") ||
        error.message.includes("foreign key")
      ) {
        console.warn("Profiles relationship not found, fetching comments without profiles");
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .eq("movie_id", movieId)
          .eq("movie_type", movieType)
          .order("created_at", { ascending: false });

        if (commentsError) {
          if (
            commentsError.code === "PGRST116" ||
            commentsError.message.includes("406") ||
            commentsError.message.includes("relation")
          ) {
            return { data: [], error: null };
          }
          throw commentsError;
        }

        // Fetch profiles separately and merge
        if (commentsData && commentsData.length > 0) {
          const userIds = [...new Set(commentsData.map(c => c.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("*")
            .in("id", userIds);

          const profilesMap = {};
          if (profilesData) {
            profilesData.forEach(p => {
              profilesMap[p.id] = p;
            });
          }

          const commentsWithProfiles = commentsData.map(comment => ({
            ...comment,
            profiles: profilesMap[comment.user_id] || null,
          }));

          return { data: commentsWithProfiles, error: null };
        }

        return { data: [], error: null };
      }

      if (
        error.code === "PGRST116" ||
        error.message.includes("406") ||
        error.message.includes("relation")
      ) {
        return { data: [], error: null };
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Update comment
export const updateComment = async (commentId, userId, content) => {
  try {
    const { data, error } = await supabase
      .from("comments")
      .update({
        content: content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Delete comment
export const deleteComment = async (commentId, userId) => {
  try {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Get activity feed for user (from users they follow)
export const getActivityFeed = async (userId, limit = 20) => {
  try {
    // Get activities from users that the current user follows
    const { data, error } = await supabase
      .from("user_activities")
      .select(
        `
        *,
        profiles!user_activities_user_id_fkey(*)
      `
      )
      .in(
        "user_id",
        supabase
          .from("user_follows")
          .select("following_id")
          .eq("follower_id", userId)
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      if (
        error.code === "PGRST116" ||
        error.message.includes("406") ||
        error.message.includes("relation")
      ) {
        return { data: [], error: null };
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Create activity (internal function)
const createActivity = async (
  userId,
  activityType,
  movieId,
  movieType,
  targetUserId = null,
  metadata = null
) => {
  try {
    await supabase.from("user_activities").insert([
      {
        user_id: userId,
        activity_type: activityType,
        movie_id: movieId,
        movie_type: movieType,
        target_user_id: targetUserId,
        metadata: metadata,
      },
    ]);
  } catch (error) {
    console.error("Error creating activity:", error);
    // Don't throw - activities are non-critical
  }
};

// Get user recommendations
export const getUserRecommendations = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from("user_recommendations")
      .select("*")
      .eq("user_id", userId)
      .order("score", { ascending: false })
      .limit(limit);

    if (error) {
      if (
        error.code === "PGRST116" ||
        error.message.includes("406") ||
        error.message.includes("relation")
      ) {
        return { data: [], error: null };
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Get similar users (users with similar favorites)
export const getSimilarUsers = async (userId, limit = 5) => {
  try {
    // This is a simplified version - in production you'd use more sophisticated algorithms
    const { data: userFavorites } = await supabase
      .from("favorites")
      .select("movie_id, movie_type")
      .eq("user_id", userId);

    if (!userFavorites || userFavorites.length === 0) {
      return { data: [], error: null };
    }

    const favoriteIds = userFavorites.map(
      (f) => `${f.movie_id}-${f.movie_type}`
    );

    // Find users with overlapping favorites
    const { data, error } = await supabase
      .from("favorites")
      .select("user_id, profiles(*)")
      .in(
        "movie_id",
        userFavorites.map((f) => f.movie_id)
      )
      .neq("user_id", userId)
      .limit(limit * 10); // Get more to filter

    if (error) {
      if (
        error.code === "PGRST116" ||
        error.message.includes("406") ||
        error.message.includes("relation")
      ) {
        return { data: [], error: null };
      }
      throw error;
    }

    // Count overlaps and return top users
    const userOverlaps = {};
    data.forEach((fav) => {
      if (!userOverlaps[fav.user_id]) {
        userOverlaps[fav.user_id] = {
          user: fav.profiles,
          count: 0,
        };
      }
      userOverlaps[fav.user_id].count++;
    });

    const similarUsers = Object.values(userOverlaps)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((item) => item.user);

    return { data: similarUsers, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};
