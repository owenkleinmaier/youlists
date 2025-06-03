import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Volume2,
  Users,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import { usePlaylistContext } from "../context/PlaylistContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";

interface SpotifyUser {
  display_name: string;
  email?: string;
  images?: { url: string }[];
  country?: string;
  product?: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setSongCount } = usePlaylistContext();
  const { theme, colors, toggleTheme } = useTheme();
  const [userInfo, setUserInfo] = useState<SpotifyUser | null>(null);
  const [songCount, setLocalSongCount] = useState(15);
  const [showObscureTracks, setShowObscureTracks] = useState(true);
  const token = localStorage.getItem("spotify_token");

  useEffect(() => {
    if (token) {
      fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((data) => setUserInfo(data))
        .catch((error) => console.error("Error fetching user data:", error));
    } else {
      navigate("/");
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("spotify_token");
    navigate("/");
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${colors.bg.primary}, ${colors.bg.secondary})`,
        color: colors.text.primary
      }}
    >
      <header 
        className="sticky top-0 z-10 backdrop-blur-md border-b"
        style={{
          background: `${colors.bg.overlay}60`,
          borderColor: colors.border.primary
        }}
      >
        <div className="max-w-5xl mx-auto p-4 flex justify-between items-center">
          <Button
            onClick={() => navigate("/home")}
            variant="ghost"
            size="md"
            icon={<ArrowLeft size={16} />}
            tooltip="Return to home page"
          >
            Back to Home
          </Button>
          <Button
            onClick={toggleTheme}
            variant="icon"
            size="md"
            icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            tooltip={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          />
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="mb-8">
          <h1 
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: colors.text.primary }}
          >
            <SettingsIcon size={24} />
            Settings
          </h1>
          <p 
            className="mt-1"
            style={{ color: colors.text.secondary }}
          >
            Customize your YouLists experience
          </p>
        </div>
        {userInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-6 mb-6 backdrop-blur-sm border"
            style={{
              background: `${colors.bg.elevated}80`,
              borderColor: colors.border.primary,
              boxShadow: `0 8px 32px ${colors.bg.overlay}20`
            }}
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  userInfo.images?.[0]?.url || "https://via.placeholder.com/100"
                }
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h2 
                  className="text-xl font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {userInfo.display_name}
                </h2>
                {userInfo.email && (
                  <p style={{ color: colors.text.secondary }}>
                    {userInfo.email}
                  </p>
                )}
                <div className="flex gap-2 mt-1">
                  {userInfo.product && (
                    <span 
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        background: colors.status.success,
                        color: colors.text.inverse
                      }}
                    >
                      {userInfo.product === "premium"
                        ? "Spotify Premium"
                        : "Spotify Free"}
                    </span>
                  )}
                  {userInfo.country && (
                    <span 
                      className="px-2 py-1 rounded text-xs"
                      style={{
                        background: colors.bg.tertiary,
                        color: colors.text.secondary
                      }}
                    >
                      {userInfo.country}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="danger"
              size="md"
              fullWidth
              className="mt-4"
              tooltip="Sign out of your Spotify account"
            >
              Log Out
            </Button>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Theme Setting */}
          <div 
            className="rounded-xl p-6 backdrop-blur-sm border"
            style={{
              background: `${colors.bg.elevated}80`,
              borderColor: colors.border.primary,
              boxShadow: `0 8px 32px ${colors.bg.overlay}20`
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div style={{ color: colors.text.primary }}>
                  {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div>
                  <h3 
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    Theme
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Choose your preferred app theme
                  </p>
                </div>
              </div>
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="relative inline-flex h-6 w-11 items-center rounded-full p-0"
                style={{ background: colors.bg.tertiary }}
                tooltip={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
              >
                <span
                  className={`${
                    theme === 'dark'
                      ? "translate-x-6"
                      : "translate-x-1"
                  } inline-block h-4 w-4 rounded-full transition-transform`}
                  style={{
                    background: theme === 'dark' ? colors.brand.primary : colors.interactive.disabled
                  }}
                />
              </Button>
            </div>
          </div>
          {/* Default Song Count */}
          <div 
            className="rounded-xl p-6 backdrop-blur-sm border"
            style={{
              background: `${colors.bg.elevated}80`,
              borderColor: colors.border.primary,
              boxShadow: `0 8px 32px ${colors.bg.overlay}20`
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div style={{ color: colors.text.primary }}>
                  <Volume2 size={20} />
                </div>
                <div>
                  <h3 
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    Default Playlist Length
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Number of songs to generate by default
                  </p>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between mb-1">
                  <span style={{ color: colors.text.primary }}>
                    {songCount} songs
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={songCount}
                  onChange={(e) => {
                    const count = parseInt(e.target.value);
                    setLocalSongCount(count);
                    setSongCount(count);
                  }}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: colors.bg.tertiary,
                    accentColor: colors.brand.primary
                  }}
                />
                <div 
                  className="flex justify-between text-xs mt-1"
                  style={{ color: colors.text.tertiary }}
                >
                  <span>5</span>
                  <span>50</span>
                </div>
              </div>
            </div>
          </div>
          {/* Obscure Tracks Setting */}
          <div 
            className="rounded-xl p-6 backdrop-blur-sm border"
            style={{
              background: `${colors.bg.elevated}80`,
              borderColor: colors.border.primary,
              boxShadow: `0 8px 32px ${colors.bg.overlay}20`
            }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div style={{ color: colors.text.primary }}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 
                    className="font-medium"
                    style={{ color: colors.text.primary }}
                  >
                    Include Obscure Tracks
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    Mix in lesser-known songs alongside popular ones
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowObscureTracks(!showObscureTracks)}
                variant="ghost"
                size="sm"
                className="relative inline-flex h-6 w-11 items-center rounded-full p-0"
                style={{ background: colors.bg.tertiary }}
                tooltip={showObscureTracks ? "Exclude obscure tracks" : "Include obscure tracks"}
              >
                <span
                  className={`${
                    showObscureTracks
                      ? "translate-x-6"
                      : "translate-x-1"
                  } inline-block h-4 w-4 rounded-full transition-transform`}
                  style={{
                    background: showObscureTracks ? colors.brand.primary : colors.interactive.disabled
                  }}
                />
              </Button>
            </div>
          </div>
          {/* Privacy */}
          <div 
            className="rounded-xl p-6 backdrop-blur-sm border"
            style={{
              background: `${colors.bg.elevated}80`,
              borderColor: colors.border.primary,
              boxShadow: `0 8px 32px ${colors.bg.overlay}20`
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div style={{ color: colors.text.primary }}>
                <Lock size={20} />
              </div>
              <div>
                <h3 
                  className="font-medium"
                  style={{ color: colors.text.primary }}
                >
                  Privacy
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: colors.text.secondary }}
                >
                  Manage your data and privacy settings
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                variant="ghost"
                size="md"
                fullWidth
                className="justify-start"
                tooltip="Remove all saved playlists from history"
                disabled
              >
                Clear Playlist History
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                className="justify-start"
                tooltip="View privacy policy (coming soon)"
                disabled
              >
                Privacy Policy
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                className="justify-start"
                tooltip="View terms of service (coming soon)"
                disabled
              >
                Terms of Service
              </Button>
            </div>
          </div>
          {/* About */}
          <div 
            className="rounded-xl p-6 backdrop-blur-sm border"
            style={{
              background: `${colors.bg.elevated}80`,
              borderColor: colors.border.primary,
              boxShadow: `0 8px 32px ${colors.bg.overlay}20`
            }}
          >
            <h3 
              className="font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              About YouLists
            </h3>
            <p 
              className="text-sm"
              style={{ color: colors.text.secondary }}
            >
              Version 2.0.0
            </p>
            <p 
              className="text-sm mt-2"
              style={{ color: colors.text.secondary }}
            >
              Created with ❤️ for music lovers. YouLists uses AI to create
              personalized playlists.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SettingsPage;
