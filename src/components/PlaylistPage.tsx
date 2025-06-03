import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Sun,
  Moon,
} from "lucide-react";
import { motion } from "motion/react";
import Button from "./Button";
import { useTheme } from "../context/ThemeContext";

export const PlaylistPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playlistName, currentPlaylist } = usePlaylistContext();
  const { savePlaylist } = usePlaylistHistory();
  const token = localStorage.getItem("spotify_token");
  const { searchTrackURI, createSpotifyPlaylist } = useSpotify(token);
  const { theme, colors, toggleTheme } = useTheme();

  // Memoize playlist to prevent unnecessary re-renders
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
    playlistName || "AI-Generated Playlist"
  );
  const [editingName, setEditingName] = useState(false);

  // Enhance playlist state and loading states
  const [enhancedPlaylist, setEnhancedPlaylist] = useState<
    (Song & {
      uri?: string;
      coverUrl?: string;
      previewUrl?: string;
      popularity?: number;
    })[]
  >([]);
  const [, setIsEnhancing] = useState(false);
  const [loadingImages, setLoadingImages] = useState<{
    [key: number]: boolean;
  }>({});

  // Memoized image loading handlers
  const handleImageLoad = useCallback((index: number) => {
    setLoadingImages((prev) => ({ ...prev, [index]: false }));
  }, []);

  const handleImageError = useCallback((index: number) => {
    setLoadingImages((prev) => ({ ...prev, [index]: false }));
  }, []);

  // Memoized enhancePlaylist function
  const memoizedEnhancePlaylist = useCallback(
    async (tracks: Song[]) => {
      if (tracks.length === 0 || !token) return tracks;

      setIsEnhancing(true);
      try {
        const batchSize = 3;
        let enhancedResults: any[] = [];

        for (let i = 0; i < tracks.length; i += batchSize) {
          const batch = tracks.slice(i, i + batchSize);

          // Add error handling for each batch
          const enhancedBatch = await Promise.all(
            batch.map(async (song) => {
              try {
                const uri = await searchTrackURI(song.title, song.artist);
                if (uri) {
                  const details = await fetch(
                    `https://api.spotify.com/v1/tracks/${uri.split(":")[2]}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );

                  if (!details.ok) return song;

                  const trackDetails = await details.json();
                  return {
                    ...song,
                    uri,
                    coverUrl: trackDetails.album.images[0]?.url,
                    previewUrl: trackDetails.preview_url,
                    popularity: trackDetails.popularity,
                  };
                }
                return song;
              } catch (error) {
                console.error(`Error enhancing track ${song.title}:`, error);
                return song;
              }
            })
          );

          enhancedResults = [...enhancedResults, ...enhancedBatch];

          // Add a small delay to prevent rate limiting
          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        return enhancedResults;
      } catch (error) {
        console.error("Error enhancing playlist:", error);
        return tracks;
      } finally {
        setIsEnhancing(false);
      }
    },
    [token, searchTrackURI]
  );

  // Playlist enhancement effect
  useEffect(() => {
    // Initialize loading state for all images
    const initialLoadingState: { [key: number]: boolean } = {};
    playlist.forEach((_: any, index: number) => {
      initialLoadingState[index] = true;
    });
    setLoadingImages(initialLoadingState);

    // Separate async function to handle enhancement
    const enhancePlaylistSafely = async () => {
      if (playlist.length > 0) {
        try {
          const enhanced = await memoizedEnhancePlaylist(playlist);
          setEnhancedPlaylist(enhanced);
        } catch (error) {
          console.error("Playlist enhancement failed:", error);
          setEnhancedPlaylist(playlist);
        }
      }
    };

    // Call the async function
    enhancePlaylistSafely();
  }, [playlist, memoizedEnhancePlaylist]);

  // Export to Spotify handler
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

  // Save to history handler
  const handleSaveToHistory = () => {
    savePlaylist(customPlaylistName, playlist);
    setSavedToHistory(true);

    // Reset after a delay
    setTimeout(() => {
      setSavedToHistory(false);
    }, 3000);
  };

  // Share handler
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

  // Open Spotify search for a track
  const openSpotifySearch = (song: Song) => {
    const query = `${song.title} ${song.artist}`;
    window.open(
      `https://open.spotify.com/search/${encodeURIComponent(query)}`,
      "_blank"
    );
  };

  return (
    <div 
      className="min-h-screen transition-all duration-300"
      style={{
        background: `linear-gradient(135deg, ${colors.bg.primary} 0%, ${colors.bg.secondary} 50%, ${colors.bg.tertiary} 100%)`,
        color: colors.text.primary
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-10 backdrop-blur-xl border-b transition-all duration-300"
        style={{
          backgroundColor: `${colors.bg.elevated}95`,
          borderColor: colors.border.primary,
          boxShadow: `0 8px 32px ${colors.bg.overlay}20`
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
            Back
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={toggleTheme}
              variant="icon"
              size="md"
              icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              tooltip={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            />
            
            <Button
              onClick={handleSaveToHistory}
              disabled={savedToHistory}
              variant={savedToHistory ? "success" : "icon"}
              size="md"
              icon={savedToHistory ? <Save size={18} /> : <Save size={18} />}
              tooltip={savedToHistory ? "Saved to history!" : "Save to history"}
            />

            <Button
              onClick={handleShare}
              variant="icon"
              size="md"
              icon={<Share2 size={18} />}
              tooltip="Share playlist"
            />
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
                className="text-2xl font-bold bg-transparent border-b-2 outline-none transition-all duration-200"
                style={{
                  borderColor: colors.border.secondary,
                  color: colors.text.primary
                }}
                onFocus={(e) => e.target.style.borderColor = colors.border.focus}
                onBlur={(e) => {
                  setEditingName(false);
                  e.target.style.borderColor = colors.border.secondary;
                }}
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                autoFocus
              />
            </div>
          ) : (
            <h1
              className="text-2xl font-bold cursor-pointer transition-all duration-200 hover:opacity-70"
              style={{ color: colors.text.primary }}
              onClick={() => setEditingName(true)}
              title="Click to edit"
            >
              {customPlaylistName}
              <span 
                className="text-sm font-normal ml-2"
                style={{ color: colors.text.tertiary }}
              >
                (Click to edit)
              </span>
            </h1>
          )}
          <p style={{ color: colors.text.secondary }} className="mt-1">{playlist.length} tracks</p>
        </div>

        {/* Playlist tracks */}
        {playlist.length > 0 ? (
          <div 
            className="rounded-2xl overflow-hidden backdrop-blur-sm transition-all duration-300"
            style={{
              backgroundColor: `${colors.bg.elevated}60`,
              border: `1px solid ${colors.border.primary}`,
              boxShadow: `0 20px 60px ${colors.bg.overlay}15`
            }}
          >
            <ul style={{ borderColor: colors.border.primary }} className="divide-y">
              {playlist.map((track: Song, index: number) => {
                const enhancedTrack = enhancedPlaylist[index];

                return (
                  <motion.li
                    key={`${track.title}-${track.artist}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 md:p-4 flex items-center gap-3 transition-all duration-200 hover:backdrop-blur-md"
                    style={{
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = `${colors.interactive.hover}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div 
                      className="w-8 text-center font-medium"
                      style={{ color: colors.text.tertiary }}
                    >
                      {index + 1}
                    </div>
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: colors.bg.tertiary }}
                    >
                      {enhancedTrack?.coverUrl ? (
                        <>
                          {loadingImages[index] && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center"
                              style={{ backgroundColor: colors.bg.tertiary }}
                            >
                              <div 
                                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                                style={{ borderColor: colors.brand.primary }}
                              ></div>
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
                        <Music size={16} style={{ color: colors.text.tertiary }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-medium truncate"
                        style={{ color: colors.text.primary }}
                      >
                        {track.title}
                      </p>
                      <p 
                        className="text-sm truncate"
                        style={{ color: colors.text.secondary }}
                      >
                        {track.artist}
                      </p>
                    </div>
                    <Button
                      onClick={() => openSpotifySearch(track)}
                      variant="icon"
                      size="sm"
                      icon={
                        <ExternalLink
                          size={16}
                          style={{ color: colors.text.tertiary }}
                        />
                      }
                      tooltip="Search on Spotify"
                    />
                    <Button
                      variant="icon"
                      size="sm"
                      icon={
                        <Heart
                          size={16}
                          style={{ color: colors.text.tertiary }}
                        />
                      }
                      tooltip="Like track (coming soon)"
                      disabled
                    />
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: colors.text.secondary }}>
            <Disc size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors.text.tertiary }} />
            <p>No tracks found. Try generating a new playlist.</p>
          </div>
        )}

        {/* Export to Spotify section */}
        <div 
          className="mt-8 rounded-2xl p-6 backdrop-blur-sm transition-all duration-300"
          style={{
            backgroundColor: `${colors.bg.elevated}40`,
            border: `1px solid ${colors.border.primary}`,
            boxShadow: `0 20px 60px ${colors.bg.overlay}10`
          }}
        >
          <h2 
            className="text-xl font-bold mb-4"
            style={{ color: colors.text.primary }}
          >
            Export to Spotify
          </h2>

          {!exportedPlaylistURL ? (
            <>
              {isExporting ? (
                <div className="space-y-4">
                  <div 
                    className="w-full rounded-full h-2.5"
                    style={{ backgroundColor: colors.bg.tertiary }}
                  >
                    <div
                      className="h-2.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${exportProgress}%`,
                        background: `linear-gradient(90deg, ${colors.status.success}, ${colors.brand.accent})`
                      }}
                    ></div>
                  </div>
                  <p style={{ color: colors.text.secondary }}>
                    Searching for tracks... {exportProgress}%
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleExportToSpotify}
                  disabled={playlist.length === 0}
                  variant="success"
                  size="lg"
                  fullWidth
                  loading={isExporting}
                  tooltip={playlist.length === 0 ? "No tracks to export" : "Export playlist to Spotify"}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="currentColor"
                    >
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  }
                >
                  Export
                </Button>
              )}
            </>
          ) : (
            <div className="text-center">
              <p 
                className="mb-4 font-medium"
                style={{ color: colors.status.success }}
              >
                ✓ Successfully exported to Spotify!
              </p>
              <Button
                as="a"
                href={exportedPlaylistURL}
                target="_blank"
                rel="noopener noreferrer"
                variant="success"
                size="lg"
                icon={<ExternalLink size={18} />}
                tooltip="Open your playlist in Spotify"
              >
                Open
              </Button>
            </div>
          )}

          <p 
            className="text-sm mt-4"
            style={{ color: colors.text.secondary }}
          >
            Note: Some songs may not be found on Spotify if they're very obscure
            or have different spellings in the database.
          </p>
        </div>

        {/* Generate another playlist */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate("/home")}
            variant="primary"
            size="lg"
            icon={<Music size={18} />}
            tooltip="Create a new playlist"
          >
            New Playlist
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PlaylistPage;
