// src/context/PlaylistContext.tsx

import React, { createContext, useState, useContext, ReactNode } from "react";
import { ProcessedImage } from "../utils/imageUtils";

interface PlaylistContextType {
  currentPlaylist: Song[] | null;
  setCurrentPlaylist: (playlist: Song[] | null) => void;
  playlistName: string;
  setPlaylistName: (name: string) => void;
  songCount: number;
  setSongCount: (count: number) => void;
  advancedParameters: AdvancedParameters;
  setAdvancedParameters: (params: AdvancedParameters) => void;
  selectedImage: ProcessedImage | null;
  setSelectedImage: (image: ProcessedImage | null) => void;
}

export interface Song {
  title: string;
  artist: string;
  uri?: string;
}

export interface AdvancedParameters {
  includeObscure: boolean;
  energyLevel: number;
  tempo: number;
  diversity: number;
  isUsed?: boolean;
}

const defaultAdvancedParameters: AdvancedParameters = {
  includeObscure: true,
  energyLevel: 5,
  tempo: 5,
  diversity: 5,
};

const PlaylistContext = createContext<PlaylistContextType | undefined>(
  undefined
);

export const PlaylistProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentPlaylist, setCurrentPlaylist] = useState<Song[] | null>(null);
  const [playlistName, setPlaylistName] = useState<string>(
    "ai-generated playlist"
  );
  const [songCount, setSongCount] = useState<number>(15);
  const [advancedParameters, setAdvancedParameters] =
    useState<AdvancedParameters>(defaultAdvancedParameters);
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(
    null
  );

  return (
    <PlaylistContext.Provider
      value={{
        currentPlaylist,
        setCurrentPlaylist,
        playlistName,
        setPlaylistName,
        songCount,
        setSongCount,
        advancedParameters,
        setAdvancedParameters,
        selectedImage,
        setSelectedImage,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylistContext = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error(
      "usePlaylistContext must be used within a PlaylistProvider"
    );
  }
  return context;
};
