import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Volume2,
  Users,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
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
  const { setPlaylistName, setSongCount, setAdvancedParameters } =
    usePlaylistContext();
  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [songCount, setLocalSongCount] = useState(15);
  const [showObscureTracks, setShowObscureTracks] = useState(true);
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

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "bg-gradient-to-b from-gray-900 to-black text-white"
          : "bg-gradient-to-b from-gray-100 to-white text-gray-900"
      }`}
    >
      <header className="sticky top-0 z-10 backdrop-blur-md bg-black/60 border-b border-gray-800">
        <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon size={24} />
            Settings
          </h1>
          <p className="text-gray-400 mt-1">
            Customize your YouLists experience
          </p>
        </div>
        {userInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  userInfo.images?.[0]?.url || "https://via.placeholder.com/100"
                }
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {userInfo.display_name}
                </h2>
                {userInfo.email && (
                  <p className="text-gray-400">{userInfo.email}</p>
                )}
                <div className="flex gap-2 mt-1">
                  {userInfo.product && (
                    <span className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">
                      {userInfo.product === "premium"
                        ? "Spotify Premium"
                        : "Spotify Free"}
                    </span>
                  )}
                  {userInfo.country && (
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                      {userInfo.country}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium"
            >
              Log Out
            </button>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Theme Setting */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                <div>
                  <h3 className="font-medium">Theme</h3>
                  <p className="text-sm">Choose your preferred app theme</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700"
              >
                <span
                  className={`${
                    darkMode
                      ? "translate-x-6 bg-blue-500"
                      : "translate-x-1 bg-gray-400"
                  } inline-block h-4 w-4 rounded-full transition-transform`}
                />
              </button>
            </div>
          </div>
          {/* Default Song Count */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Volume2 size={20} />
                <div>
                  <h3 className="font-medium">Default Playlist Length</h3>
                  <p className="text-sm">
                    Number of songs to generate by default
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between mb-1">
                  <span>{songCount} songs</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={songCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value);
                    setLocalSongCount(count);
                    setSongCount(count);
                  }}
                  className="w-full h-2 bg-gray-700 rounded-lg"
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>
            </div>
          </div>
          {/* Obscure Tracks Setting */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Users size={20} />
                <div>
                  <h3 className="font-medium">Include Obscure Tracks</h3>
                  <p className="text-sm">
                    Mix in lesser-known songs alongside popular ones
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowObscureTracks(!showObscureTracks)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-700"
              >
                <span
                  className={`${
                    showObscureTracks
                      ? "translate-x-6 bg-blue-500"
                      : "translate-x-1 bg-gray-400"
                  } inline-block h-4 w-4 rounded-full transition-transform`}
                />
              </button>
            </div>
          </div>
          {/* Privacy */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock size={20} />
              <div>
                <h3 className="font-medium">Privacy</h3>
                <p className="text-sm">Manage your data and privacy settings</p>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full text-left py-2 px-4 hover:bg-gray-700 rounded-lg">
                Clear Playlist History
              </button>
              <button className="w-full text-left py-2 px-4 hover:bg-gray-700 rounded-lg">
                Privacy Policy
              </button>
              <button className="w-full text-left py-2 px-4 hover:bg-gray-700 rounded-lg">
                Terms of Service
              </button>
            </div>
          </div>
          {/* About */}
          <div className="bg-gray-800/50 rounded-xl p-6">
            <h3 className="font-medium mb-2">About YouLists</h3>
            <p className="text-sm">Version 2.0.0</p>
            <p className="text-sm mt-2">
              Created with ❤️ for music lovers. YouLists uses AI to create
              personalized playlists.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SettingsPage;
