import { useState } from "react";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI_SECRET; 

export const useAI = () => {
    const [promptResponse, setPromptResponse] = useState(null);
  
    const generatePlaylist = async (prompt: string) => {
      if (!OPENAI_API_KEY) {
        console.error("❌ Missing OpenAI API Key!");
        return null;
      }
  
      // Construct OpenAI request with the full user prompt
      const messages = [
        {
          role: "system",
          content: `
          You are an expert AI DJ that crafts **highly personalized** music playlists based on user input.
          You must generate **a 10 song playlist** that matches the provided criteria.
  
          **Playlist Requirements:**
          - **Stay true to the user's prompt** while ensuring a diverse and enjoyable mix.
          - **Balance** well-known classics with hidden gems.
          - **Ensure a variety of artists and styles** while staying within the given theme.
          - **Include title, artist** for each song.
  
          **User Input (custom request):** 
          "${prompt}"
  
          **Output Format (STRICT valid JSON):** 
          {
            "playlist": [
              { "title": "Song Name", "artist": "Artist Name"}
            ]
          }
  
          Do **not** include explanations or any extra text. Only return the JSON object.
          `
        },
        {
          role: "user",
          content: `Generate a playlist based on: "${prompt}".`
        }
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
            max_tokens: 400,
            temperature: 0.8,
            n: 1,
          }),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`❌ OpenAI API Error: ${response.status} - ${errorText}`);
        }
  
        const data = await response.json();
        let content = data.choices[0]?.message?.content?.trim();
  
        // Remove markdown code block markers if present
        content = content.replace(/^```json\s*|\s*```$/g, "");
  
        // Ensure JSON parsing is handled properly
        const parsedResponse = content ? JSON.parse(content) : null;
  
        setPromptResponse(parsedResponse);
        return parsedResponse;
      } catch (error) {
        console.error("❌ Error generating playlist:", error);
        return null;
      }
    };
  
    return { promptResponse, generatePlaylist };
  };
  
