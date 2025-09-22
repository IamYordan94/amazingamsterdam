// Simple in-memory database for Vercel deployment
// In a production app, you'd use a proper database like PostgreSQL or MongoDB

interface InMemoryDB {
  users: Map<string, any>;
  routes: Map<string, any>;
  checkpoints: Map<string, any>;
  rooms: Map<string, any>;
  roomPlayers: Map<string, Set<string>>;
  submissions: Map<string, any>;
  playerPositions: Map<string, any>;
}

// Global in-memory database
const db: InMemoryDB = {
  users: new Map(),
  routes: new Map(),
  checkpoints: new Map(),
  rooms: new Map(),
  roomPlayers: new Map(),
  submissions: new Map(),
  playerPositions: new Map(),
};

// Helper function to generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Database schema types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'player';
  createdAt: Date;
  totalPoints: number;
  gamesPlayed: number;
}

export interface Route {
  id: string;
  name: string;
  description: string;
  city: string;
  theme: string;
  duration: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
  checkpoints: Checkpoint[];
}

export interface Checkpoint {
  id: string;
  routeId: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  orderIndex: number;
  points: number;
  challengeType: 'trivia' | 'word_puzzle' | 'photo_proof';
  challengeQuestion?: string;
  challengeAnswer?: string;
  challengeOptions?: string[];
  challengeHint?: string;
  challengePhotoPrompt?: string;
}

export interface Room {
  id: string;
  routeId: string;
  code: string;
  createdBy: string;
  status: 'waiting' | 'active' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  maxPlayers: number;
  createdAt: Date;
  players?: string[]; // Optional players array for display purposes
}

export interface Submission {
  id: string;
  roomId: string;
  playerId: string;
  checkpointId: string;
  answer?: string;
  photoUrl?: string;
  isCorrect: boolean;
  points: number;
  submittedAt: Date;
}

export interface PlayerPosition {
  playerId: string;
  roomId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
}

export interface LeaderboardEntry {
  user: User;
  totalPoints: number;
  gamesPlayed: number;
  averageScore: number;
}

// Database helper functions
export class DatabaseService {
  // User operations
  static async createUser(user: Omit<User, 'id' | 'createdAt' | 'totalPoints' | 'gamesPlayed'>): Promise<User> {
    // Check if user already exists
    for (const existingUser of db.users.values()) {
      if (existingUser.email === user.email) {
        throw new Error('User with this email already exists');
      }
    }
    
    const id = generateId('user');
    const newUser: User = {
      id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: new Date(),
      totalPoints: 0,
      gamesPlayed: 0,
    };
    
    db.users.set(id, newUser);
    return newUser;
  }

