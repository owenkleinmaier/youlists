import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPES = [
  "user-read-recently-played",
  "user-top-read",
  "playlist-modify-public",
  "playlist-modify-private",
].join("%20");

const loadingMessages = [
  "Finding your taste...",
  "Exploring your inner thoughts...",
  "Tuning into your vibe...",
  "Scanning for bangers...",
];

function App() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get("access_token");
      if (token) {
        setToken(token);
        window.localStorage.setItem("spotify_token", token);
      }
    }
  }, []);

  const loginToSpotify = () => {
    setLoading(true);
    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[messageIndex]);
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
      window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=${RESPONSE_TYPE}`;
    }, 5000);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Welcome to YouLists</h1>
      {!token ? (
        <>
          {loading ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-xl"
            >
              {loadingMessage}
            </motion.p>
          ) : (
            <button
              onClick={loginToSpotify}
              className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg"
            >
              Login with Spotify
            </button>
          )}
        </>
      ) : (
        <h2 className="text-2xl">Logged In!</h2>
      )}
    </div>
  );
}

export default App;
