import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePlaylistContext, Song } from "../context/PlaylistContext";
import { usePlaylistHistory } from "../actions/usePlaylistHistory";
import { useSpotify } from "../actions/useSpotify";
import {
  Share2,
  Save,
  ArrowLeft,
  Heart,
  Disc,
  Music,
  ExternalLink,
} from "lucide-react";
import { motion } from "motion/react";

export const PlaylistPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playlistName, currentPlaylist, setCurrentPlaylist } =
    usePlaylistContext();
  const { savePlaylist } = usePlaylistHistory();
  const token = localStorage.getItem("spotify_token");
  const { searchTrackURI, createSpotifyPlaylist, enhancePlaylist } =
    useSpotify(token);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedPlaylistURL, setExportedPlaylistURL] = useState<string | null>(
    null
  );
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [customPlaylistName, setCustomPlaylistName] = useState(
    playlistName || "AI-Generated Playlist"
  );
  const [editingName, setEditingName] = useState(false);
  const [enhancedPlaylist, setEnhancedPlaylist] = useState<
    (Song & {
      uri?: string;
      coverUrl?: string;
      previewUrl?: string;
      popularity?: number;
    })[]
  >([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [loadingImages, setLoadingImages] = useState<{
    [key: number]: boolean;
  }>({});

  // If navigating directly to this page without data, get playlist from context
  const playlistData = location.state?.playlistData || {
    playlist: currentPlaylist || [],
  };
  const playlist = Array.isArray(playlistData?.playlist)
    ? playlistData.playlist
    : [];

  // Handle image loading state
  const handleImageLoad = useCallback((index: number) => {
    setLoadingImages((prev) => ({ ...prev, [index]: false }));
  }, []);

  const handleImageError = useCallback((index: number) => {
    setLoadingImages((prev) => ({ ...prev, [index]: false }));
  }, []);

  useEffect(() => {
    // Update context with current playlist if coming from location state
    if (
      location.state?.playlistData &&
      Array.isArray(location.state.playlistData.playlist)
    ) {
      setCurrentPlaylist(location.state.playlistData.playlist);
    }

    // Initialize loading state for all images
    const initialLoadingState: { [key: number]: boolean } = {};
    playlist.forEach((_: any, index: number) => {
      initialLoadingState[index] = true;
    });
    setLoadingImages(initialLoadingState);

    // Enhance playlist with Spotify data (cover art, preview URLs, etc.)
    const fetchEnhancedPlaylist = async () => {
      if (playlist.length > 0 && token) {
        setIsEnhancing(true);
        try {
          // Process tracks in smaller batches to avoid overwhelming the browser
          const batchSize = 5;
          let enhancedResults: any[] = [];

          for (let i = 0; i < playlist.length; i += batchSize) {
            const batch = playlist.slice(i, i + batchSize);
            const enhancedBatch = await enhancePlaylist(batch);
            enhancedResults = [...enhancedResults, ...enhancedBatch];

            // Artificial delay to prevent rate limiting and give UI time to breathe
            if (i + batchSize < playlist.length) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }

          setEnhancedPlaylist(enhancedResults);
        } catch (error) {
          console.error("Error enhancing playlist:", error);
        } finally {
          setIsEnhancing(false);
        }
      }
    };

    fetchEnhancedPlaylist();
  }, [location.state, setCurrentPlaylist, playlist, token, enhancePlaylist]);

  const handleExportToSpotify = async () => {
    if (!playlist.length) {
      alert("No songs to export!");
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      // Search and collect Spotify URIs for each track
      const trackURIs: string[] = [];

      for (let i = 0; i < playlist.length; i++) {
        const song = playlist[i];

        // If the song already has a URI from the enhancement, use it
        if (enhancedPlaylist[i]?.uri) {
          const uri = enhancedPlaylist[i].uri;
          if (uri) trackURIs.push(uri);
        } else {
          // Otherwise search for it
          const uri = await searchTrackURI(song.title, song.artist);
          if (uri) trackURIs.push(uri);
        }

        // Update progress
        setExportProgress(Math.round(((i + 1) / playlist.length) * 100));
      }

      // Create Spotify playlist
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

    // Reset after a delay
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
      // Fallback for browsers that don't support Web Share API
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-black/60 border-b border-gray-800">
        <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSaveToHistory}
              disabled={savedToHistory}
              className={`p-2 rounded-lg ${
                savedToHistory ? "bg-green-700 text-white" : "hover:bg-gray-800"
              }`}
              title="Save to history"
            >
              {savedToHistory ? "Saved!" : <Save size={18} />}
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-gray-800"
              title="Share playlist"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          {editingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={customPlaylistName}
                onChange={(e) => setCustomPlaylistName(e.target.value)}
                className="text-2xl font-bold bg-transparent border-b border-gray-500 focus:border-blue-500 outline-none"
                autoFocus
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              />
            </div>
          ) : (
            <h1
              className="text-2xl font-bold cursor-pointer hover:text-gray-300"
              onClick={() => setEditingName(true)}
              title="Click to edit"
            >
              {customPlaylistName}
              <span className="text-sm font-normal text-gray-400 ml-2">
                (Click to edit)
              </span>
            </h1>
          )}
          <p className="text-gray-400 mt-1">{playlist.length} tracks</p>
        </div>

        {/* Playlist tracks */}
        {playlist.length > 0 ? (
          <div className="bg-gray-800/50 rounded-xl overflow-hidden">
            <ul className="divide-y divide-gray-700">
              {playlist.map((track: Song, index: number) => {
                const enhancedTrack = enhancedPlaylist[index];

                return (
                  <motion.li
                    key={`${track.title}-${track.artist}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 md:p-4 flex items-center gap-3 hover:bg-gray-700/50"
                  >
                    <div className="w-8 text-center text-gray-400 font-medium">
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                      {enhancedTrack?.coverUrl ? (
                        <>
                          {loadingImages[index] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                          <img
                            src={enhancedTrack.coverUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                            onLoad={() => handleImageLoad(index)}
                            onError={() => handleImageError(index)}
                            loading="lazy"
                          />
                        </>
                      ) : (
                        <Music size={16} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.title}</p>
                      <p className="text-sm text-gray-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                    <button
                      className="p-2 rounded-full hover:bg-gray-700"
                      onClick={() => openSpotifySearch(track)}
                      title="Search on Spotify"
                    >
                      <ExternalLink
                        size={16}
                        className="text-gray-400 hover:text-green-500"
                      />
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-700">
                      <Heart
                        size={16}
                        className="text-gray-400 hover:text-pink-500"
                      />
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <Disc size={48} className="mx-auto mb-4 opacity-50" />
            <p>No tracks found. Try generating a new playlist.</p>
          </div>
        )}

        {/* Export to Spotify section */}
        <div className="mt-8 bg-gray-800/50 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Export to Spotify</h2>

          {!exportedPlaylistURL ? (
            <>
              {isExporting ? (
                <div className="space-y-4">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400">
                    Searching for tracks... {exportProgress}%
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleExportToSpotify}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors"
                  disabled={playlist.length === 0}
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
            <div className="text-center">
              <p className="text-green-500 mb-4">
                ✓ Successfully exported to Spotify!
              </p>
              <a
                href={exportedPlaylistURL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-3 px-6 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors"
              >
                Open in Spotify
              </a>
            </div>
          )}

          <p className="text-gray-400 text-sm mt-4">
            Note: Some songs may not be found on Spotify if they're very obscure
            or have different spellings in the database.
          </p>
        </div>

        {/* Generate another playlist */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/home")}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
          >
            Generate Another Playlist
          </button>
        </div>
      </main>
    </div>
  );
};

export default PlaylistPage;