  static async getUser(id: string): Promise<User | null> {
    return db.users.get(id) || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    for (const user of db.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await this.getUser(id);
    if (!user) return null;
    
    const updatedUser = { ...user, ...updates };
    db.users.set(id, updatedUser);
    return updatedUser;
  }

  // Route operations
  static async createRoute(route: Omit<Route, 'id' | 'createdAt' | 'checkpoints'>): Promise<Route> {
    const id = generateId('route');
    const newRoute: Route = {
      ...route,
      id,
      createdAt: new Date(),
      checkpoints: [],
    };
    
    db.routes.set(id, newRoute);
    return newRoute;
  }

  static async getRoute(id: string): Promise<Route | null> {
    const route = db.routes.get(id);
    if (!route) return null;
    
    // Get checkpoints for this route
    const checkpoints = Array.from(db.checkpoints.values())
      .filter(cp => cp.routeId === id)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    
    return {
      ...route,
      checkpoints,
    };
  }

  static async getRoutesByUser(userId: string): Promise<Route[]> {
    return Array.from(db.routes.values())
      .filter(route => route.createdBy === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async getAllRoutes(): Promise<Route[]> {
    return Array.from(db.routes.values())
      .filter(route => route.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Checkpoint operations
  static async createCheckpoint(checkpoint: Omit<Checkpoint, 'id'>): Promise<Checkpoint> {
    const id = generateId('checkpoint');
    const newCheckpoint: Checkpoint = {
      ...checkpoint,
      id,
    };
    
    db.checkpoints.set(id, newCheckpoint);
    return newCheckpoint;
  }

  static async getCheckpointsByRoute(routeId: string): Promise<Checkpoint[]> {
    return Array.from(db.checkpoints.values())
      .filter(cp => cp.routeId === routeId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  static async getCheckpoint(id: string): Promise<Checkpoint | null> {
    return db.checkpoints.get(id) || null;
  }

  // Room operations
  static async createRoom(room: Omit<Room, 'id' | 'code'>): Promise<Room> {
    const id = generateId('room');
    let code: string;
    let attempts = 0;

    // Ensure unique room code
    do {
      code = Math.random().toString(36).substr(2, 6).toUpperCase();
      attempts++;

      if (attempts > 10) {
        throw new Error('Failed to generate unique room code');
      }
    } while (await this.getRoomByCode(code));

    const newRoom: Room = {
      ...room,
      id,
      code,
    };
    
    db.rooms.set(id, newRoom);
    db.roomPlayers.set(id, new Set());
    return newRoom;
  }

  static async getRoom(id: string): Promise<Room | null> {
    return db.rooms.get(id) || null;
  }

  static async getRoomByCode(code: string): Promise<Room | null> {
    for (const room of db.rooms.values()) {
      if (room.code === code) {
        return room;
      }
    }
    return null;
  }

  static async updateRoom(id: string, updates: Partial<Room>): Promise<Room | null> {
    const room = await this.getRoom(id);
    if (!room) return null;
    
    const updatedRoom = { ...room, ...updates };
    db.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  static async addPlayerToRoom(roomId: string, playerId: string): Promise<boolean> {
    const room = await this.getRoom(roomId);
    if (!room) return false;
    
    const players = db.roomPlayers.get(roomId) || new Set();
    if (players.size >= room.maxPlayers) return false;
    
    players.add(playerId);
    db.roomPlayers.set(roomId, players);
    return true;
  }

  static async removePlayerFromRoom(roomId: string, playerId: string): Promise<boolean> {
    const players = db.roomPlayers.get(roomId);
    if (!players) return false;
    
    players.delete(playerId);
    return true;
  }

  static async getRoomPlayers(roomId: string): Promise<string[]> {
    const players = db.roomPlayers.get(roomId);
    return players ? Array.from(players) : [];
  }

  // Submission operations
  static async createSubmission(submission: Omit<Submission, 'id' | 'submittedAt'>): Promise<Submission> {
    const id = generateId('submission');
    const newSubmission: Submission = {
      ...submission,
      id,
      submittedAt: new Date(),
    };
    
    db.submissions.set(id, newSubmission);
    return newSubmission;
  }

  static async getSubmissionsByRoom(roomId: string): Promise<Submission[]> {
    return Array.from(db.submissions.values())
      .filter(sub => sub.roomId === roomId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  static async getSubmissionsByPlayer(playerId: string): Promise<Submission[]> {
    return Array.from(db.submissions.values())
      .filter(sub => sub.playerId === playerId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // Player position operations
  static async updatePlayerPosition(position: PlayerPosition): Promise<void> {
    const key = `${position.playerId}_${position.roomId}`;
    db.playerPositions.set(key, position);
  }

  static async getPlayerPosition(playerId: string, roomId: string): Promise<PlayerPosition | null> {
    const key = `${playerId}_${roomId}`;
    return db.playerPositions.get(key) || null;
  }

  static async getRoomPlayerPositions(roomId: string): Promise<PlayerPosition[]> {
    return Array.from(db.playerPositions.values())
      .filter(pos => pos.roomId === roomId);
  }

  // Leaderboard operations
  static async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const users = Array.from(db.users.values());
    
    return users
      .map(user => ({
        user,
        totalPoints: user.totalPoints,
        gamesPlayed: user.gamesPlayed,
        averageScore: user.gamesPlayed > 0 ? user.totalPoints / user.gamesPlayed : 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
  }
}