import React, { useState } from "react";
import { useAI } from "../actions/useAI";
import ExportToSpotify from "../components/ExportToSpotify";
import { useNavigate } from "react-router-dom";

const PlaylistPage: React.FC = () => {
  const { generatePlaylist } = useAI();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const generatedPlaylist = await generatePlaylist(
      "chill nighttime",
      "winter",
      "60s music"
    );
    if (generatedPlaylist) setPlaylist(generatedPlaylist.playlist);
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white p-10">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-white bg-gray-700 px-4 py-2 rounded-lg"
      >
        ⬅ Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center">
        Your AI-Generated Playlist
      </h1>

      <button
        onClick={handleGenerate}
        className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-bold text-lg"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate New Playlist"}
      </button>

      <div className="mt-6">
        {playlist.length === 0 ? (
          <p className="text-gray-400 text-center">
            Click the button to generate your playlist! 🎵
          </p>
        ) : (
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
        )}
      </div>

      {playlist.length > 0 && <ExportToSpotify playlist={playlist} />}
    </div>
  );
};

export default PlaylistPage;
