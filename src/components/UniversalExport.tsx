// src/components/UniversalExport.tsx

import React, { useState } from "react";
import { Download, Copy, Share2 } from "lucide-react";
import { Song } from "../context/PlaylistContext";

interface UniversalExportProps {
  playlist: Song[];
  playlistName: string;
}

const UniversalExport: React.FC<UniversalExportProps> = ({
  playlist,
  playlistName,
}) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const generateTextList = (): string => {
    const songList = playlist
      .map((song, index) => `${index + 1}. ${song.title} - ${song.artist}`)
      .join("\n");

    return `${playlistName}\n\n${songList}`;
  };

  const generateCSV = (): string => {
    const header = "Track,Artist,Title\n";
    const rows = playlist
      .map((song, index) => `${index + 1},"${song.artist}","${song.title}"`)
      .join("\n");

    return header + rows;
  };

  const generateJSON = (): string => {
    return JSON.stringify(
      {
        name: playlistName,
        created: new Date().toISOString(),
        tracks: playlist.map((song, index) => ({
          position: index + 1,
          title: song.title,
          artist: song.artist,
        })),
      },
      null,
      2
    );
  };

  const copyToClipboard = async (content: string, format: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const openPlatformSearch = (platform: string, song: Song) => {
    const query = encodeURIComponent(`${song.title} ${song.artist}`);
    const urls = {
      spotify: `https://open.spotify.com/search/${query}`,
      apple: `https://music.apple.com/search?term=${query}`,
      youtube: `https://music.youtube.com/search?q=${query}`,
      amazon: `https://music.amazon.com/search/${query}`,
      deezer: `https://www.deezer.com/search/${query}`,
      tidal: `https://listen.tidal.com/search?q=${query}`,
    };

    window.open(urls[platform as keyof typeof urls], "_blank");
  };

  const sharePlaylist = async () => {
    const textList = generateTextList();

    if (navigator.share) {
      try {
        await navigator.share({
          title: playlistName,
          text: `Check out this playlist I created:\n\n${textList}`,
        });
      } catch (error) {
        copyToClipboard(textList, "share");
      }
    } else {
      copyToClipboard(textList, "share");
    }
  };

  return (
    <div className="universal-export">
      <h3 className="export-title">export your playlist</h3>

      {/* Quick Actions */}
      <div className="export-actions">
        <button
          className="export-action-btn"
          onClick={() => copyToClipboard(generateTextList(), "text")}
        >
          <Copy size={16} />
          {copiedFormat === "text" ? "copied!" : "copy list"}
        </button>

        <button className="export-action-btn" onClick={sharePlaylist}>
          <Share2 size={16} />
          {copiedFormat === "share" ? "copied!" : "share"}
        </button>

        <button
          className="export-action-btn"
          onClick={() =>
            downloadFile(
              generateTextList(),
              `${playlistName}.txt`,
              "text/plain"
            )
          }
        >
          <Download size={16} />
          download
        </button>
      </div>

      {/* Platform Links */}
      <div className="platform-section">
        <h4 className="platform-title">search on platforms:</h4>
        <div className="platform-grid">
          {playlist.slice(0, 3).map((song, index) => (
            <div key={index} className="song-platforms">
              <div className="song-info">
                <span className="song-title">{song.title}</span>
                <span className="song-artist">{song.artist}</span>
              </div>
              <div className="platform-links">
                <button
                  onClick={() => openPlatformSearch("spotify", song)}
                  className="platform-btn spotify"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </button>
                <button
                  onClick={() => openPlatformSearch("apple", song)}
                  className="platform-btn apple"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                </button>
                <button
                  onClick={() => openPlatformSearch("youtube", song)}
                  className="platform-btn youtube"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          {playlist.length > 3 && (
            <div className="more-songs">
              <span>+{playlist.length - 3} more songs</span>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Export Formats */}
      <details className="advanced-export">
        <summary>advanced export options</summary>
        <div className="format-options">
          <button
            className="format-btn"
            onClick={() => copyToClipboard(generateCSV(), "csv")}
          >
            {copiedFormat === "csv" ? "copied!" : "copy as csv"}
          </button>

          <button
            className="format-btn"
            onClick={() => copyToClipboard(generateJSON(), "json")}
          >
            {copiedFormat === "json" ? "copied!" : "copy as json"}
          </button>

          <button
            className="format-btn"
            onClick={() =>
              downloadFile(generateCSV(), `${playlistName}.csv`, "text/csv")
            }
          >
            download csv
          </button>

          <button
            className="format-btn"
            onClick={() =>
              downloadFile(
                generateJSON(),
                `${playlistName}.json`,
                "application/json"
              )
            }
          >
            download json
          </button>
        </div>
      </details>
    </div>
  );
};

export default UniversalExport;
