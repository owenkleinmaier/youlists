import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Share2, ExternalLink, Sun, Moon } from "lucide-react";
import { usePlaylistContext, Song } from "../context/PlaylistContext";
import { usePlaylistHistory } from "../actions/usePlaylistHistory";
import { useSpotify } from "../actions/useSpotify";
import { useTheme } from "../context/ThemeContext";

const PlaylistPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { playlistName, currentPlaylist } = usePlaylistContext();
  const { savePlaylist } = usePlaylistHistory();
  const token = localStorage.getItem("spotify_token");
  const { searchTrackURI, createSpotifyPlaylist } = useSpotify(token);

  const playlist = useMemo(() => {
    const playlistData = location.state?.playlistData || {
      playlist: currentPlaylist,
    };
    return Array.isArray(playlistData?.playlist) ? playlistData.playlist : [];
  }, [location.state, currentPlaylist]);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedPlaylistURL, setExportedPlaylistURL] = useState<string | null>(
    null
  );
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [customPlaylistName, setCustomPlaylistName] = useState(
    playlistName || "ai-generated playlist"
  );

  const handleExportToSpotify = async () => {
    if (!playlist.length) {
      alert("No songs to export!");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const trackURIs: string[] = [];

      for (let i = 0; i < playlist.length; i++) {
        const song = playlist[i];
        const uri = await searchTrackURI(song.title, song.artist);
        if (uri) trackURIs.push(uri);

        setExportProgress(Math.round(((i + 1) / playlist.length) * 100));
      }

      const playlistLink = await createSpotifyPlaylist(
        customPlaylistName,
        trackURIs.filter(Boolean)
      );

      setExportedPlaylistURL(playlistLink);
    } catch (error) {
      console.error("Error exporting to Spotify:", error);
      alert("Failed to export playlist to Spotify. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToHistory = () => {
    savePlaylist(customPlaylistName, playlist);
    setSavedToHistory(true);

    setTimeout(() => {
      setSavedToHistory(false);
    }, 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: customPlaylistName,
          text: `Check out my playlist: ${customPlaylistName}`,
          url: window.location.href,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch(() => alert("Failed to copy link"));
    }
  };

  const openSpotifySearch = (song: Song) => {
    const query = `${song.title} ${song.artist}`;
    window.open(
      `https://open.spotify.com/search/${encodeURIComponent(query)}`,
      "_blank"
    );
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

          <button
            className="icon-btn"
            onClick={handleSaveToHistory}
            style={{
              background: savedToHistory ? "var(--accent-primary)" : undefined,
              color: savedToHistory ? "white" : undefined,
            }}
          >
            <Save size={18} />
          </button>

          <button className="icon-btn" onClick={handleShare}>
            <Share2 size={18} />
          </button>
        </div>
      </header>

      <main className="main playlist-main">
        <div className="playlist-header">
          <input
            type="text"
            value={customPlaylistName}
            onChange={(e) => setCustomPlaylistName(e.target.value)}
            className="playlist-name-input"
            placeholder="playlist name..."
          />
          <p className="playlist-info">{playlist.length} tracks</p>
        </div>

        {playlist.length > 0 ? (
          <div className="playlist-tracks">
            {playlist.map((track: Song, index: number) => (
              <div
                key={`${track.title}-${track.artist}-${index}`}
                className="track-item"
              >
                <span className="track-number">{index + 1}</span>
                <div className="track-info">
                  <div className="track-title">{track.title}</div>
                  <div className="track-artist">{track.artist}</div>
                </div>
                <button
                  className="track-action"
                  onClick={() => openSpotifySearch(track)}
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--text-secondary)",
            }}
          >
            <p>No tracks found. Try generating a new playlist.</p>
          </div>
        )}

        <div className="export-section">
          {!exportedPlaylistURL ? (
            <>
              {isExporting ? (
                <div style={{ marginBottom: "20px" }}>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      marginTop: "8px",
                    }}
                  >
                    searching for tracks... {exportProgress}%
                  </p>
                </div>
              ) : (
                <button
                  className="export-btn"
                  onClick={handleExportToSpotify}
                  disabled={playlist.length === 0}
                >
                  export to spotify
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  color: "var(--accent-primary)",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                ✓ successfully exported to spotify!
              </p>
              <a
                href={exportedPlaylistURL}
                target="_blank"
                rel="noopener noreferrer"
                className="export-btn"
                style={{ textDecoration: "none", display: "inline-block" }}
              >
                open in spotify
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PlaylistPage;
