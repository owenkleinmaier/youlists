import { useState } from "react";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI_SECRET; 

export const useAI = () => {
  const [promptResponse, setPromptResponse] = useState(null);

  const generatePlaylist = async (mood: string, season: string, userTaste: string) => {
    if (!OPENAI_API_KEY) {
      console.error("❌ Missing OpenAI API Key!");
      return null;
    }

    const messages = [
      { role: "system", content: "You are an AI that generates music playlists based on mood, season, and user preferences." },
      { role: "user", content: `
        Generate a 10-song playlist with the following criteria:
        - Mood: ${mood}
        - Season: ${season}
        - User taste: ${userTaste}
        - Include a mix of well-known and lesser-known tracks
        - Format the response as JSON with this structure:
          { "playlist": [ {"title": "song name", "artist": "artist name"} ] }
      ` }
    ];

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: messages, 
          max_tokens: 300,
          temperature: 0.7,
          n: 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`❌ OpenAI API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const parsedResponse = JSON.parse(data.choices[0]?.message?.content.trim());

      setPromptResponse(parsedResponse);
      return parsedResponse;
    } catch (error) {
      console.error("❌ Error generating playlist:", error);
      return null;
    }
  };

  return { promptResponse, generatePlaylist };
};
