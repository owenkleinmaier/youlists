# youlists

ai-powered spotify playlist generator that creates personalized playlists from natural language descriptions.

## features

- **natural language input**: describe your perfect playlist in plain english (e.g., "upbeat indie rock for studying")
- **spotify integration**: automatically creates playlists in your spotify account
- **customizable parameters**: adjust song count, energy, tempo, and artist diversity
- **obscure tracks option**: discover lesser-known gems
- **playlist history**: keep track of all your ai-generated playlists
- **dark/light theme**: choose your preferred viewing mode

## setup

1. clone the repository
2. install dependencies: `npm install`
3. create a `.env` file with your api keys:
   ```
   VITE_OPENAI_API_KEY=your_openai_key
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   ```
4. run the development server: `npm run dev`

## tech stack

- react 19 + typescript
- vite
- openai gpt-4 api
- spotify web api
- react router v7

## usage

1. log in with your spotify account
2. describe the playlist you want
3. adjust advanced settings (optional)
4. generate and enjoy your personalized playlist
