import React, { useState } from "react";
import { useSpotify } from "../actions/useSpotify";
import { Song } from "../context/PlaylistContext";

interface ExportToSpotifyProps {
  playlist: Song[];
  playlistName?: string;
}

const ExportToSpotify: React.FC<ExportToSpotifyProps> = ({
  playlist,
  playlistName = "YouLists AI Playlist",
}) => {
  const token = localStorage.getItem("spotify_token");
  const { searchTrackURI, createSpotifyPlaylist } = useSpotify(token);
  const [playlistURL, setPlaylistURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);

  const handleExport = async () => {
    if (!playlist.length) {
      setError("No songs to export!");
      return;
    }

    if (!token) {
      setError("You must be logged in to export to Spotify");
      return;
    }

    setLoading(true);
    setError(null);
    setExportProgress(0);

    try {
      // Convert song names to Spotify URIs
      const trackURIs: string[] = [];

      for (let i = 0; i < playlist.length; i++) {
        const song = playlist[i];
        const uri = await searchTrackURI(song.title, song.artist);
        if (uri) trackURIs.push(uri);

        // Update progress
        setExportProgress(Math.round(((i + 1) / playlist.length) * 100));
      }

      if (trackURIs.length === 0) {
        throw new Error("No tracks could be found on Spotify");
      }

      // Create the Spotify playlist
      const customName = playlistName || "YouLists AI Playlist";
      const playlistLink = await createSpotifyPlaylist(customName, trackURIs);

      if (!playlistLink) {
        throw new Error("Failed to create playlist on Spotify");
      }

      setPlaylistURL(playlistLink);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to export playlist"
      );
      console.error("Export error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-600 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {!playlistURL ? (
        <>
          {loading ? (
            <div className="space-y-3">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">
                Exporting to Spotify... {exportProgress}%
              </p>
            </div>
          ) : (
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold text-white transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
              disabled={loading}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Export to Spotify
            </button>
          )}
        </>
      ) : (
        <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-green-400 mb-3">
            ✓ Successfully exported to Spotify!
          </p>
          <a
            href={playlistURL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-white transition-colors"
          >
            Open in Spotify
          </a>
        </div>
      )}
    </div>
  );
};

export default ExportToSpotify;
