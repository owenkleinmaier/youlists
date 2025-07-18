// src/components/LoadingScreen.tsx

import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Music } from "lucide-react";
import { useAI } from "../actions/useAI";
import { usePlaylistContext } from "../context/PlaylistContext";
import { ProcessedImage } from "../utils/imageUtils";

const loadingPhrases = [
  "analyzing your request...",
  "finding the perfect tracks...",
  "curating your playlist...",
  "almost ready...",
  "matching your vibe...",
  "discovering hidden gems...",
];

const imageLoadingPhrases = [
  "analyzing your image...",
  "extracting visual vibes...",
  "interpreting the mood...",
  "finding matching tracks...",
  "curating your playlist...",
  "almost ready...",
];

const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentPlaylist, setPlaylistName } = usePlaylistContext();
  const { generatePlaylist } = useAI();
  const { prompt, songCount, advancedParameters, selectedImage } =
    location.state || {};

  const [phrase, setPhrase] = useState(
    selectedImage ? imageLoadingPhrases[0] : loadingPhrases[0]
  );
  const [isComplete, setIsComplete] = useState(false);

  const isGeneratingRef = useRef(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current || (!prompt && !selectedImage)) {
      return;
    }

    hasStartedRef.current = true;

    let phraseInterval: ReturnType<typeof setInterval>;

    const startIntervals = () => {
      const phrases = selectedImage ? imageLoadingPhrases : loadingPhrases;
      let phraseIndex = 0;
      phraseInterval = setInterval(() => {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setPhrase(phrases[phraseIndex]);
      }, 2000);
    };

    const fetchPlaylist = async () => {
      if (isGeneratingRef.current) {
        return;
      }

      isGeneratingRef.current = true;

      const enhancedPrompt = `
        Generate a ${songCount}-song playlist based on: "${prompt}".
        Energy level: ${advancedParameters.energyLevel}/10.
        Tempo: ${advancedParameters.tempo}/10.
        Artist diversity: ${advancedParameters.diversity}/10.
        ${
          advancedParameters.includeObscure
            ? "Include some obscure/lesser-known tracks."
            : "Focus on popular tracks."
        }
      `;

      try {
        const generatedPlaylist = await generatePlaylist(
          enhancedPrompt,
          songCount,
          selectedImage as ProcessedImage | null
        );

        if (generatedPlaylist?.playlist) {
          setCurrentPlaylist(generatedPlaylist.playlist);

          // Use generated title if no prompt was provided and we have one
          if (!prompt && generatedPlaylist.generatedTitle) {
            setPlaylistName(generatedPlaylist.generatedTitle);
          }

          setIsComplete(true);

          setTimeout(() => {
            navigate("/playlist", {
              state: {
                playlistData: generatedPlaylist,
                coverImage: selectedImage,
              },
              replace: true,
            });
          }, 800);
        } else {
          throw new Error("No playlist data received");
        }
      } catch (error) {
        console.error("Error generating playlist:", error);
        alert("Error generating playlist. Please try again.");
        navigate("/home", { replace: true });
      }
    };

    startIntervals();
    fetchPlaylist();

    return () => {
      if (phraseInterval) clearInterval(phraseInterval);
    };
  }, []);

  useEffect(() => {
    if (!prompt && !selectedImage && !hasStartedRef.current) {
      navigate("/home", { replace: true });
    }
  }, [prompt, selectedImage, navigate]);

  const getDisplayText = () => {
    if (selectedImage && prompt) {
      return `creating playlist from image and "${
        prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt
      }"`;
    } else if (selectedImage) {
      return "creating playlist from your image";
    } else if (prompt) {
      return `creating playlist for "${
        prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt
      }"`;
    }
    return "creating your playlist";
  };

  return (
    <div className="page loading-page">
      <div className="loading-content">
        <div className="loading-spinner">
          <Music size={32} />
        </div>

        <h2 className="loading-title">
          {isComplete ? "playlist ready!" : phrase}
        </h2>
        <p className="loading-subtitle">
          {isComplete ? "redirecting to your playlist..." : getDisplayText()}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
