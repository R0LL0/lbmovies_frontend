# LB Movies - Modern Movie & Series Discovery Platform

A modern, responsive web application for discovering and exploring movies and TV series, built with React and powered by The Movie Database (TMDB) API.

## 🎬 Features

- **Movie & Series Discovery**: Browse popular movies and TV series
- **Advanced Search**: Search for movies and series with real-time results
- **Detailed Information**: View comprehensive details including cast, trailers, reviews, and watch providers
- **Social Features**:
  - Comment on movies and series
  - Follow other users
  - Activity feed to see what friends are watching
  - Similar users discovery
- **User Profiles**: 
  - Save favorites and watchlist
  - View followers and following
  - Edit profile information
- **Secure Authentication**: User signup/signin with email confirmation via Supabase
- **Responsive Design**: Beautiful, modern UI that works on all devices

## 🚀 Tech Stack

- **Frontend**: React 18, React Router
- **UI Components**: Material-UI (MUI)
- **Backend**: Supabase (Authentication & Database)
- **API**: The Movie Database (TMDB) via Netlify Functions
- **Deployment**: Netlify
- **Styling**: Modern CSS with glassmorphism effects

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/R0LL0/lbmovies_frontend.git
cd lbmovies_frontend
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm start
```

## 🔧 Configuration

### Supabase Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema to create necessary tables (see Supabase dashboard)
3. Configure authentication settings
4. Add your Supabase credentials to `.env`

### Netlify Deployment
1. Connect your GitHub repository to Netlify
2. Add environment variables in Netlify:
   - `TMDB_API_KEY`: Your TMDB API key
   - `REACT_APP_SUPABASE_URL`: Your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anon key
3. Deploy!

## 🎯 Key Features Explained

### Secure API Calls
All TMDB API calls go through Netlify Functions, keeping your API key secure on the server side. No API keys are exposed in the client-side code.

### Social Interactions
- **Comments**: Users can comment on movies and series
- **Following**: Follow other users to see their activity
- **Activity Feed**: Real-time feed of activities from users you follow
- **Similar Users**: Discover users with similar movie preferences

### User Data
- Favorites and watchlist are stored in Supabase
- User profiles with customizable information
- Social connections and activity tracking

## 📱 Pages

- **Home**: Browse popular movies and series
- **Movie Detail**: Comprehensive movie information
- **Series Detail**: Comprehensive series information
- **Profile**: User profile with favorites, watchlist, and social features
- **Activity Feed**: See what your friends are watching
- **Login/Signup**: User authentication

## 🔒 Security

- API keys stored securely in environment variables
- All API calls proxied through Netlify Functions
- Row Level Security (RLS) enabled on all database tables
- Secure authentication with Supabase

## 🛠️ Development

### Available Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run tests
- `npm run eject`: Eject from Create React App

### Project Structure

```
src/
├── components/      # Reusable components
├── pages/          # Page components
├── services/       # API and service functions
├── utils/          # Utility functions
└── config/         # Configuration files
```

## 📄 License

All Rights Reserved, LB Movies © 2024

Designed & Developed by [R0LL0](https://github.com/R0LL0)

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for the API
- [Supabase](https://supabase.com/) for backend services
- [Netlify](https://netlify.com/) for hosting and serverless functions
