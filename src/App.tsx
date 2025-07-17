import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { PlaylistProvider } from "./context/PlaylistContext";
import { ThemeProvider } from "./context/ThemeContext";
import LoginPage from "./components/LoginPage";
import HomePage from "./components/HomePage";
import PlaylistPage from "./components/PlaylistPage";
import LoadingScreen from "./components/LoadingScreen";
import HistoryPage from "./components/HistoryPage";
import SettingsPage from "./components/SettingsPage";

function App() {
  return (
    <ThemeProvider>
      <PlaylistProvider>
        <Router>
          <div className="app">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/playlist" element={<PlaylistPage />} />
              <Route path="/loading" element={<LoadingScreen />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </Router>
      </PlaylistProvider>
    </ThemeProvider>
  );
}

export default App;
