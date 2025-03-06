import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAI } from "../actions/useAI";
import { usePlaylistContext } from "../context/PlaylistContext";
import { motion } from "motion/react";

const loadingPhrases = [
  "Creating a personalized vibe just for you...",
  "Curating your perfect mix based on your preferences...",
  "Finding the perfect balance of tracks...",
  "Connecting musical dots across genres and eras...",
  "Bringing your musical vision to life...",
  "Analyzing beats, tempos, and moods...",
  "Digging deep into music catalogs...",
  "Matching your energy with the perfect tracks...",
  "Crafting a sonic journey just for you...",
  "Generating the ultimate playlist experience...",
];

export const LoadingScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentPlaylist } = usePlaylistContext();
  const { generatePlaylist } = useAI();
  const { prompt, songCount, advancedParameters } = location.state || {};
  const [phrase, setPhrase] = useState(loadingPhrases[0]);
  const [phaseNumber, setPhaseNumber] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Shuffle loading phrases every 2 seconds
    const phraseInterval = setInterval(() => {
      setPhrase(
        loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]
      );
      setPhaseNumber((prev) => (prev % 3) + 1);
    }, 2000);

    // Simulate progress for visual feedback
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 15;
        return Math.min(prev + increment, 95); // Cap at 95% until actually complete
      });
    }, 1000);

    // Generate playlist with enhanced parameters
    const fetchPlaylist = async () => {
      if (!isGenerating && prompt) {
        setIsGenerating(true);

        // Construct a more detailed prompt with the advanced parameters
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

          // Short delay before navigating to give user time to see 100%
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
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="w-full max-w-md mx-auto text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center">
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-16 h-16"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    strokeDasharray="60"
                    strokeDashoffset="10"
                  />
                  <circle cx="12" cy="12" r="4" fill="white" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <h2 className="text-xl font-bold mb-2">
          Phase {phaseNumber}: {phrase}
        </h2>
        <p className="text-gray-400 mb-6">
          Creating a {songCount}-song playlist for "
          {prompt && prompt.length > 30
            ? prompt.substring(0, 30) + "..."
            : prompt}
          "
        </p>

        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-400">
          {Math.round(progress)}% complete
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
