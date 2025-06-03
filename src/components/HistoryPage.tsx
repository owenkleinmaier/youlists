import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlaylistHistory } from "../actions/usePlaylistHistory";
import { usePlaylistContext } from "../context/PlaylistContext";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, Clock, Trash2, Play, Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import Button from "./Button";

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { history } = usePlaylistHistory();
  const { setCurrentPlaylist, setPlaylistName } = usePlaylistContext();
  const { theme, colors, toggleTheme } = useTheme();
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
    <div 
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors.bg.primary}, ${colors.bg.secondary})`,
        color: colors.text.primary
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-10 backdrop-blur-md border-b"
        style={{
          background: `${colors.bg.overlay}60`,
          borderColor: colors.border.primary
        }}
      >
        <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
          <Button
            onClick={() => navigate("/home")}
            variant="ghost"
            size="md"
            icon={<ArrowLeft size={16} />}
            tooltip="Return to home page"
          >
            Back to Home
          </Button>
          <Button
            onClick={toggleTheme}
            variant="icon"
            size="md"
            icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            tooltip={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: colors.text.primary }}
          >
            <Clock size={24} />
            Playlist History
          </h1>
          <p 
            className="mt-1"
            style={{ color: colors.text.secondary }}
          >
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
                className="rounded-xl overflow-hidden backdrop-blur-sm border"
                style={{
                  background: `${colors.bg.elevated}80`,
                  borderColor: colors.border.primary,
                  boxShadow: `0 8px 32px ${colors.bg.overlay}20`
                }}
              >
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h3 
                      className="font-medium text-lg"
                      style={{ color: colors.text.primary }}
                    >
                      {playlist.name}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      {playlist.tracks?.length || 0} tracks • Created{" "}
                      {playlist.createdAt
                        ? formatDate(playlist.createdAt)
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {deleteConfirmIndex === index ? (
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-sm"
                          style={{ color: colors.text.secondary }}
                        >
                          Confirm?
                        </span>
                        <Button
                          onClick={() => {
                            // Implement delete functionality here
                            setDeleteConfirmIndex(null);
                          }}
                          variant="danger"
                          size="sm"
                          tooltip="Confirm deletion"
                        >
                          Yes
                        </Button>
                        <Button
                          onClick={() => setDeleteConfirmIndex(null)}
                          variant="secondary"
                          size="sm"
                          tooltip="Cancel deletion"
                        >
                          No
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => loadPlaylist(playlist)}
                          variant="success"
                          size="md"
                          icon={<Play size={18} />}
                          tooltip="Load playlist"
                        />
                        <Button
                          onClick={() => setDeleteConfirmIndex(index)}
                          variant="ghost"
                          size="md"
                          icon={<Trash2 size={18} />}
                          tooltip="Delete playlist"
                        />
                      </>
                    )}
                  </div>
                </div>
                {/* Preview of tracks */}
                <div className="px-4 pb-4">
                  <div 
                    className="text-sm mb-2"
                    style={{ color: colors.text.secondary }}
                  >
                    Preview:
                  </div>
                  <div className="text-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                    {playlist.tracks
                      ?.slice(0, 6)
                      .map((track: any, i: number) => (
                        <div 
                          key={i} 
                          className="truncate"
                          style={{ color: colors.text.primary }}
                        >
                          {track.title} -{" "}
                          <span style={{ color: colors.text.secondary }}>
                            {track.artist}
                          </span>
                        </div>
                      ))}
                    {playlist.tracks && playlist.tracks.length > 6 && (
                      <div style={{ color: colors.text.tertiary }}>
                        +{playlist.tracks.length - 6} more...
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div 
            className="text-center py-12 rounded-xl backdrop-blur-sm border"
            style={{
              background: `${colors.bg.elevated}50`,
              borderColor: colors.border.primary,
              color: colors.text.secondary
            }}
          >
            <Clock size={48} className="mx-auto mb-4 opacity-50" />
            <p>Your playlist history is empty.</p>
            <Button
              onClick={() => navigate("/home")}
              variant="primary"
              size="lg"
              className="mt-4"
              tooltip="Start creating playlists"
            >
              Create Your First Playlist
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
