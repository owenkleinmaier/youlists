import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePlaylistContext,
  AdvancedParameters,
} from "../context/PlaylistContext";
import { motion } from "motion/react";
import {
  Settings,
  History,
  User,
  Sliders,
  Music,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import Button from "./Button";
import { useTheme } from "../context/ThemeContext";

interface SpotifyUser {
  display_name: string;
  images?: { url: string }[];
}


// Predefined suggestions for different categories
const suggestions = {
  vibe: [
    "Chill",
    "Energetic",
    "Melancholic",
    "Upbeat",
    "Relaxing",
    "Motivational",
  ],
  activity: [
    "Workout",
    "Study",
    "Roadtrip",
    "Party",
    "Coding",
    "Cooking",
    "Meditation",
  ],
  genre: [
    "Hip-Hop",
    "Rock",
    "Pop",
    "Jazz",
    "Classical",
    "Electronic",
    "R&B",
    "Folk",
    "Metal",
  ],
  era: ["60s", "70s", "80s", "90s", "2000s", "2010s", "2020s"],
  mood: [
    "Happy",
    "Sad",
    "Angry",
    "Nostalgic",
    "Romantic",
    "Peaceful",
    "Excited",
  ],
  location: [
    "Beach",
    "Mountains",
    "City",
    "Desert",
    "Countryside",
    "Jungle",
    "Ocean",
  ],
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    songCount,
    setSongCount,
    setPlaylistName,
    advancedParameters,
    setAdvancedParameters,
  } = usePlaylistContext();
  const { theme, colors, toggleTheme } = useTheme();
  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showLogout, setShowLogout] = useState(false);
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
          // If token is invalid, redirect to login
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

  const addSuggestion = (suggestion: string) => {
    if (prompt) {
      setPrompt((prev) => `${prev}, ${suggestion}`);
    } else {
      setPrompt(suggestion);
    }
  };

  const handleGeneratePlaylist = () => {
    if (!prompt.trim()) {
      alert("Please enter a description for your playlist");
      return;
    }

    // Generate a playlist name based on the prompt
    const words = prompt.split(" ");
    const playlistName =
      words.length > 5 ? `${words.slice(0, 5).join(" ")}...` : prompt;
    setPlaylistName(playlistName);

    // Pass all parameters through the navigation state
    navigate("/loading", {
      state: {
        prompt,
        songCount,
        advancedParameters,
      },
    });
  };

  return (
    <div 
      className="min-h-screen flex flex-col transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${colors.bg.primary} 0%, ${colors.bg.secondary} 50%, ${colors.bg.tertiary} 100%)`,
        color: colors.text.primary
      }}
    >
      {/* Header */}
      <header 
        className="p-4 flex justify-between items-center border-b backdrop-blur-md sticky top-0 z-10 transition-all duration-300"
        style={{
          backgroundColor: `${colors.bg.elevated}95`,
          borderColor: colors.border.primary,
          boxShadow: `0 8px 32px ${colors.bg.overlay}20`
        }}
      >
        <div className="flex items-center gap-2">
          <Music size={24} style={{ color: colors.brand.primary }} />
          <h1 
            className="text-2xl font-bold bg-clip-text"
            style={{
              background: `linear-gradient(to right, ${colors.brand.primary}, ${colors.brand.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            YouLists
          </h1>
        </div>

        <div className="flex gap-3">
          {/* Theme toggle button */}
          <Button
            onClick={toggleTheme}
            variant="icon"
            size="md"
            icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            tooltip={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          />

          <Button
            onClick={() => navigate("/history")}
            variant="icon"
            size="md"
            icon={<History size={18} />}
            tooltip="View history"
          />

          <Button
            onClick={() => navigate("/settings")}
            variant="icon"
            size="md"
            icon={<Settings size={18} />}
            tooltip="Settings"
          />

          {userInfo && (
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer p-1 rounded-full transition-colors"
                style={{
                  backgroundColor: showLogout ? colors.interactive.active : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!showLogout) e.currentTarget.style.backgroundColor = colors.interactive.hover;
                }}
                onMouseLeave={(e) => {
                  if (!showLogout) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={() => setShowLogout(!showLogout)}
              >
                <img
                  src={userInfo.images?.[0]?.url || "/api/placeholder/40/40"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border"
                  style={{ borderColor: colors.border.secondary }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/placeholder/40/40"; // Fallback image
                  }}
                />
                <span 
                  className="text-sm hidden md:inline"
                  style={{ color: colors.text.primary }}
                >
                  {userInfo.display_name}
                </span>
              </div>

              {showLogout && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl overflow-hidden z-10 border"
                  style={{
                    backgroundColor: colors.bg.elevated,
                    borderColor: colors.border.primary,
                    boxShadow: `0 8px 32px ${colors.bg.overlay}40`
                  }}
                >
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="md"
                    fullWidth
                    className="justify-start"
                    icon={<User size={16} />}
                  >
                    Logout
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="space-y-8">
          {/* Hero Section */}
          <section className="text-center space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold"
            >
              Create Your Perfect Playlist
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto"
              style={{ color: colors.text.secondary }}
            >
              Describe your ideal music and our AI will curate the perfect
              tracklist for you.
            </motion.p>
          </section>

          {/* Input Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-xl p-6 shadow-lg border backdrop-blur-sm transition-all duration-300"
            style={{
              backgroundColor: `${colors.bg.elevated}60`,
              borderColor: colors.border.primary,
              boxShadow: `0 8px 32px ${colors.bg.overlay}20`
            }}
          >
            <div className="space-y-6">
              {/* Prompt input */}
              <div>
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text.secondary }}
                >
                  Describe your playlist
                </label>
                <textarea
                  className="w-full border rounded-lg p-4 shadow-inner transition-all duration-200 focus:ring-2 focus:border-transparent"
                  style={{
                    backgroundColor: colors.bg.tertiary,
                    borderColor: colors.border.secondary,
                    color: colors.text.primary
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.border.focus;
                    e.target.style.boxShadow = `0 0 0 2px ${colors.border.focus}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border.secondary;
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="e.g., 'Upbeat 80s rock songs for a roadtrip through California'"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Suggestion chips */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span 
                    className="text-sm font-medium mr-1"
                    style={{ color: colors.text.tertiary }}
                  >
                    Vibe:
                  </span>
                  {suggestions.vibe.map((suggestion) => (
                    <Button
                      key={suggestion}
                      onClick={() => addSuggestion(suggestion)}
                      variant="secondary"
                      size="sm"
                      className="rounded-full text-sm shadow-sm"
                      tooltip={`Add "${suggestion}" to your prompt`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span 
                    className="text-sm font-medium mr-1"
                    style={{ color: colors.text.tertiary }}
                  >
                    Activity:
                  </span>
                  {suggestions.activity.map((suggestion) => (
                    <Button
                      key={suggestion}
                      onClick={() => addSuggestion(suggestion)}
                      variant="secondary"
                      size="sm"
                      className="rounded-full text-sm shadow-sm"
                      tooltip={`Add "${suggestion}" to your prompt`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span 
                    className="text-sm font-medium mr-1"
                    style={{ color: colors.text.tertiary }}
                  >
                    Genre:
                  </span>
                  {suggestions.genre.map((suggestion) => (
                    <Button
                      key={suggestion}
                      onClick={() => addSuggestion(suggestion)}
                      variant="secondary"
                      size="sm"
                      className="rounded-full text-sm shadow-sm"
                      tooltip={`Add "${suggestion}" to your prompt`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span 
                    className="text-sm font-medium mr-1"
                    style={{ color: colors.text.tertiary }}
                  >
                    Era:
                  </span>
                  {suggestions.era.map((suggestion) => (
                    <Button
                      key={suggestion}
                      onClick={() => addSuggestion(suggestion)}
                      variant="secondary"
                      size="sm"
                      className="rounded-full text-sm shadow-sm"
                      tooltip={`Add "${suggestion}" to your prompt`}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Number of songs slider */}
              <div 
                className="mt-8 pt-6 border-t"
                style={{ borderColor: `${colors.border.secondary}50` }}
              >
                <label 
                  className="block text-sm font-medium mb-2 flex justify-between"
                  style={{ color: colors.text.secondary }}
                >
                  <span>Number of songs</span>
                  <span 
                    className="font-bold"
                    style={{ color: colors.brand.primary }}
                  >
                    {songCount}
                  </span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={songCount}
                  onChange={(e) => setSongCount(parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                  style={{
                    backgroundColor: colors.bg.tertiary,
                    accentColor: colors.brand.primary,
                  }}
                />
                <div 
                  className="flex justify-between text-xs mt-1"
                  style={{ color: colors.text.tertiary }}
                >
                  <span>5</span>
                  <span>30</span>
                </div>
              </div>

              {/* Advanced options */}
              <div>
                <Button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  variant="ghost"
                  size="md"
                  icon={<Sliders size={16} />}
                  iconPosition="left"
                  tooltip="Toggle advanced options"
                  className="justify-start"
                >
                  <span>Advanced Options</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-4 p-4 rounded-lg border transition-all duration-300"
                    style={{
                      backgroundColor: `${colors.bg.tertiary}50`,
                      borderColor: colors.border.secondary
                    }}
                  >
                    <div>
                      <label 
                        className="block text-sm font-medium mb-2 flex justify-between"
                        style={{ color: colors.text.secondary }}
                      >
                        <span>Include obscure tracks</span>
                        <span
                          style={{
                            color: advancedParameters.includeObscure
                              ? colors.status.success
                              : colors.text.tertiary
                          }}
                        >
                          {advancedParameters.includeObscure ? "Yes" : "No"}
                        </span>
                      </label>
                      <div className="flex gap-4">
                        <Button
                          onClick={() =>
                            updateAdvancedParameter("includeObscure", true)
                          }
                          variant={advancedParameters.includeObscure ? "primary" : "secondary"}
                          size="md"
                          tooltip="Include less popular tracks"
                        >
                          Yes
                        </Button>
                        <Button
                          onClick={() =>
                            updateAdvancedParameter("includeObscure", false)
                          }
                          variant={!advancedParameters.includeObscure ? "primary" : "secondary"}
                          size="md"
                          tooltip="Stick to popular tracks"
                        >
                          No
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium mb-2 flex justify-between"
                        style={{ color: colors.text.secondary }}
                      >
                        <span>Energy level</span>
                        <span 
                          className="font-bold"
                          style={{ color: colors.brand.primary }}
                        >
                          {advancedParameters.energyLevel}/10
                        </span>
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
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          accentColor: colors.brand.primary,
                        }}
                      />
                      <div 
                        className="flex justify-between text-xs mt-1"
                        style={{ color: colors.text.tertiary }}
                      >
                        <span>Chill</span>
                        <span>Energetic</span>
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium mb-2 flex justify-between"
                        style={{ color: colors.text.secondary }}
                      >
                        <span>Tempo</span>
                        <span 
                          className="font-bold"
                          style={{ color: colors.brand.primary }}
                        >
                          {advancedParameters.tempo}/10
                        </span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={advancedParameters.tempo}
                        onChange={(e) =>
                          updateAdvancedParameter(
                            "tempo",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          accentColor: colors.brand.primary,
                        }}
                      />
                      <div 
                        className="flex justify-between text-xs mt-1"
                        style={{ color: colors.text.tertiary }}
                      >
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                    </div>

                    <div>
                      <label 
                        className="block text-sm font-medium mb-2 flex justify-between"
                        style={{ color: colors.text.secondary }}
                      >
                        <span>Artist diversity</span>
                        <span 
                          className="font-bold"
                          style={{ color: colors.brand.primary }}
                        >
                          {advancedParameters.diversity}/10
                        </span>
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
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                        style={{
                          backgroundColor: colors.bg.secondary,
                          accentColor: colors.brand.primary,
                        }}
                      />
                      <div 
                        className="flex justify-between text-xs mt-1"
                        style={{ color: colors.text.tertiary }}
                      >
                        <span>Similar artists</span>
                        <span>Varied artists</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Generate Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Button
              onClick={handleGeneratePlaylist}
              disabled={!prompt.trim()}
              variant="primary"
              size="xl"
              fullWidth
              className="text-lg font-bold shadow-lg"
              tooltip={!prompt.trim() ? "Enter a description to generate playlist" : "Create your AI-powered playlist"}
              animate={true}
            >
              Generate Your Playlist
            </Button>
          </motion.div>

          {/* Information Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"
          >
            <div
              className="p-5 rounded-xl border backdrop-blur-sm transition-all duration-300"
              style={{
                backgroundColor: `${colors.bg.elevated}60`,
                borderColor: colors.border.primary,
                boxShadow: `0 8px 32px ${colors.bg.overlay}20`
              }}
            >
              <h3 
                className="font-bold mb-2"
                style={{ color: colors.text.primary }}
              >
                1. Describe Your Vibe
              </h3>
              <p 
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                Tell us what you're looking for - mood, genre, era, or activity.
                Be as specific as you want.
              </p>
            </div>

            <div
              className="p-5 rounded-xl border backdrop-blur-sm transition-all duration-300"
              style={{
                backgroundColor: `${colors.bg.elevated}60`,
                borderColor: colors.border.primary,
                boxShadow: `0 8px 32px ${colors.bg.overlay}20`
              }}
            >
              <h3 
                className="font-bold mb-2"
                style={{ color: colors.text.primary }}
              >
                2. Customize
              </h3>
              <p 
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                Choose how many songs you want and adjust advanced settings to
                get exactly what you need.
              </p>
            </div>

            <div
              className="p-5 rounded-xl border backdrop-blur-sm transition-all duration-300"
              style={{
                backgroundColor: `${colors.bg.elevated}60`,
                borderColor: colors.border.primary,
                boxShadow: `0 8px 32px ${colors.bg.overlay}20`
              }}
            >
              <h3 
                className="font-bold mb-2"
                style={{ color: colors.text.primary }}
              >
                3. Export & Enjoy
              </h3>
              <p 
                className="text-sm"
                style={{ color: colors.text.secondary }}
              >
                Send your AI-generated playlist directly to your Spotify account
                with one click.
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
