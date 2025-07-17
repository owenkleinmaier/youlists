import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, History, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  usePlaylistContext,
  AdvancedParameters,
} from "../context/PlaylistContext";

interface SpotifyUser {
  display_name: string;
  images?: { url: string }[];
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const {
    songCount,
    setSongCount,
    setPlaylistName,
    advancedParameters,
    setAdvancedParameters,
  } = usePlaylistContext();

  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    if (token) {
      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch user data");
          return response.json();
        })
        .then((data) => setUserInfo(data))
        .catch((error) => {
          console.error("Error fetching user data:", error);
          if (error.message.includes("401")) {
            localStorage.removeItem("spotify_token");
            navigate("/");
          }
        });
    } else {
      navigate("/");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("spotify_token");
    navigate("/");
  };

  const updateAdvancedParameter = (
    param: keyof AdvancedParameters,
    value: any
  ) => {
    setAdvancedParameters({
      ...advancedParameters,
      [param]: value,
    });
  };

  const handleGeneratePlaylist = () => {
    if (!prompt.trim()) {
      return;
    }

    const words = prompt.split(" ");
    const playlistName =
      words.length > 5 ? `${words.slice(0, 5).join(" ")}...` : prompt;
    setPlaylistName(playlistName);

    navigate("/loading", {
      state: {
        prompt,
        songCount,
        advancedParameters,
      },
    });
  };

  return (
    <div className="page">
      <header className="header">
        <h1 className="logo">youlists</h1>

        <div className="header-actions">
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button className="icon-btn" onClick={() => navigate("/history")}>
            <History size={18} />
          </button>

          <button className="icon-btn" onClick={() => navigate("/settings")}>
            <Settings size={18} />
          </button>

          <div className="user-menu">
            <button
              className="user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {userInfo?.images?.[0]?.url ? (
                <img
                  src={userInfo.images[0].url}
                  alt="Profile"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                userInfo?.display_name?.[0]?.toUpperCase() || "U"
              )}
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <span>{userInfo?.display_name?.toLowerCase() || "user"}</span>
                </div>
                <button className="dropdown-item" onClick={handleLogout}>
                  logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <h2 className="hero-title">describe your perfect playlist</h2>
          <p className="hero-subtitle">
            tell us what you're looking for and we'll create it
          </p>
        </div>

        <div className="playlist-form">
          <div className="form-group">
            <textarea
              className="prompt-input"
              placeholder="e.g., upbeat indie rock for studying, chill jazz for a rainy day..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">songs: {songCount}</label>
              <input
                type="range"
                min="5"
                max="50"
                value={songCount}
                onChange={(e) => setSongCount(parseInt(e.target.value))}
                className="range-input"
              />
              <div className="range-labels">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            advanced options {showAdvanced ? "−" : "+"}
          </button>

          {showAdvanced && (
            <div className="advanced-options">
              <div className="form-group">
                <label className="label">include obscure tracks</label>
                <div className="toggle-group">
                  <button
                    type="button"
                    className={`toggle-btn ${
                      advancedParameters.includeObscure ? "active" : ""
                    }`}
                    onClick={() =>
                      updateAdvancedParameter("includeObscure", true)
                    }
                  >
                    yes
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${
                      !advancedParameters.includeObscure ? "active" : ""
                    }`}
                    onClick={() =>
                      updateAdvancedParameter("includeObscure", false)
                    }
                  >
                    no
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="label">
                  energy level: {advancedParameters.energyLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={advancedParameters.energyLevel}
                  onChange={(e) =>
                    updateAdvancedParameter(
                      "energyLevel",
                      parseInt(e.target.value)
                    )
                  }
                  className="range-input"
                />
                <div className="range-labels">
                  <span>chill</span>
                  <span>energetic</span>
                </div>
              </div>

              <div className="form-group">
                <label className="label">
                  tempo: {advancedParameters.tempo}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={advancedParameters.tempo}
                  onChange={(e) =>
                    updateAdvancedParameter("tempo", parseInt(e.target.value))
                  }
                  className="range-input"
                />
                <div className="range-labels">
                  <span>slow</span>
                  <span>fast</span>
                </div>
              </div>

              <div className="form-group">
                <label className="label">
                  artist diversity: {advancedParameters.diversity}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={advancedParameters.diversity}
                  onChange={(e) =>
                    updateAdvancedParameter(
                      "diversity",
                      parseInt(e.target.value)
                    )
                  }
                  className="range-input"
                />
                <div className="range-labels">
                  <span>similar</span>
                  <span>varied</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            className="generate-btn"
            disabled={!prompt.trim()}
            onClick={handleGeneratePlaylist}
          >
            generate playlist
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
