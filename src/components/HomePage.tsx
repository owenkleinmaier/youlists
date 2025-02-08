import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import { useAI } from "../actions/useAI";
import { motion } from "framer-motion";
import ExportToSpotify from "./ExportToSpotify";

const filterOptions = [
  "Weather",
  "Month",
  "Season",
  "Mood",
  "Location",
  "Setting",
  "Biome",
  "Time of Day",
  "Genre",
  "Decade",
  "Year",
  "Instrument",
];

interface SpotifyUser {
  display_name: string;
  images?: { url: string }[];
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [filters, setFilters] = useState(
    filterOptions.map((option) => ({ type: option, value: "" }))
  );
  const [customFilter, setCustomFilter] = useState("");
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    if (token) {
      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => setUserInfo(data))
        .catch((error) => console.error("Error fetching user data:", error));
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("spotify_token");
    navigate("/");
  };

  const handleFilterChange = (index: number, value: string) => {
    const updatedFilters = [...filters];
    updatedFilters[index].value = value;
    setFilters(updatedFilters);
  };

  const handleGeneratePlaylist = () => {
    const prompt = filters
      .filter((f) => f.value.trim() !== "")
      .map((f) => `${f.type}: ${f.value}`)
      .join(", ");

    const fullPrompt = customFilter
      ? `${prompt}, Custom: ${customFilter}`
      : prompt;

    navigate("/loading", { state: { prompt: fullPrompt } });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="absolute top-6 left-6 text-xl font-bold">YouLists.</h1>

      {userInfo && (
        <div className="absolute top-6 right-6 flex flex-col items-end">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowLogout(!showLogout)}
          >
            <span className="text-lg">{userInfo.display_name}</span>
            <img
              src={
                userInfo.images?.[0]?.url || "https://via.placeholder.com/50"
              }
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>
          {showLogout && (
            <div className="bg-gray-800 p-4 mt-2 rounded-lg shadow-lg">
              <button
                onClick={handleLogout}
                className="text-white px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
        {filters.map((filter, index) => (
          <div key={index} className="flex flex-col items-start">
            <span className="text-sm text-gray-300">{filter.type}</span>
            <input
              type="text"
              className="bg-gray-700 text-white px-3 py-1 rounded-md mt-1 w-full"
              placeholder={`Enter ${filter.type.toLowerCase()}...`}
              value={filter.value}
              onChange={(e) => handleFilterChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 w-full max-w-md flex flex-col">
        <label className="text-sm text-gray-300 mb-1">Custom Filter</label>
        <input
          type="text"
          className="bg-gray-700 text-white px-4 py-2 rounded-lg"
          placeholder="Enter anything..."
          value={customFilter}
          onChange={(e) => setCustomFilter(e.target.value)}
        />
      </div>

      <button
        onClick={handleGeneratePlaylist}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-lg shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
      >
        Generate YouList!
      </button>
    </div>
  );
};

const loadingPhrases = [
  "Creating a vibe...",
  "Curating your perfect mix...",
  "Finding your musical soul...",
  "Generating the ultimate playlist...",
  "Bringing your tunes to life...",
];

export const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { generatePlaylist } = useAI();
  const { prompt } = location.state || {};
  const [phrase, setPhrase] = useState(loadingPhrases[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Shuffle loading phrases every 1.5 seconds
    const interval = setInterval(() => {
      setPhrase(
        loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]
      );
    }, 1500);

    // Ensure generatePlaylist is only called ONCE
    const fetchPlaylist = async () => {
      if (!isGenerating) {
        setIsGenerating(true);
        const generatedPlaylist = await generatePlaylist(prompt);
        navigate("/playlist", { state: { playlistData: generatedPlaylist } });
      }
    };

    fetchPlaylist();

    return () => {
      clearInterval(interval);
    };
  }, [navigate, generatePlaylist, prompt, isGenerating]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <motion.div
        className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1 }}
      ></motion.div>
      <p className="mt-4 text-lg">{phrase}</p>
    </div>
  );
};

export const PlaylistPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playlistData } = location.state || {}; // Get the data from the location state

  // Ensure playlistData is a valid object and has a "playlist" array
  const playlist = Array.isArray(playlistData?.playlist)
    ? playlistData.playlist
    : [];

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white p-10">
      <button
        onClick={() => navigate("/home")}
        className="absolute top-6 left-6 text-white bg-gray-700 px-4 py-2 rounded-lg"
      >
        ⬅ Back
      </button>
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your AI-Generated Playlist
      </h1>

      {playlist.length > 0 ? (
        <ul className="space-y-4">
          {playlist.map((track: any, index: number) => (
            <li
              key={index}
              className="bg-gray-800 p-4 rounded-lg flex justify-between"
            >
              <span>
                🎵 {track.title} - {track.artist}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-center">
          No playlist found. Try generating a new one.
        </p>
      )}

      {playlist.length > 0 && <ExportToSpotify playlist={playlist} />}
    </div>
  );
};

export default HomePage;
