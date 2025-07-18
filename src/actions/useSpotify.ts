import { useState, useCallback } from "react";
import { Song } from "../context/PlaylistContext";

const SPOTIFY_API_URL = "https://api.spotify.com/v1";

interface SpotifyTrack {
  uri: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
    album_type: string;
  };
  preview_url: string | null;
  popularity: number;
}

export const useSpotify = (token: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLiveOrRemixVersion = (trackName: string, albumName: string): boolean => {
    const liveKeywords = [
      'live', 'concert', 'tour', 'acoustic', 'unplugged', 'session',
      'remix', 'edit', 'mix', 'version', 'remaster', 'demo', 'alternate',
      'rehearsal', 'bootleg', 'radio', 'instrumental', 'karaoke'
    ];
    
    const trackLower = trackName.toLowerCase();
    const albumLower = albumName.toLowerCase();
    
    return liveKeywords.some(keyword => 
      trackLower.includes(keyword) || albumLower.includes(keyword)
    );
  };

  const calculateTrackScore = (track: SpotifyTrack, originalTitle: string, originalArtist: string): number => {
    let score = 0;
    
    const trackNameLower = track.name.toLowerCase();
    const originalTitleLower = originalTitle.toLowerCase();
    
    if (trackNameLower === originalTitleLower) {
      score += 100;
    } else if (trackNameLower.includes(originalTitleLower) || originalTitleLower.includes(trackNameLower)) {
      score += 80;
    }
    
    const hasMatchingArtist = track.artists.some(artist =>
      artist.name.toLowerCase().includes(originalArtist.toLowerCase()) ||
      originalArtist.toLowerCase().includes(artist.name.toLowerCase())
    );
    if (hasMatchingArtist) {
      score += 80;
    }
    
    score += Math.min(track.popularity, 100);
    
    if (track.album.album_type === 'album') {
      score += 30;
    } else if (track.album.album_type === 'single') {
      score += 20;
    }
    
    if (isLiveOrRemixVersion(track.name, track.album.name)) {
      score -= 50;
    }
    
    const parenthesesMatch = trackNameLower.match(/\([^)]*\)/g);
    if (parenthesesMatch) {
      score -= parenthesesMatch.length * 10;
    }
    
    const bracketMatch = trackNameLower.match(/\[[^\]]*\]/g);
    if (bracketMatch) {
      score -= bracketMatch.length * 10;
    }
    
    if (trackNameLower.includes('feat.') || trackNameLower.includes('ft.')) {
      const originalHasFeat = originalTitleLower.includes('feat.') || originalTitleLower.includes('ft.');
      if (!originalHasFeat) {
        score -= 15;
      }
    }
    
    return score;
  };

  const searchTrackURI = useCallback(
    async (trackName: string, artistName: string): Promise<string | null> => {
      if (!token) {
        console.error("Missing Spotify Token!");
        return null;
      }
      
      try {
        const cleanTrackName = trackName.replace(/[^\w\s]/g, ' ').trim();
        const cleanArtistName = artistName.replace(/[^\w\s]/g, ' ').trim();
        
        const exactQuery = `track:"${cleanTrackName}" artist:"${cleanArtistName}"`;
        const response = await fetch(
          `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(exactQuery)}&type=track&limit=20`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error(`Spotify search failed: ${await response.text()}`);
        }

        const data = await response.json();
        let tracks = data.tracks.items;

        if (tracks.length === 0) {
          const fallbackQuery = `${cleanTrackName} ${cleanArtistName}`;
          const fallbackResponse = await fetch(
            `${SPOTIFY_API_URL}/search?q=${encodeURIComponent(fallbackQuery)}&type=track&limit=20`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!fallbackResponse.ok) {
            return null;
          }

          const fallbackData = await fallbackResponse.json();
          tracks = fallbackData.tracks.items;
        }

        if (tracks.length === 0) {
          return null;
        }

        const scoredTracks = tracks.map((track: SpotifyTrack) => ({
          track,
          score: calculateTrackScore(track, trackName, artistName)
        }));

        scoredTracks.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

        return scoredTracks[0]?.track?.uri || null;
      } catch (error) {
        console.error("Error searching for track:", error);
        return null;
      }
    },
    [token]
  );

  const getTrackDetails = useCallback(
    async (trackURI: string): Promise<SpotifyTrack | null> => {
      if (!token) return null;
      try {
        const trackId = trackURI.split(":").pop();
        const response = await fetch(`${SPOTIFY_API_URL}/tracks/${trackId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        console.error("Error fetching track details:", error);
        return null;
      }
    },
    [token]
  );

  const createSpotifyPlaylist = useCallback(
    async (playlistName: string, trackURIs: string[], description = "Generated by YouLists AI"): Promise<string | null> => {
      if (!token) {
        console.error("Missing Spotify Token!");
        setError("Missing Spotify authentication.");
        return null;
      }

      if (trackURIs.length === 0) {
        setError("No tracks found to add to playlist.");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const userResponse = await fetch(`${SPOTIFY_API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!userResponse.ok) {
          throw new Error(`Failed to get user info: ${await userResponse.text()}`);
        }
        const userData = await userResponse.json();
        const userId = userData.id;

        const createPlaylistResponse = await fetch(`${SPOTIFY_API_URL}/users/${userId}/playlists`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: playlistName,
            description: description,
            public: false,
          }),
        });

        if (!createPlaylistResponse.ok) {
          throw new Error(`Failed to create playlist: ${await createPlaylistResponse.text()}`);
        }

        const playlistData = await createPlaylistResponse.json();
        const playlistId = playlistData.id;

        const batchSize = 100;
        for (let i = 0; i < trackURIs.length; i += batchSize) {
          const batch = trackURIs.slice(i, i + batchSize);
          const addTracksResponse = await fetch(`${SPOTIFY_API_URL}/playlists/${playlistId}/tracks`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: batch }),
          });
          if (!addTracksResponse.ok) {
            console.error(`Error adding tracks batch ${i / batchSize + 1}: ${await addTracksResponse.text()}`);
          }
        }

        return playlistData.external_urls.spotify;
      } catch (error) {
        console.error("Error creating Spotify playlist:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  const enhancePlaylist = useCallback(
    async (playlist: Song[]): Promise<Song[]> => {
      if (!token || playlist.length === 0) {
        return playlist;
      }

      const enhanced = await Promise.all(
        playlist.map(async (song) => {
          try {
            const uri = await searchTrackURI(song.title, song.artist);
            if (uri) {
              const details = await getTrackDetails(uri);
              return {
                ...song,
                uri,
                coverUrl: details?.album.images[0]?.url,
                previewUrl: details?.preview_url,
                popularity: details?.popularity,
              };
            }
            return song;
          } catch (e) {
            return song;
          }
        })
      );

      return enhanced;
    },
    [token, searchTrackURI, getTrackDetails]
  );

  return {
    searchTrackURI,
    getTrackDetails,
    createSpotifyPlaylist,
    enhancePlaylist,
    isLoading,
    error,
  };
};