// src/actions/useAI.ts

import { useState, useRef } from "react";
import { Song } from "../context/PlaylistContext";
import { ProcessedImage } from "../utils/imageUtils";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = import.meta.env.VITE_OPEN_AI_SECRET;


interface PlaylistResponse {
  playlist: Song[];
  generatedTitle?: string;
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

  const analyzeImageVibe = async (image: ProcessedImage): Promise<string> => {
    if (!OPENAI_API_KEY) {
      throw new Error("OpenAI API key is missing");
    }

    const imageAnalysisPrompt = `
      You are an expert music vibe interpreter analyzing images to understand the emotional atmosphere and mood they convey.

      Analyze this image and extract the core emotional vibe, mood, and atmosphere that would translate to music preferences. Consider:

      1. **Visual Elements**: Colors, lighting, composition, objects, people, settings
      2. **Emotional Atmosphere**: What feelings does this image evoke?
      3. **Energy Level**: Is it calm/peaceful or energetic/dynamic?
      4. **Musical Associations**: What kind of music would fit this scene/mood?
      5. **Contextual Clues**: Time of day, activity, location, style

      **Examples of good vibe extractions:**
      - Sunset beach photo → "warm, nostalgic, golden hour serenity with gentle waves of emotion"
      - City nightlife → "electric urban energy, neon-lit confidence, late night adventure vibes"
      - Cozy coffee shop → "intimate acoustic warmth, contemplative morning focus, artisanal comfort"
      - Mountain landscape → "expansive freedom, natural majesty, adventure-seeking spirit"

      Respond with ONLY a detailed vibe description (2-3 sentences) that captures the musical essence of this image.
    `;

    try {
      console.log("Analyzing image with OpenAI Vision...");
      
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: imageAnalysisPrompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${image.base64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      console.log("Vision API response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Vision API error:", errorText);
        throw new Error(`Image analysis failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const extractedVibe = data.choices[0]?.message?.content?.trim();

      if (!extractedVibe) {
        throw new Error("Failed to extract vibe from image");
      }

      console.log("Extracted vibe:", extractedVibe);
      return extractedVibe;
    } catch (error) {
      console.error("Error analyzing image:", error);
      throw new Error("Failed to analyze image. Please try again.");
    }
  };

  const generateTitleFromVibe = async (vibe: string): Promise<string> => {
    const titlePrompt = `
      Based on this musical vibe description, generate a creative, short playlist title (2-5 words maximum):
      
      Vibe: "${vibe}"
      
      The title should be:
      - Catchy and memorable
      - Reflective of the mood/atmosphere
      - Not generic (avoid "chill vibes", "good music", etc.)
      - Creative but not overly complex
      
      Examples:
      "warm nostalgic golden hour serenity" → "Golden Hour Dreams"
      "electric urban neon-lit confidence" → "Neon Nights"
      "intimate acoustic morning focus" → "Morning Coffee"
      
      Respond with ONLY the playlist title, no quotes or extra text.
    `;

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: titlePrompt },
            { role: "user", content: vibe }
          ],
          max_tokens: 50,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error(`Title generation failed: ${response.status}`);
      }

      const data = await response.json();
      const title = data.choices[0]?.message?.content?.trim();

      return title || "ai-generated playlist";
    } catch (error) {
      console.error("Error generating title:", error);
      return "ai-generated playlist";
    }
  };
  
  const generatePlaylist = async (
    prompt: string, 
    songCount: number = 15, 
    image: ProcessedImage | null = null
  ): Promise<PlaylistResponse | null> => {
    if (activeRequestRef.current) {
      return activeRequestRef.current;
    }

    if (!OPENAI_API_KEY) {
      console.error("Missing OpenAI API Key!");
      setError("API Key missing. Please check your environment configuration.");
      return null;
    }

    // If no prompt and no image, can't generate
    if (!prompt.trim() && !image) {
      setError("Please provide either a text description or upload an image.");
      return null;
    }
    
    setIsLoading(true);
    setError(null);

    console.log("Starting playlist generation...", { 
      hasPrompt: !!prompt.trim(), 
      hasImage: !!image,
      songCount 
    });

    const energyMatch = prompt.match(/Energy level: (\d+)\/10/);
    const tempoMatch = prompt.match(/Tempo: (\d+)\/10/);
    const diversityMatch = prompt.match(/Artist diversity: (\d+)\/10/);
    const includeObscure = prompt.includes("Include some obscure/lesser-known tracks");

    const contextHints = getContextualHints();

    const requestPromise = (async (): Promise<PlaylistResponse | null> => {
      try {
        let finalVibe = "";
        let generatedTitle = "";

        // Extract vibe from image if provided
        if (image) {
          console.log("Analyzing image for vibe...");
          const imageVibe = await analyzeImageVibe(image);
          console.log("Image vibe extracted:", imageVibe);
          
          if (prompt.trim()) {
            console.log("Combining image vibe with text prompt...");
            // Combine image vibe with text prompt
            const combinedVibePrompt = `
              You have two sources of vibe information:
              1. Image Analysis: "${imageVibe}"
              2. User Text: "${prompt}"
              3. Context: ${contextHints}
              
              Combine these into a single, cohesive musical vibe description that incorporates both the visual atmosphere and the user's text preferences.
              
              Respond with ONLY the combined vibe description.
            `;

            const vibeResponse = await fetch(OPENAI_API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`,
              },
              body: JSON.stringify({
                model: "gpt-4",
                messages: [
                  { role: "system", content: combinedVibePrompt },
                  { role: "user", content: "Combine the vibes now." }
                ],
                max_tokens: 150,
                temperature: 0.7,
              }),
            });

            if (!vibeResponse.ok) {
              const errorText = await vibeResponse.text();
              console.error("Vibe combination error:", errorText);
              throw new Error(`Vibe combination failed: ${vibeResponse.status} - ${errorText}`);
            }

            const vibeData = await vibeResponse.json();
            finalVibe = vibeData.choices[0]?.message?.content?.trim() || imageVibe;
          } else {
            // Use only image vibe
            finalVibe = imageVibe;
            // Generate title from vibe since no text was provided
            console.log("Generating title from vibe...");
            generatedTitle = await generateTitleFromVibe(finalVibe);
          }
        } else {
          console.log("Using text-only vibe extraction...");
          // Use only text prompt vibe extraction (original logic)
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
            const errorText = await vibeResponse.text();
            console.error("Text vibe extraction error:", errorText);
            throw new Error(`Vibe extraction failed: ${vibeResponse.status} - ${errorText}`);
          }

          const vibeData = await vibeResponse.json();
          finalVibe = vibeData.choices[0]?.message?.content?.trim();

          if (!finalVibe) {
            throw new Error("Failed to extract vibe");
          }
        }

        console.log("Final vibe for playlist generation:", finalVibe);

        // Generate playlist using the extracted vibe
        const playlistGenerationPrompt = `
          You are an expert AI music curator creating a ${songCount} song playlist.
          
          **Target Vibe:** ${finalVibe}
          **Context:** ${contextHints}
          
          **Parameters:**
          - ${includeObscure ? 'Mix popular tracks with hidden gems' : 'Focus on well-known, recognizable tracks'}
          ${energyMatch ? `- Energy level: ${energyMatch[1]}/10 ${parseInt(energyMatch[1]) > 5 ? '(high energy, upbeat)' : '(low energy, relaxed)'}` : ''}
          ${tempoMatch ? `- Tempo: ${tempoMatch[1]}/10 ${parseInt(tempoMatch[1]) > 5 ? '(faster paced)' : '(slower paced)'}` : ''}
          ${diversityMatch ? `- Artist diversity: ${diversityMatch[1]}/10 ${parseInt(diversityMatch[1]) > 5 ? '(wide variety of artists)' : '(can repeat artists)'}` : ''}
          
          **Requirements:**
          - Match the target vibe perfectly with natural time awareness
          - Create smooth flow between songs
          - Songs should evoke the same emotional atmosphere as described in the vibe
          
          **Output Format (STRICT JSON):**
          {
            "playlist": [
              { "title": "Song Name", "artist": "Artist Name" }
            ]
          }
        `;

        console.log("Generating playlist...");
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
          console.error("Playlist generation error:", errorText);
          throw new Error(`Playlist generation failed: ${playlistResponse.status} - ${errorText}`);
        }

        const playlistData = await playlistResponse.json();
        let content = playlistData.choices[0]?.message?.content?.trim();
        
        console.log("Raw playlist response:", content);
        
        // Clean up JSON response
        content = content.replace(/^```json\s*|\s*```$/g, "");
        
        let parsedResponse: { playlist: Song[] };
        try {
          parsedResponse = JSON.parse(content);
        } catch (parseError) {
          console.error("Failed to parse playlist JSON:", parseError);
          console.error("Content was:", content);
          throw new Error("Failed to parse playlist response");
        }

        if (parsedResponse && Array.isArray(parsedResponse.playlist)) {
          // Apply diversity filtering if needed
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
          
          // Trim to requested song count
          if (parsedResponse.playlist.length > songCount) {
            parsedResponse.playlist = parsedResponse.playlist.slice(0, songCount);
          }

          console.log("Successfully generated playlist with", parsedResponse.playlist.length, "tracks");
          return {
            playlist: parsedResponse.playlist,
            generatedTitle: generatedTitle || undefined
          };
        }

        throw new Error("Invalid playlist response format");

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