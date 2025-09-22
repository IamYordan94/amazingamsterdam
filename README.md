# Location-Based Gaming Platform

A comprehensive location-based gaming platform with admin route creation, AI-generated challenges, GPS checkpoint unlocking, and real-time player tracking.

## Features

### 🎮 Core Gaming Features
- **GPS Checkpoint System**: Unlock challenges by reaching specific locations
- **AI-Generated Challenges**: Dynamic challenges created by OpenAI based on location and theme
- **Real-Time Multiplayer**: Compete with friends and strangers in live gaming sessions
- **Multiple Challenge Types**: Trivia questions, word puzzles, and photo proof challenges
- **Scoring System**: Points calculation with bonuses and leaderboards

### 👥 User Management
- **Role-Based Access**: Admin and player roles with different permissions
- **User Authentication**: Secure sign-up and sign-in system
- **Player Profiles**: Track points, games played, and achievements
- **Leaderboards**: Global and room-specific rankings

### 🗺️ Admin Features
- **Route Creation**: Design custom routes with city, theme, duration, and difficulty
- **AI Route Generation**: Automatically generate checkpoints and challenges
- **Room Management**: Create, manage, and monitor game sessions
- **Real-Time Monitoring**: Track player positions and game progress
- **Analytics Dashboard**: View game statistics and player performance

### 📱 Technical Features
- **Interactive Maps**: Leaflet-based map visualization with route display
- **Photo Upload**: Object storage for landmark proof challenges
- **Real-Time Tracking**: WebSocket-based position updates and game events
- **Mobile Responsive**: Optimized for all device sizes
- **Modern UI**: Clean design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet with React-Leaflet
- **Database**: SQLite (built-in)
- **Authentication**: Custom auth system with role-based access
- **AI**: OpenAI GPT-4 for challenge generation
- **Real-Time**: WebSocket-based communication
- **File Storage**: Object storage for photos

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- No additional accounts needed (uses built-in SQLite)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd location-gaming-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your environment variables:
```
OPENAI_API_KEY=your_openai_api_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXTAUTH_SECRET=your_random_secret_string
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin-only pages
│   │   ├── routes/        # Route management
│   │   ├── rooms/         # Room management
│   │   └── monitor/       # Real-time monitoring
│   ├── auth/              # Authentication pages
│   ├── play/              # Player game interface
│   └── dashboard/         # User dashboard
├── components/            # Reusable React components
│   ├── AuthProvider.tsx   # Authentication context
│   ├── MapComponent.tsx   # Interactive map
│   ├── Navbar.tsx         # Navigation bar
│   └── ProtectedRoute.tsx # Route protection
├── lib/                   # Utility libraries
│   ├── ai-service.ts      # OpenAI integration
│   ├── auth.ts           # Authentication logic
│   ├── database.ts       # Database operations
│   ├── photo-service.ts  # Photo upload handling
│   ├── realtime-service.ts # Real-time communication
│   ├── scoring-service.ts # Scoring calculations
│   └── validation-service.ts # Challenge validation
└── public/               # Static assets
```

## Usage

### For Players

1. **Sign Up**: Create an account and choose your role
2. **Join Game**: Enter a room code to join an active game
3. **Navigate**: Use GPS to find checkpoints on the map
4. **Complete Challenges**: Solve trivia, puzzles, or take photos
5. **Compete**: Earn points and climb the leaderboard

### For Admins

1. **Create Routes**: Design custom routes with themes and difficulty levels
2. **Generate with AI**: Use AI to automatically create checkpoints and challenges
3. **Manage Rooms**: Create game sessions and invite players
4. **Monitor Games**: Track player progress in real-time
5. **View Analytics**: Analyze game performance and player engagement

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user

### Routes
- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create new route
- `GET /api/routes/[id]` - Get specific route
- `PUT /api/routes/[id]` - Update route
- `DELETE /api/routes/[id]` - Delete route

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms/[id]` - Get specific room
- `PUT /api/rooms/[id]` - Update room
- `POST /api/rooms/[id]/join` - Join room

### Challenges
- `GET /api/challenges/[id]` - Get challenge details
- `POST /api/challenges/[id]/submit` - Submit challenge answer
- `POST /api/challenges/[id]/photo` - Upload photo for challenge

## Database Schema

### Users
- `id`: Unique user identifier
- `username`: Display name
- `email`: User email
- `role`: 'admin' or 'player'
- `totalPoints`: Cumulative points
- `gamesPlayed`: Number of games completed

### Routes
- `id`: Unique route identifier
- `name`: Route name
- `description`: Route description
- `city`: City location
- `theme`: Route theme
- `duration`: Estimated duration in minutes
- `difficulty`: 'easy', 'medium', or 'hard'
- `checkpoints`: Array of checkpoint objects

### Checkpoints
- `id`: Unique checkpoint identifier
- `name`: Checkpoint name
- `description`: Checkpoint description
- `latitude`: GPS latitude
- `longitude`: GPS longitude
- `challenge`: Challenge object
- `points`: Points awarded

### Rooms
- `id`: Unique room identifier
- `code`: 6-character room code
- `routeId`: Associated route
- `players`: Array of player IDs
- `status`: 'waiting', 'active', or 'completed'
- `maxPlayers`: Maximum players allowed

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@locationgaming.com or create an issue in the repository.

## Roadmap

- [ ] Social features (friends, teams)
- [ ] Advanced AI challenge generation
- [ ] Augmented reality integration
- [ ] Mobile app development
- [ ] Tournament system
- [ ] Custom themes and branding
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
