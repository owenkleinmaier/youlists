import React, { useEffect, useState } from "react";
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let phraseIndex = 0;
    const phraseInterval = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % loadingPhrases.length;
      setPhrase(loadingPhrases[phraseIndex]);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 95);
      });
    }, 1000);

    const fetchPlaylist = async () => {
      if (!isGenerating && prompt) {
        setIsGenerating(true);

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
          setCurrentPlaylist(generatedPlaylist?.playlist || []);
          setProgress(100);

          setTimeout(() => {
            navigate("/playlist", {
              state: { playlistData: generatedPlaylist },
            });
          }, 500);
        } catch (error) {
          console.error("Error generating playlist:", error);
          alert("Error generating playlist. Please try again.");
          navigate("/home");
        }
      }
    };

    fetchPlaylist();

    return () => {
      clearInterval(phraseInterval);
      clearInterval(progressInterval);
    };
  }, [
    navigate,
    generatePlaylist,
    prompt,
    songCount,
    advancedParameters,
    isGenerating,
    setCurrentPlaylist,
  ]);

  return (
    <div className="page loading-page">
      <div className="loading-content">
        <div className="loading-spinner">
          <Music size={32} />
        </div>

        <h2 className="loading-title">{phrase}</h2>
        <p className="loading-subtitle">
          creating playlist for "
          {prompt && prompt.length > 30
            ? prompt.substring(0, 30) + "..."
            : prompt}
          "
        </p>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <span className="progress-text">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
