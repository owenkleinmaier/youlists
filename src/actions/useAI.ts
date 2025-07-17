import { useState } from "react";
import { Song } from "../context/PlaylistContext";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI_SECRET; 

interface PlaylistResponse {
  playlist: Song[];
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generatePlaylist = async (prompt: string, songCount: number = 15): Promise<PlaylistResponse | null> => {
    if (!OPENAI_API_KEY) {
      console.error("❌ Missing OpenAI API Key!");
      setError("API Key missing. Please check your environment configuration.");
      return null;
    }

    setIsLoading(true);
    setError(null);

    const energyMatch = prompt.match(/Energy level: (\d+)\/10/);
    const tempoMatch = prompt.match(/Tempo: (\d+)\/10/);
    const diversityMatch = prompt.match(/Artist diversity: (\d+)\/10/);
    
    const includeObscure = prompt.includes("Include some obscure/lesser-known tracks");
    
    const systemPrompt = `
      You are an expert AI music curator that crafts highly personalized music playlists based on user input.
      You must generate a ${songCount} song playlist that matches the provided criteria.

      **Playlist Requirements:**
      - Stay true to the user's prompt while ensuring a cohesive and enjoyable mix.
      - ${includeObscure ? 'Balance well-known tracks with obscure/lesser-known gems.' : 'Focus on popular, recognizable tracks.'}
      ${energyMatch ? `- Energy level is ${energyMatch[1]}/10. ${parseInt(energyMatch[1]) > 5 ? 'Focus on high-energy, upbeat tracks.' : 'Focus on lower-energy, relaxed tracks.'}` : ''}
      ${tempoMatch ? `- Tempo is ${tempoMatch[1]}/10. ${parseInt(tempoMatch[1]) > 5 ? 'Include more fast-paced songs.' : 'Include more slower-paced songs.'}` : ''}
      ${diversityMatch ? `- Artist diversity is ${diversityMatch[1]}/10. ${parseInt(diversityMatch[1]) > 5 ? 'Include a wide variety of different artists.' : 'It\'s okay to include multiple songs by the same artists.'}` : ''}
      - Include title and artist for each song.
      - Ensure a good flow when listening to the playlist in the provided order.

      **Output Format (STRICT valid JSON):** 
      {
        "playlist": [
          { "title": "Song Name", "artist": "Artist Name"}
        ]
      }

      Do not include explanations or any extra text. Only return the JSON object.
    `;

    try {
      const messages = [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Generate a personalized playlist based on: "${prompt}".`
        }
      ];

      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: messages,
          max_tokens: 2000,
          temperature: 0.7,
          n: 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`❌ OpenAI API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content?.trim();

      content = content.replace(/^```json\s*|\s*```$/g, "");

      const parsedResponse: PlaylistResponse = content ? JSON.parse(content) : null;

      if (parsedResponse && Array.isArray(parsedResponse.playlist)) {
        if (diversityMatch && parseInt(diversityMatch[1]) > 7) {
          const seenArtists = new Set<string>();
          const highDiversityPlaylist = parsedResponse.playlist.filter(song => {
            const artistLower = song.artist.toLowerCase();
            if (seenArtists.has(artistLower)) {
              return false;
            }
            seenArtists.add(artistLower);
            return true;
          });
          
          if (highDiversityPlaylist.length >= Math.min(songCount * 0.8, songCount - 3)) {
            parsedResponse.playlist = highDiversityPlaylist;
          }
        }
        
        if (parsedResponse.playlist.length > songCount) {
          parsedResponse.playlist = parsedResponse.playlist.slice(0, songCount);
        }
      }

      return parsedResponse;
    } catch (error) {
      console.error("❌ Error generating playlist:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generatePlaylist, isLoading, error };
};