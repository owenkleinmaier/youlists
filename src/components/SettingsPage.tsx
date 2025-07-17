import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sun, Moon, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { usePlaylistContext } from "../context/PlaylistContext";

interface SpotifyUser {
  display_name: string;
  email?: string;
  images?: { url: string }[];
  country?: string;
  product?: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { songCount, setSongCount } = usePlaylistContext();
  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);
  const [localSongCount, setLocalSongCount] = useState(songCount);
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    if (token) {
      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => setUserInfo(data))
        .catch((error) => console.error("Error fetching user data:", error));
    } else {
      navigate("/");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("spotify_token");
    navigate("/");
  };

  const updateSongCount = (value: number) => {
    setLocalSongCount(value);
    setSongCount(value);
  };

  return (
    <div className="page">
      <header className="header">
        <button className="back-btn" onClick={() => navigate("/home")}>
          <ArrowLeft size={18} />
          back
        </button>

        <div className="header-actions">
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <h2 className="hero-title">settings</h2>
          <p className="hero-subtitle">customize your youlists experience</p>
        </div>

        {/* User Profile */}
        {userInfo && (
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: "6px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              {userInfo.images?.[0]?.url ? (
                <img
                  src={userInfo.images[0].url}
                  alt="Profile"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "18px",
                    fontWeight: "500",
                  }}
                >
                  {userInfo.display_name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "500",
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {userInfo.display_name}
                </h3>
                {userInfo.email && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                    }}
                  >
                    {userInfo.email}
                  </p>
                )}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {userInfo.product && (
                    <span
                      style={{
                        padding: "4px 8px",
                        background: "var(--accent-primary)",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: "500",
                      }}
                    >
                      {userInfo.product === "premium"
                        ? "spotify premium"
                        : "spotify free"}
                    </span>
                  )}
                  {userInfo.country && (
                    <span
                      style={{
                        padding: "4px 8px",
                        background: "var(--bg-tertiary)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "4px",
                        fontSize: "10px",
                      }}
                    >
                      {userInfo.country}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-light)",
                borderRadius: "6px",
                color: "var(--text-secondary)",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "12px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-primary)";
                e.currentTarget.style.color = "var(--accent-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-light)";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <User
                size={14}
                style={{ marginRight: "8px", verticalAlign: "middle" }}
              />
              logout
            </button>
          </div>
        )}

        {/* Settings Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Theme Setting */}
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: "6px",
              padding: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
                <div>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "var(--text-primary)",
                      marginBottom: "2px",
                    }}
                  >
                    theme
                  </h3>
                  <p
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    choose your preferred app theme
                  </p>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                style={{
                  position: "relative",
                  width: "44px",
                  height: "24px",
                  background:
                    theme === "dark"
                      ? "var(--accent-primary)"
                      : "var(--bg-tertiary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: theme === "dark" ? "22px" : "2px",
                    width: "18px",
                    height: "18px",
                    background: "white",
                    borderRadius: "50%",
                    transition: "left 0.2s ease",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Default Song Count */}
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: "6px",
              padding: "20px",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                  marginBottom: "2px",
                }}
              >
                default playlist length
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                number of songs to generate by default
              </p>
            </div>

            <div className="form-group">
              <label className="label" style={{ marginBottom: "8px" }}>
                songs: {localSongCount}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                value={localSongCount}
                onChange={(e) => updateSongCount(parseInt(e.target.value))}
                className="range-input"
              />
              <div className="range-labels">
                <span>5</span>
                <span>50</span>
              </div>
            </div>
          </div>

          {/* About */}
          <div
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: "6px",
              padding: "20px",
            }}
          >
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "500",
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              about youlists
            </h3>
            <p
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
                marginBottom: "8px",
              }}
            >
              version 2.0.0
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              created with ❤️ for music lovers. youlists uses ai to create
              personalized playlists.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
