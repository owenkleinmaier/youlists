import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-6">YouLists 🎶</h1>
      <p className="text-lg text-gray-300 mb-6">
        AI-generated playlists based on your vibe.
      </p>

      <button
        onClick={() => navigate("/playlist")}
        className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-bold text-lg"
      >
        Generate Playlist 🚀
      </button>
    </div>
  );
};

export default HomePage;
