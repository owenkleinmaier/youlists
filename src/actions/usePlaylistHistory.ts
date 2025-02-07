import { useState, useEffect } from "react";

export const usePlaylistHistory = () => {
  const [history, setHistory] = useState<any[]>(() => {
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

  const savePlaylist = (name: string, tracks: any[]) => {
    const newPlaylist = { name, tracks, createdAt: new Date().toISOString() };
    setHistory((prev) => [...prev, newPlaylist]);
  };

  return { history, savePlaylist };
};
