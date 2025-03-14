<<<<<<< HEAD
# YouLists - AI-Powered Spotify Playlist Generator

YouLists is a web application that leverages AI to generate personalized music playlists based on your mood, activity, or vibe, and exports them directly to Spotify.

## Features

- **AI-Powered Playlist Generation**: Describe your mood, activity, or vibe, and get tailored playlists
- **Spotify Integration**: Export playlists directly to your Spotify account with one click
- **Advanced Customization**: Fine-tune parameters like energy level, tempo, artist diversity, and more
- **Playlist History**: Save and access your previously generated playlists
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Customization**: Multiple theme options to personalize your experience

## Tech Stack

- **Frontend**: React 19, TypeScript, TailwindCSS
- **Authentication**: Spotify OAuth
- **AI Integration**: OpenAI API
- **Build Tool**: Vite
- **Motion**: Framer Motion for smooth animations
- **Icons**: Lucide React for consistent iconography
=======
YouLists - AI-Powered Spotify Playlist Generator
Show Image
YouLists is a web application that leverages AI to generate personalized music playlists based on your mood, activity, or vibe, and exports them directly to Spotify.
Features

AI-Powered Playlist Generation: Describe your mood, activity, or vibe, and get tailored playlists
Spotify Integration: Export playlists directly to your Spotify account with one click
Advanced Customization: Fine-tune parameters like energy level, tempo, artist diversity, and more
Playlist History: Save and access your previously generated playlists
Responsive Design: Works on desktop and mobile devices
Theme Customization: Multiple theme options to personalize your experience

Tech Stack

Frontend: React 19, TypeScript, TailwindCSS
Authentication: Spotify OAuth
AI Integration: OpenAI API
Build Tool: Vite
Motion: Framer Motion for smooth animations
Icons: Lucide React for consistent iconography

Screenshots
<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
  <img src="https://via.placeholder.com/400x250?text=Login+Screen" alt="Login Screen" width="400"/>
  <img src="https://via.placeholder.com/400x250?text=Home+Page" alt="Home Page" width="400"/>
  <img src="https://via.placeholder.com/400x250?text=Playlist+Generation" alt="Playlist Generation" width="400"/>
  <img src="https://via.placeholder.com/400x250?text=Playlist+View" alt="Playlist View" width="400"/>
</div>
Installation
Prerequisites

Node.js (v18.18.0 or higher)
Spotify Developer Account (for API access)
OpenAI API Key

Setup

Clone the repository:
bashCopygit clone https://github.com/yourusername/youlists.git
cd youlists

Install dependencies:
bashCopynpm install

Create a .env file in the root directory with the following variables:
CopyVITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_REDIRECT_URI=http://localhost:5173
VITE_OPEN_AI_SECRET=your_openai_api_key

Start the development server:
bashCopynpm run dev

Open your browser and navigate to http://localhost:5173

Usage

Login: Authenticate with your Spotify account
Create a Playlist:

Describe your desired playlist in the text field
Use suggestion chips for quick inputs
Adjust the number of songs and other parameters


Export: Generate your playlist and export directly to Spotify
History: Access your previously generated playlists from the history page

Project Structure
Copyyoulists-app/
├── public/           # Static assets
├── src/
│   ├── actions/      # Custom hooks for API interactions
│   ├── components/   # React components
│   ├── context/      # React context providers
│   ├── App.tsx       # Main application component
│   └── main.tsx      # Application entry point
├── .env              # Environment variables (not in repo)
├── index.html        # HTML entry point
├── package.json      # Project dependencies
├── tsconfig.json     # TypeScript configuration
└── vite.config.ts    # Vite configuration
Configuration
Spotify API
To use the Spotify API, you need to:

Create a Spotify Developer account
Create a new application
Set the Redirect URI to your application URL
Add the Client ID to your .env file

OpenAI API
For the AI playlist generation:

Create an OpenAI account
Generate an API key
Add the API key to your .env file

Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Fork the repository
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add some amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Future Improvements

 Add user preference learning based on liked/disliked songs
 Implement collaborative playlist creation
 Add genre-specific customization options
 Integrate more music streaming platforms
 Add local music file support
 Implement AI-based playlist cover generation

License
This project is licensed under the MIT License - see the LICENSE file for details.
Acknowledgements

Spotify Web API
OpenAI API
React
Vite
TailwindCSS
Lucide Icons
Framer Motion


Made with ❤️ by Owen Kleinmaier
>>>>>>> ac4212bfe133f34d0b1561cfb58869a1ebca1124
