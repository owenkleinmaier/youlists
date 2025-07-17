import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Music } from "lucide-react";
import { useAI } from "../actions/useAI";
import { usePlaylistContext } from "../context/PlaylistContext";

const loadingPhrases = [
  "analyzing your request...",
  "finding the perfect tracks...",
  "curating your playlist...",
  "almost ready...",
  "matching your vibe...",
  "discovering hidden gems...",
];

const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentPlaylist } = usePlaylistContext();
  const { generatePlaylist } = useAI();
  const { prompt, songCount, advancedParameters } = location.state || {};

  const [phrase, setPhrase] = useState(loadingPhrases[0]);
  const [isComplete, setIsComplete] = useState(false);

  const isGeneratingRef = useRef(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current || !prompt) {
      return;
    }

    hasStartedRef.current = true;

    let phraseInterval: NodeJS.Timeout;

    const startIntervals = () => {
      let phraseIndex = 0;
      phraseInterval = setInterval(() => {
        phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
        setPhrase(loadingPhrases[phraseIndex]);
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
          songCount
        );

        if (generatedPlaylist?.playlist) {
          setCurrentPlaylist(generatedPlaylist.playlist);
          setIsComplete(true);

          setTimeout(() => {
            navigate("/playlist", {
              state: { playlistData: generatedPlaylist },
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
    if (!prompt && !hasStartedRef.current) {
      navigate("/home", { replace: true });
    }
  }, [prompt, navigate]);

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
          {isComplete ? (
            "redirecting to your playlist..."
          ) : (
            <>
              creating playlist for "
              {prompt && prompt.length > 30
                ? prompt.substring(0, 30) + "..."
                : prompt}
              "
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
