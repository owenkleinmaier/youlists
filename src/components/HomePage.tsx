import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAI } from "../actions/useAI";
import ExportToSpotify from "../components/ExportToSpotify";

interface SpotifyUser {
  display_name: string;
  images?: { url: string }[];
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);
  const [showLogout, setShowLogout] = useState(false);
  const { generatePlaylist } = useAI();
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

  const handleGeneratePlaylist = async () => {
    navigate("/loading");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white relative">
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
      <div className="bg-green-700 p-10 rounded-2xl shadow-xl w-96 flex flex-col items-center border-2 border-blue-400">
        <button className="bg-gray-900 text-white w-14 h-14 flex items-center justify-center rounded-full mb-6 shadow-md text-2xl">
          +
        </button>
        <button
          onClick={handleGeneratePlaylist}
          className="bg-gray-200 text-black px-6 py-2 rounded-full font-semibold text-lg"
        >
          Generate YouList
        </button>
      </div>
    </div>
  );
};

const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { generatePlaylist } = useAI();
  const [playlistData, setPlaylistData] = useState<any | null>(null);
  const loadingPhrases = [
    "Creating a vibe...",
    "Curating your perfect mix...",
    "Finding your musical soul...",
    "Generating the ultimate playlist...",
    "Bringing your tunes to life...",
  ];
  const [phrase, setPhrase] = useState(
    loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPhrase(
        loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]
      );
    }, 1500);

    const fetchPlaylist = async () => {
      const generatedPlaylist = await generatePlaylist(
        "chill nighttime",
        "winter",
        "60s music"
      );
      setPlaylistData(generatedPlaylist);
      navigate("/playlist", { state: { playlistData: generatedPlaylist } });
    };

    fetchPlaylist();
    return () => clearInterval(interval);
  }, [navigate, generatePlaylist]);

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

const PlaylistPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playlistData } = location.state || {};

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
      {playlistData ? (
        <ul className="space-y-4">
          {playlistData.playlist.map((track: any, index: number) => (
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
      {playlistData && <ExportToSpotify playlist={playlistData.playlist} />}
    </div>
  );
};

export default HomePage;
export { LoadingScreen, PlaylistPage };
