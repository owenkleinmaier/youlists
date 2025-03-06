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
} from "lucide-react";

interface SpotifyUser {
  display_name: string;
  images?: { url: string }[];
}

// Theme definitions
const themes = {
  default: {
    name: "Default",
    bg: "bg-gradient-to-b from-gray-900 to-black",
    card: "bg-gray-800/50",
    button: "bg-gradient-to-r from-green-500 to-blue-500",
    accent: "text-blue-400",
    border: "border-gray-700",
  },
  purple: {
    name: "Purple",
    bg: "bg-gradient-to-b from-purple-900 to-black",
    card: "bg-purple-900/40",
    button: "bg-gradient-to-r from-purple-500 to-pink-500",
    accent: "text-purple-400",
    border: "border-purple-800/50",
  },
  sunset: {
    name: "Sunset",
    bg: "bg-gradient-to-b from-orange-800 via-red-700 to-gray-900",
    card: "bg-red-900/30",
    button: "bg-gradient-to-r from-orange-500 to-red-500",
    accent: "text-orange-400",
    border: "border-red-800/50",
  },
  ocean: {
    name: "Ocean",
    bg: "bg-gradient-to-b from-blue-800 via-blue-900 to-black",
    card: "bg-blue-900/40",
    button: "bg-gradient-to-r from-cyan-500 to-blue-600",
    accent: "text-cyan-400",
    border: "border-blue-800/50",
  },
  forest: {
    name: "Forest",
    bg: "bg-gradient-to-b from-green-800 via-green-900 to-black",
    card: "bg-green-900/40",
    button: "bg-gradient-to-r from-green-600 to-emerald-600",
    accent: "text-emerald-400",
    border: "border-green-800/50",
  },
};

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
  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);
  const [prompt, setPrompt] = useState("");
  const [showLogout, setShowLogout] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("default");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const token = localStorage.getItem("spotify_token");

  const currentTheme = themes[selectedTheme as keyof typeof themes];

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
    <div className={`min-h-screen flex flex-col ${currentTheme.bg} text-white`}>
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-gray-800/50 backdrop-blur-md bg-black/30 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Music className={currentTheme.accent} size={24} />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            YouLists
          </h1>
        </div>

        <div className="flex gap-3">
          {/* Theme selector */}
          <div className="relative">
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-800/70 transition-colors flex items-center gap-1"
              aria-label="Change theme"
            >
              <Sun size={18} />
              <ChevronDown size={14} />
            </button>

            {themeMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-36 bg-gray-800 rounded-lg shadow-xl overflow-hidden z-10 border border-gray-700"
              >
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedTheme(key);
                      setThemeMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-700 flex items-center gap-2 transition-colors ${
                      selectedTheme === key ? "bg-gray-700/70" : ""
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{
                        background:
                          key === "default"
                            ? "linear-gradient(to right, #10b981, #3b82f6)"
                            : key === "purple"
                            ? "linear-gradient(to right, #8b5cf6, #ec4899)"
                            : key === "sunset"
                            ? "linear-gradient(to right, #f97316, #ef4444)"
                            : key === "ocean"
                            ? "linear-gradient(to right, #06b6d4, #2563eb)"
                            : "linear-gradient(to right, #16a34a, #059669)",
                      }}
                    />
                    <span>{theme.name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <button
            onClick={() => navigate("/history")}
            className="p-2 rounded-full hover:bg-gray-800/70 transition-colors"
            aria-label="View history"
          >
            <History size={18} />
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-full hover:bg-gray-800/70 transition-colors"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>

          {userInfo && (
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-800/70 transition-colors"
                onClick={() => setShowLogout(!showLogout)}
              >
                <img
                  src={userInfo.images?.[0]?.url || "/api/placeholder/40/40"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border border-gray-600"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/api/placeholder/40/40"; // Fallback image
                  }}
                />
                <span className="text-sm hidden md:inline">
                  {userInfo.display_name}
                </span>
              </div>

              {showLogout && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl overflow-hidden z-10 border border-gray-700"
                >
                  <button
                    onClick={handleLogout}
                    className="w-full text-left p-3 hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <User size={16} />
                    <span>Logout</span>
                  </button>
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
              className="text-gray-300 max-w-2xl mx-auto"
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
            className={`${currentTheme.card} rounded-xl p-6 shadow-lg border ${currentTheme.border}`}
          >
            <div className="space-y-6">
              {/* Prompt input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe your playlist
                </label>
                <textarea
                  className="w-full bg-gray-700/70 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-inner"
                  placeholder="e.g., 'Upbeat 80s rock songs for a roadtrip through California'"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Suggestion chips */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-400 mr-1">
                    Vibe:
                  </span>
                  {suggestions.vibe.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => addSuggestion(suggestion)}
                      className="px-3 py-1 bg-gray-700/80 hover:bg-gray-600 rounded-full text-sm transition-colors shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-400 mr-1">
                    Activity:
                  </span>
                  {suggestions.activity.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => addSuggestion(suggestion)}
                      className="px-3 py-1 bg-gray-700/80 hover:bg-gray-600 rounded-full text-sm transition-colors shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-400 mr-1">
                    Genre:
                  </span>
                  {suggestions.genre.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => addSuggestion(suggestion)}
                      className="px-3 py-1 bg-gray-700/80 hover:bg-gray-600 rounded-full text-sm transition-colors shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-400 mr-1">
                    Era:
                  </span>
                  {suggestions.era.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => addSuggestion(suggestion)}
                      className="px-3 py-1 bg-gray-700/80 hover:bg-gray-600 rounded-full text-sm transition-colors shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of songs slider */}
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <label className="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
                  <span>Number of songs</span>
                  <span className={`${currentTheme.accent} font-bold`}>
                    {songCount}
                  </span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={songCount}
                  onChange={(e) => setSongCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor:
                      currentTheme === themes.default
                        ? "#3b82f6"
                        : currentTheme === themes.purple
                        ? "#8b5cf6"
                        : currentTheme === themes.sunset
                        ? "#f97316"
                        : currentTheme === themes.ocean
                        ? "#06b6d4"
                        : "#10b981",
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5</span>
                  <span>30</span>
                </div>
              </div>

              {/* Advanced options */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Sliders size={16} />
                  <span>Advanced Options</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 space-y-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
                        <span>Include obscure tracks</span>
                        <span
                          className={
                            advancedParameters.includeObscure
                              ? "text-green-400"
                              : "text-gray-400"
                          }
                        >
                          {advancedParameters.includeObscure ? "Yes" : "No"}
                        </span>
                      </label>
                      <div className="flex gap-4">
                        <button
                          onClick={() =>
                            updateAdvancedParameter("includeObscure", true)
                          }
                          className={`px-4 py-2 rounded-lg ${
                            advancedParameters.includeObscure
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-gray-300"
                          } transition-colors`}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() =>
                            updateAdvancedParameter("includeObscure", false)
                          }
                          className={`px-4 py-2 rounded-lg ${
                            !advancedParameters.includeObscure
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-gray-300"
                          } transition-colors`}
                        >
                          No
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
                        <span>Energy level</span>
                        <span className={`${currentTheme.accent} font-bold`}>
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
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        style={{
                          accentColor:
                            currentTheme === themes.default
                              ? "#3b82f6"
                              : currentTheme === themes.purple
                              ? "#8b5cf6"
                              : currentTheme === themes.sunset
                              ? "#f97316"
                              : currentTheme === themes.ocean
                              ? "#06b6d4"
                              : "#10b981",
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Chill</span>
                        <span>Energetic</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
                        <span>Tempo</span>
                        <span className={`${currentTheme.accent} font-bold`}>
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
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        style={{
                          accentColor:
                            currentTheme === themes.default
                              ? "#3b82f6"
                              : currentTheme === themes.purple
                              ? "#8b5cf6"
                              : currentTheme === themes.sunset
                              ? "#f97316"
                              : currentTheme === themes.ocean
                              ? "#06b6d4"
                              : "#10b981",
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2 flex justify-between">
                        <span>Artist diversity</span>
                        <span className={`${currentTheme.accent} font-bold`}>
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
                        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        style={{
                          accentColor:
                            currentTheme === themes.default
                              ? "#3b82f6"
                              : currentTheme === themes.purple
                              ? "#8b5cf6"
                              : currentTheme === themes.sunset
                              ? "#f97316"
                              : currentTheme === themes.ocean
                              ? "#06b6d4"
                              : "#10b981",
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
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
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            onClick={handleGeneratePlaylist}
            disabled={!prompt.trim()}
            className={`w-full py-4 ${currentTheme.button} rounded-xl text-lg font-bold transition transform hover:scale-105 hover:shadow-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            Generate Your Playlist
          </motion.button>

          {/* Information Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"
          >
            <div
              className={`${currentTheme.card} p-5 rounded-xl border ${currentTheme.border}`}
            >
              <h3 className="font-bold mb-2">1. Describe Your Vibe</h3>
              <p className="text-sm text-gray-300">
                Tell us what you're looking for - mood, genre, era, or activity.
                Be as specific as you want.
              </p>
            </div>

            <div
              className={`${currentTheme.card} p-5 rounded-xl border ${currentTheme.border}`}
            >
              <h3 className="font-bold mb-2">2. Customize</h3>
              <p className="text-sm text-gray-300">
                Choose how many songs you want and adjust advanced settings to
                get exactly what you need.
              </p>
            </div>

            <div
              className={`${currentTheme.card} p-5 rounded-xl border ${currentTheme.border}`}
            >
              <h3 className="font-bold mb-2">3. Export & Enjoy</h3>
              <p className="text-sm text-gray-300">
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
