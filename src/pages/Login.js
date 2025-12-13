import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signIn, signUp } from "../services/authService";
import "./Auth.css";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError("Username is required");
          setLoading(false);
          return;
        }
        const { data, error: signUpError } = await signUp(
          email,
          password,
          username
        );
        if (signUpError) {
          setError(signUpError);
        } else {
          // Show success message for email confirmation
          setSuccess(
            "Account created! Please check your email to confirm your account before signing in."
          );
          setError("");
          // Clear form
          setEmail("");
          setPassword("");
          setUsername("");
          // Switch to sign in after 3 seconds
          setTimeout(() => {
            setIsSignUp(false);
            setSuccess("");
          }, 3000);
        }
      } else {
        const { data, error: signInError } = await signIn(email, password);
        if (signInError) {
          // Check if error is about unconfirmed email
          if (
            signInError.includes("email") &&
            signInError.includes("confirm")
          ) {
            setError(
              "Please confirm your email address before signing in. Check your inbox for the confirmation link."
            );
          } else {
            setError(signInError);
          }
        } else {
          navigate("/");
          window.location.reload();
        }
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{isSignUp ? "Sign Up" : "Sign In"}</h1>
        <p className="auth-subtitle">
          {isSignUp
            ? "Create your account to save favorites"
            : "Welcome back to LB Movies"}
        </p>

        {error && <div className="auth-error">{error}</div>}

        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="link-button"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
