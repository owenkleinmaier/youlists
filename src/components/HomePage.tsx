import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, History, Sun, Moon, UserX } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  usePlaylistContext,
  AdvancedParameters,
} from "../context/PlaylistContext";
import CompactImageUpload from "./CompactImageUpload";
import { ProcessedImage } from "../utils/imageUtils";
import Logo from "./Logo";

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
    selectedImage,
    setSelectedImage,
    setLastPrompt,
  } = usePlaylistContext();

  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const token = localStorage.getItem("spotify_token");
  const guestMode = localStorage.getItem("guest_mode");

  useEffect(() => {
    if (guestMode === "true") {
      setIsGuestMode(true);
      return;
    }

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
  }, [token, guestMode, navigate]);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeen) {
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem("hasSeenOnboarding", "true");
  };

  const handleLogout = () => {
    localStorage.removeItem("spotify_token");
    localStorage.removeItem("guest_mode");
    navigate("/");
  };

  const updateAdvancedParameter = (
    param: keyof Omit<AdvancedParameters, "isUsed">,
    value: number | boolean
  ) => {
    setAdvancedParameters({
      ...advancedParameters,
      [param]: value,
      isUsed: showAdvanced || advancedParameters.isUsed,
    });
  };

  const handleAdvancedToggle = () => {
    const newShowAdvanced = !showAdvanced;
    setShowAdvanced(newShowAdvanced);

    if (newShowAdvanced) {
      setAdvancedParameters({
        ...advancedParameters,
        isUsed: true,
      });
    }
  };

  const handleImageSelect = (image: ProcessedImage | null) => {
    setSelectedImage(image);
  };

  const canGenerate = selectedImage !== null || prompt.trim() !== "";

  const handleGeneratePlaylist = useCallback(() => {
    if (!selectedImage && !prompt.trim()) {
      return;
    }

    let playlistName = "ai-generated playlist";
    if (prompt.trim()) {
      const words = prompt.split(" ");
      playlistName =
        words.length > 5 ? `${words.slice(0, 5).join(" ")}...` : prompt;
    }
    setPlaylistName(playlistName);
    setLastPrompt(prompt);

    navigate("/loading", {
      state: {
        prompt,
        songCount,
        advancedParameters,
        selectedImage,
      },
    });
  }, [selectedImage, prompt, songCount, advancedParameters, navigate, setPlaylistName, setLastPrompt]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canGenerate) {
        e.preventDefault();
        handleGeneratePlaylist();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canGenerate, handleGeneratePlaylist]);

  return (
    <div className="page">
      <header className="header">
        <Logo size="sm" />

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
              className={`user-avatar ${isGuestMode ? "guest-avatar" : ""}`}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {isGuestMode ? (
                <UserX size={14} />
              ) : (
                userInfo?.display_name?.[0]?.toLowerCase() || "u"
              )}
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <span>
                    {isGuestMode
                      ? "guest mode"
                      : userInfo?.display_name?.toLowerCase() || "user"}
                  </span>
                </div>
                <button className="dropdown-item" onClick={handleLogout}>
                  {isGuestMode ? "switch to spotify" : "logout"}
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
          {/* Text Prompt Section with Image Upload */}
          <div className="form-group">
            <div className="prompt-input-wrapper">
              <textarea
                className={`prompt-input ${
                  selectedImage ? "with-image-btn" : ""
                }`}
                placeholder={
                  selectedImage
                    ? "describe additional preferences (optional - image will set the main vibe)"
                    : "e.g., upbeat indie rock for studying, chill jazz for a rainy day..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
              />
              <CompactImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                disabled={false}
              />
            </div>
          </div>

          <div
            className={`form-row ${selectedImage ? "with-image-spacing" : ""}`}
          >
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
            onClick={handleAdvancedToggle}
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
            disabled={!canGenerate}
            onClick={handleGeneratePlaylist}
          >
            generate playlist{selectedImage ? " from image" : ""}
          </button>
        </div>

        {showOnboarding && (
          <div className="onboarding-tooltip">
            <span>new: upload an image to set the vibe</span>
            <button className="onboarding-dismiss" onClick={dismissOnboarding}>
              got it
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;
