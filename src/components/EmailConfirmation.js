import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "../config/supabase";
import "./EmailConfirmation.css";

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from URL hash
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const access_token = hashParams.get("access_token");
        const type = hashParams.get("type");
        const error = hashParams.get("error");
        const error_description = hashParams.get("error_description");

        if (error) {
          if (error === "otp_expired") {
            setStatus("error");
            setMessage(
              "The confirmation link has expired. Please request a new confirmation email from the sign in page."
            );
          } else {
            setStatus("error");
            setMessage(
              error_description ||
                "An error occurred during email confirmation."
            );
          }
          return;
        }

        if (type === "signup" && access_token) {
          // Set the session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token: hashParams.get("refresh_token") || "",
          });

          if (sessionError) {
            setStatus("error");
            setMessage("Failed to confirm email. Please try again.");
            return;
          }

          // Create user profile after successful confirmation
          if (data.user) {
            const { error: profileError } = await supabase
              .from("profiles")
              .insert([
                {
                  id: data.user.id,
                  email: data.user.email,
                  username:
                    data.user.user_metadata?.username ||
                    data.user.email?.split("@")[0],
                  created_at: new Date().toISOString(),
                },
              ]);

            if (profileError && !profileError.message.includes("duplicate")) {
              console.error("Profile creation error:", profileError);
            }
          }

          setStatus("success");
          setMessage("Email confirmed successfully! Redirecting...");

          // Clear URL hash
          window.history.replaceState(null, "", window.location.pathname);

          // Redirect after 2 seconds
          setTimeout(() => {
            navigate("/");
            window.location.reload();
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Invalid confirmation link.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("An error occurred. Please try again.");
        console.error("Email verification error:", err);
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="email-confirmation-container">
      <div className="email-confirmation-card">
        {status === "verifying" && (
          <>
            <div className="loading-spinner">⏳</div>
            <h1>Verifying Email</h1>
            <p>{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="success-icon">✅</div>
            <h1>Email Confirmed!</h1>
            <p>{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="error-icon">❌</div>
            <h1>Confirmation Failed</h1>
            <p>{message}</p>
            <button onClick={() => navigate("/login")} className="retry-button">
              Go to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailConfirmation;
