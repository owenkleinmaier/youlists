import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaylistHistory } from "../actions/usePlaylistHistory";
import { usePlaylistContext } from "../context/PlaylistContext";
import { ArrowLeft, Clock, Trash2, Play } from "lucide-react";
import { motion } from "motion/react";

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { history } = usePlaylistHistory();
  const { setCurrentPlaylist, setPlaylistName } = usePlaylistContext();
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(
    null
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  const loadPlaylist = (playlist: any) => {
    setCurrentPlaylist(playlist.tracks);
    setPlaylistName(playlist.name);
    navigate("/playlist");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-black/60 border-b border-gray-800">
        <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock size={24} />
            Playlist History
          </h1>
          <p className="text-gray-400 mt-1">
            Your previously generated playlists
          </p>
        </div>

        {Array.isArray(history) && history.length > 0 ? (
          <div className="space-y-4">
            {history.map((playlist, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800/50 rounded-xl overflow-hidden"
              >
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">{playlist.name}</h3>
                    <p className="text-sm text-gray-400">
                      {playlist.tracks?.length || 0} tracks • Created{" "}
                      {playlist.createdAt
                        ? formatDate(playlist.createdAt)
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {deleteConfirmIndex === index ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">Confirm?</span>
                        <button
                          onClick={() => {
                            // Implement delete functionality here
                            setDeleteConfirmIndex(null);
                          }}
                          className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmIndex(null)}
                          className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => loadPlaylist(playlist)}
                          className="p-2 rounded-lg bg-green-600 hover:bg-green-700"
                          title="Load playlist"
                        >
                          <Play size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmIndex(index)}
                          className="p-2 rounded-lg hover:bg-gray-700"
                          title="Delete playlist"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {/* Preview of tracks */}
                <div className="px-4 pb-4">
                  <div className="text-sm text-gray-400 mb-2">Preview:</div>
                  <div className="text-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                    {playlist.tracks
                      ?.slice(0, 6)
                      .map((track: any, i: number) => (
                        <div key={i} className="truncate">
                          {track.title} -{" "}
                          <span className="text-gray-400">{track.artist}</span>
                        </div>
                      ))}
                    {playlist.tracks && playlist.tracks.length > 6 && (
                      <div className="text-gray-500">
                        +{playlist.tracks.length - 6} more...
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 bg-gray-800/30 rounded-xl">
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>Your playlist history is empty.</p>
            <button
              onClick={() => navigate("/home")}
              className="mt-4 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Your First Playlist
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
