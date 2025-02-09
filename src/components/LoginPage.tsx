import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const token = new URLSearchParams(hash.substring(1)).get("access_token");
      if (token) {
        setToken(token);
        window.localStorage.setItem("spotify_token", token);
        navigate("/home"); // Redirect to home page after login
      }
    }
  }, [navigate]);

  const loginToSpotify = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}&response_type=${RESPONSE_TYPE}`;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">Welcome to YouLists</h1>
      {!token ? (
        <button
          onClick={loginToSpotify}
          className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg text-lg"
        >
          Login with Spotify
        </button>
      ) : (
        <h2>Redirecting...</h2>
      )}
    </div>
  );
};

export default LoginPage;
