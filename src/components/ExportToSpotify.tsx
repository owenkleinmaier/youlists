import React, { useState } from "react";
import { useSpotify } from "../actions/useSpotify";

interface ExportToSpotifyProps {
  playlist: { title: string; artist: string }[];
}

const ExportToSpotify: React.FC<ExportToSpotifyProps> = ({ playlist }) => {
  const token = localStorage.getItem("spotify_token");
  const { searchTrackURI, createSpotifyPlaylist } = useSpotify(token);
  const [playlistURL, setPlaylistURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (!playlist.length) {
      alert("No songs to export!");
      return;
    }

    setLoading(true);

    // Convert song names to Spotify URIs
    const trackURIs = await Promise.all(
      playlist.map((song) => searchTrackURI(song.title, song.artist))
    );

    const validURIs = trackURIs.filter(Boolean); // Remove null values

    // Create the Spotify playlist
    const playlistLink = await createSpotifyPlaylist(
      "YouLists AI Playlist",
      validURIs
    );
    setPlaylistURL(playlistLink);

    setLoading(false);
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleExport}
        className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-bold"
        disabled={loading}
      >
        {loading ? "Exporting to Spotify..." : "Export to Spotify"}
      </button>

      {playlistURL && (
        <div className="mt-4">
          <p>
            🎶 Your playlist is ready!{" "}
            <a href={playlistURL} target="_blank" className="text-blue-400">
              Open in Spotify
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default ExportToSpotify;
