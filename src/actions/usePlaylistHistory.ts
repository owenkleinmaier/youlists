import { useState, useEffect } from "react";
import { Song } from "../context/PlaylistContext";

interface PlaylistHistoryItem {
  id: string;
  name: string;
  tracks: Song[];
  createdAt: string;
}

export const usePlaylistHistory = () => {
  const [history, setHistory] = useState<PlaylistHistoryItem[]>(() => {
    try {
      const storedHistory = localStorage.getItem("playlistHistory");
      return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (error) {
      console.error("Error parsing playlist history:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("playlistHistory", JSON.stringify(history));
  }, [history]);

  const savePlaylist = (name: string, tracks: Song[]) => {
    const id = `playlist-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newPlaylist = { 
      id, 
      name, 
      tracks, 
      createdAt: new Date().toISOString() 
    };
    
    setHistory((prev) => [newPlaylist, ...prev]);
    return id;
  };

  const deletePlaylist = (id: string) => {
    setHistory((prev) => prev.filter(playlist => playlist.id !== id));
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire playlist history?")) {
      setHistory([]);
    }
  };

  const getPlaylist = (id: string) => {
    return history.find(playlist => playlist.id === id) || null;
  };

  const renamePlaylist = (id: string, newName: string) => {
    setHistory(prev => 
      prev.map(playlist => 
        playlist.id === id 
          ? { ...playlist, name: newName } 
          : playlist
      )
    );
  };

  return { 
    history, 
    savePlaylist, 
    deletePlaylist, 
    clearHistory,
    getPlaylist,
    renamePlaylist 
  };
};