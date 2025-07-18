import { useState, useRef } from "react";
import { Song } from "../context/PlaylistContext";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI_SECRET;

interface PlaylistResponse {
  playlist: Song[];
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const activeRequestRef = useRef<Promise<PlaylistResponse | null> | null>(null);

  const getContextualHints = (): string => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    let timeHint = "";
    if (hour >= 5 && hour < 12) timeHint = "morning";
    else if (hour >= 12 && hour < 17) timeHint = "afternoon"; 
    else if (hour >= 17 && hour < 22) timeHint = "evening";
    else timeHint = "late night";

    const isWeekend = day === 0 || day === 6;
    const workContext = isWeekend ? "weekend" : "weekday";

    return `${timeHint} on a ${workContext} ${dayOfWeek}`;
  };
  
  const generatePlaylist = async (prompt: string, songCount: number = 15): Promise<PlaylistResponse | null> => {
    if (activeRequestRef.current) {
      return activeRequestRef.current;
    }

    if (!OPENAI_API_KEY) {
      console.error("Missing OpenAI API Key!");
      setError("API Key missing. Please check your environment configuration.");
      return null;
    }
    
    setIsLoading(true);
    setError(null);

    const energyMatch = prompt.match(/Energy level: (\d+)\/10/);
    const tempoMatch = prompt.match(/Tempo: (\d+)\/10/);
    const diversityMatch = prompt.match(/Artist diversity: (\d+)\/10/);
    const includeObscure = prompt.includes("Include some obscure/lesser-known tracks");

    const contextHints = getContextualHints();

    const vibeExtractionPrompt = `
      You are a music vibe interpreter with human natural contextual awareness.
      
      User request: "${prompt}"
      Contextual timing: ${contextHints}
      
      Extract the core emotional vibe, naturally considering the time context and any implicit mood cues. 
      If they mention places, activities, or objects, interpret the associated atmosphere and feeling.
      Consider how the current time of day/week might influence the desired mood.
      
      Examples:
      "study music" (evening weekday) → "focused evening concentration with calm determination"
      "workout playlist" (morning weekend) → "energetic weekend motivation with fresh drive"
      "road trip to california" → "freedom, adventure, sunny optimism, open highway feeling"
      
      Respond with ONLY the vibe description.
    `;

    const requestPromise = (async (): Promise<PlaylistResponse | null> => {
      try {
        const vibeResponse = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              { role: "system", content: vibeExtractionPrompt },
              { role: "user", content: prompt }
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        });

        if (!vibeResponse.ok) {
          throw new Error(`Vibe extraction failed: ${vibeResponse.status}`);
        }

        const vibeData = await vibeResponse.json();
        const extractedVibe = vibeData.choices[0]?.message?.content?.trim();

        if (!extractedVibe) {
          throw new Error("Failed to extract vibe");
        }

        const playlistGenerationPrompt = `
          You are an expert AI music curator creating a ${songCount} song playlist.
          
          **Target Vibe:** ${extractedVibe}
          **Context:** ${contextHints}
          
          **Parameters:**
          - ${includeObscure ? 'Mix popular tracks with hidden gems' : 'Focus on well-known, recognizable tracks'}
          ${energyMatch ? `- Energy level: ${energyMatch[1]}/10 ${parseInt(energyMatch[1]) > 5 ? '(high energy, upbeat)' : '(low energy, relaxed)'}` : ''}
          ${tempoMatch ? `- Tempo: ${tempoMatch[1]}/10 ${parseInt(tempoMatch[1]) > 5 ? '(faster paced)' : '(slower paced)'}` : ''}
          ${diversityMatch ? `- Artist diversity: ${diversityMatch[1]}/10 ${parseInt(diversityMatch[1]) > 5 ? '(wide variety of artists)' : '(can repeat artists)'}` : ''}
          
          **Requirements:**
          - Match the target vibe perfectly with natural time awareness
          - Create smooth flow between songs
          - If the original request mentioned specific places/things, you MAY include 1-2 songs that reference them IF they fit the vibe naturally
          
          **Output Format (STRICT JSON):**
          {
            "playlist": [
              { "title": "Song Name", "artist": "Artist Name" }
            ]
          }
        `;

        const playlistResponse = await fetch(OPENAI_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              { role: "system", content: playlistGenerationPrompt },
              { role: "user", content: "Generate the playlist now." }
            ],
            max_tokens: 2000,
            temperature: 0.7,
          }),
        });

        if (!playlistResponse.ok) {
          const errorText = await playlistResponse.text();
          throw new Error(`Playlist generation failed: ${playlistResponse.status} - ${errorText}`);
        }

        const playlistData = await playlistResponse.json();
        let content = playlistData.choices[0]?.message?.content?.trim();
        
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
        console.error("Error generating playlist:", error);
        setError(error instanceof Error ? error.message : "Unknown error occurred");
        return null;
      } finally {
        setIsLoading(false);
        activeRequestRef.current = null;
      }
    })();

    activeRequestRef.current = requestPromise;
    return requestPromise;
  };

  return { generatePlaylist, isLoading, error };
};