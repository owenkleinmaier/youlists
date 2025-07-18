// src/components/LoginPage.tsx - Simplified

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Music } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI || window.location.origin;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = [
  "user-read-recently-played",
  "user-top-read",
  "playlist-modify-public",
  "playlist-modify-private",
].join("%20");

const LoginPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get("access_token");
      if (token) {
        window.localStorage.setItem("spotify_token", token);
        setTimeout(() => navigate("/home"), 1000);
      }
    }
    setLoading(false);
  }, [navigate]);

  const loginToSpotify = () => {
    if (CLIENT_ID) {
      window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=${RESPONSE_TYPE}`;
    } else {
      alert(
        "Spotify integration not configured. Please set up your Spotify app credentials."
      );
    }
  };

  const continueWithoutSpotify = () => {
    localStorage.setItem("guest_mode", "true");
    navigate("/home");
  };

  if (loading) {
    return (
      <div className="page">
        <div className="login-container">
          <div className="loading-spinner">
            <Music size={24} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div className="login-container">
        <div className="login-content">
          <h1 className="login-title">youlists</h1>
          <p className="login-subtitle">
            ai-powered playlists for your music taste
          </p>

          <div className="login-options">
            {CLIENT_ID && (
              <button className="spotify-btn" onClick={loginToSpotify}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                connect with spotify
              </button>
            )}

            {CLIENT_ID && <div className="login-divider">or</div>}

            <button className="guest-btn" onClick={continueWithoutSpotify}>
              continue as guest
            </button>
          </div>

          <p className="login-disclaimer">
            no account required • works with any music platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
