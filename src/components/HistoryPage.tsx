import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Play, Sun, Moon } from "lucide-react";
import { usePlaylistHistory } from "../actions/usePlaylistHistory";
import { usePlaylistContext } from "../context/PlaylistContext";
import { useTheme } from "../context/ThemeContext";

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { history, deletePlaylist } = usePlaylistHistory();
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

  const handleDelete = (id: string) => {
    deletePlaylist(id);
    setDeleteConfirmIndex(null);
  };

  return (
    <div className="page">
      <header className="header">
        <button className="back-btn" onClick={() => navigate("/home")}>
          <ArrowLeft size={18} />
          back
        </button>

        <div className="header-actions">
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <h2 className="hero-title">playlist history</h2>
          <p className="hero-subtitle">your previously generated playlists</p>
        </div>

        {Array.isArray(history) && history.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {history.map((playlist, index) => (
              <div
                key={playlist.id}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "6px",
                  padding: "16px",
                  transition: "border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-light)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "var(--text-primary)",
                        marginBottom: "4px",
                      }}
                    >
                      {playlist.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {playlist.tracks?.length || 0} tracks • created{" "}
                      {playlist.createdAt
                        ? formatDate(playlist.createdAt)
                        : "unknown"}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {deleteConfirmIndex === index ? (
                      <>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            marginRight: "8px",
                          }}
                        >
                          confirm?
                        </span>
                        <button
                          onClick={() => handleDelete(playlist.id)}
                          style={{
                            padding: "6px 12px",
                            background: "var(--accent-primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            fontSize: "11px",
                            cursor: "pointer",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirmIndex(null)}
                          className="icon-btn"
                          style={{ padding: "6px 12px", fontSize: "11px" }}
                        >
                          no
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => loadPlaylist(playlist)}
                          style={{
                            background: "var(--accent-primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            padding: "6px 8px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Play size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmIndex(index)}
                          className="icon-btn"
                          style={{ padding: "6px 8px" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Preview tracks */}
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    marginBottom: "8px",
                  }}
                >
                  preview:
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "4px",
                    fontSize: "12px",
                  }}
                >
                  {playlist.tracks?.slice(0, 4).map((track: any, i: number) => (
                    <div
                      key={i}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ color: "var(--text-primary)" }}>
                        {track.title}
                      </span>
                      {" - "}
                      <span style={{ color: "var(--text-secondary)" }}>
                        {track.artist}
                      </span>
                    </div>
                  ))}
                  {playlist.tracks && playlist.tracks.length > 4 && (
                    <div style={{ color: "var(--text-muted)" }}>
                      +{playlist.tracks.length - 4} more...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-light)",
              borderRadius: "6px",
              color: "var(--text-secondary)",
            }}
          >
            <p style={{ marginBottom: "16px" }}>
              your playlist history is empty.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="generate-btn"
              style={{ padding: "12px 24px" }}
            >
              create your first playlist
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
