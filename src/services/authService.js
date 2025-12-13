import { supabase } from "../config/supabase";

// Sign Up
export const signUp = async (email, password, username) => {
  try {
    // Get the current site URL for email confirmation redirect
    const siteUrl = window.location.origin;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/`,
        data: {
          username: username,
        },
      },
    });

    if (error) throw error;

    // Create user profile in database (will be created after email confirmation)
    // We'll handle this in a database trigger or after confirmation

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Sign In
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

// Sign Out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

// Get Current User
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Get User Profile
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      // If table doesn't exist or 406 error, return null data but don't throw
      if (
        error.code === "PGRST116" ||
        error.message.includes("406") ||
        error.message.includes("relation") ||
        error.message.includes("does not exist")
      ) {
        console.warn(
          "Profiles table may not exist yet. Run the SQL setup from SUPABASE_SETUP.md"
        );
        return { data: null, error: null }; // Return null data but no error
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    // Handle 406 Not Acceptable errors gracefully
    if (
      error.message &&
      (error.message.includes("406") ||
        error.message.includes("Not Acceptable"))
    ) {
      console.warn(
        "Profile fetch failed - table may not be set up. Error:",
        error.message
      );
      return { data: null, error: null };
    }
    return { data: null, error: error.message };
  }
};

// Update User Profile (uses upsert to create if doesn't exist)
export const updateProfile = async (userId, updates) => {
  try {
    // Use upsert to insert if doesn't exist, update if exists
    const { data, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      )
      .select()
      .single();

    if (error) {
      // If table doesn't exist, return null without error
      if (
        error.code === "PGRST116" ||
        error.message.includes("406") ||
        error.message.includes("relation") ||
        error.message.includes("does not exist")
      ) {
        console.warn(
          "Profiles table may not exist yet. Run the SQL setup from SUPABASE_SETUP.md"
        );
        return { data: null, error: null };
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    // Handle 406 Not Acceptable errors gracefully
    if (
      error.message &&
      (error.message.includes("406") ||
        error.message.includes("Not Acceptable"))
    ) {
      console.warn(
        "Profile update failed - table may not be set up. Error:",
        error.message
      );
      return { data: null, error: null };
    }
    return { data: null, error: error.message };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
