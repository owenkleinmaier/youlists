import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Music,
  Disc,
  Headphones,
  ListMusic,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import Button from "./Button";
import { useTheme } from "../context/ThemeContext";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI || window.location.origin;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = [
  "user-read-recently-played",
  "user-top-read",
  "playlist-modify-public",
  "playlist-modify-private",
].join("%20");

const LoginPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const { theme, colors, toggleTheme } = useTheme();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get("access_token");
      if (token) {
        setToken(token);
        window.localStorage.setItem("spotify_token", token);
        setTimeout(() => navigate("/home"), 1000); // Small delay for animation
      }
    }
    setLoading(false);
  }, [navigate]);

  const loginToSpotify = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=${RESPONSE_TYPE}`;
  };

  const features = [
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Personalized Playlists",
      description: "AI-generated tracklists based on your unique preferences",
    },
    {
      icon: <Disc className="w-6 h-6" />,
      title: "Discover New Music",
      description: "Find hidden gems and rediscover forgotten favorites",
    },
    {
      icon: <ListMusic className="w-6 h-6" />,
      title: "One-Click Export",
      description: "Send playlists directly to your Spotify account",
    },
  ];

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{
          background: `linear-gradient(135deg, ${colors.bg.primary}, ${colors.bg.secondary})`,
        }}
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{
            borderTopColor: colors.brand.primary,
            borderBottomColor: colors.brand.primary,
          }}
        ></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, ${colors.bg.primary}, ${colors.bg.secondary})`,
        color: colors.text.primary,
      }}
    >
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="icon"
          size="md"
          onClick={toggleTheme}
          className="backdrop-blur-md"
          tooltip={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              backgroundColor: `${colors.brand.primary}20`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-6xl mx-auto px-4 pt-16 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-16"
        >
          <Music className="w-8 h-8" style={{ color: colors.brand.primary }} />
          <h1
            className="text-3xl font-bold text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(to right, ${colors.brand.primary}, ${colors.brand.secondary})`,
            }}
          >
            YouLists
          </h1>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {/* Left Column - Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <h2
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: colors.text.primary }}
            >
              AI-Powered Music Playlists
              <span className="block" style={{ color: colors.brand.primary }}>
                Tailored Just for You
              </span>
            </h2>

            <p
              className="text-lg mb-8"
              style={{ color: colors.text.secondary }}
            >
              Describe your mood, activity, or vibe, and we'll create the
              perfect playlist using the power of AI. Export directly to Spotify
              with one click.
            </p>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg"
                  style={{
                    backgroundColor: `${colors.bg.elevated}80`,
                    border: `1px solid ${colors.border.primary}`,
                  }}
                >
                  <div className="mt-1" style={{ color: colors.brand.primary }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3
                      className="font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: colors.text.tertiary }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Login */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center backdrop-blur-sm p-8 rounded-2xl shadow-xl"
            style={{
              backgroundColor: `${colors.bg.elevated}50`,
              border: `1px solid ${colors.border.primary}`,
              boxShadow: `0 25px 50px ${colors.bg.overlay}`,
            }}
          >
            {!token ? (
              <>
                <div className="text-center mb-8">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${colors.status.success}, ${colors.brand.primary})`,
                    }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="40"
                      height="40"
                      fill={colors.text.inverse}
                    >
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </motion.div>
                  <h2
                    className="text-2xl font-bold mb-2"
                    style={{ color: colors.text.primary }}
                  >
                    Connect with Spotify
                  </h2>
                  <p className="mb-6" style={{ color: colors.text.tertiary }}>
                    Log in with your Spotify account to start creating and
                    exporting personalized playlists.
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={loginToSpotify}
                    variant="success"
                    size="xl"
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                    tooltip="Connect your Spotify account to get started"
                    animate={false}
                  >
                    Login with Spotify
                  </Button>
                </motion.div>

                <p
                  className="text-xs mt-8 text-center"
                  style={{ color: colors.text.tertiary }}
                >
                  By continuing, you agree to allow YouLists to access your
                  Spotify data in accordance with our Privacy Policy. We only
                  request the permissions needed to create and save playlists.
                </p>
              </>
            ) : (
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 mx-auto mb-6 flex items-center justify-center"
                >
                  <Disc
                    className="w-20 h-20"
                    style={{ color: colors.status.success }}
                  />
                </motion.div>
                <h2
                  className="text-2xl font-bold mb-2"
                  style={{ color: colors.text.primary }}
                >
                  Successfully Logged In!
                </h2>
                <p style={{ color: colors.text.tertiary }}>
                  Redirecting to your dashboard...
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-20 text-center text-sm"
          style={{ color: colors.text.tertiary }}
        >
          <p>
            © {new Date().getFullYear()} Owen Kleinmaier. Not affiliated with
            Spotify.
          </p>
          <p className="mt-1">Made with ❤️ for music lovers</p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
