// Real-time tracking and communication service
// In a real application, this would use WebSockets or Socket.IO

export interface PlayerPosition {
  playerId: string;
  roomId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy?: number;
}

export interface GameEvent {
  type: 'player_joined' | 'player_left' | 'checkpoint_reached' | 'challenge_completed' | 'game_started' | 'game_ended';
  roomId: string;
  playerId?: string;
  data?: any;
  timestamp: Date;
}

export interface RoomStats {
  roomId: string;
  activePlayers: number;
  completedCheckpoints: number;
  totalCheckpoints: number;
  gameProgress: number;
  leaderboard: Array<{
    playerId: string;
    username: string;
    points: number;
    completedCheckpoints: number;
  }>;
}

export class RealtimeService {
  private static instance: RealtimeService;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private positionUpdateInterval: NodeJS.Timeout | null = null;

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  // Event subscription
  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    const listeners = this.eventListeners.get(eventType)!;
    listeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  // Event emission
  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Position tracking
  startPositionTracking(roomId: string, playerId: string): void {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
    }

    // Check if we're in a browser environment with geolocation
    if (typeof window === 'undefined' || !navigator.geolocation) {
      console.warn('Geolocation not available');
      return;
    }

    this.positionUpdateInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const playerPosition: PlayerPosition = {
            playerId,
            roomId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: new Date(),
            accuracy: position.coords.accuracy,
          };

          this.updatePlayerPosition(playerPosition);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    }, 5000); // Update every 5 seconds
  }

  stopPositionTracking(): void {
    if (this.positionUpdateInterval) {
      clearInterval(this.positionUpdateInterval);
      this.positionUpdateInterval = null;
    }
  }

  async updatePlayerPosition(position: PlayerPosition): Promise<void> {
    try {
      // In a real application, this would send to the server via WebSocket
      // For now, we'll just emit locally
      this.emit('position_update', position);
      
      // Also emit to room-specific listeners
      this.emit(`room_${position.roomId}_positions`, position);
    } catch (error) {
      console.error('Failed to update player position:', error);
    }
  }

  async getPlayerPositions(roomId: string): Promise<PlayerPosition[]> {
    try {
      // In a real application, this would fetch from the server
      // For demo purposes, return empty array
      return [];
    } catch (error) {
      console.error('Failed to get player positions:', error);
      return [];
    }
  }

  // Game events
  async emitGameEvent(event: GameEvent): Promise<void> {
    try {
      // In a real application, this would send to the server via WebSocket
      this.emit('game_event', event);
      this.emit(`room_${event.roomId}_events`, event);
    } catch (error) {
      console.error('Failed to emit game event:', error);
    }
  }

  // Room statistics
  async getRoomStats(roomId: string): Promise<RoomStats> {
    try {
      // In a real application, this would fetch from the server
      // For demo purposes, return mock data
      return {
        roomId,
        activePlayers: 0,
        completedCheckpoints: 0,
        totalCheckpoints: 0,
        gameProgress: 0,
        leaderboard: [],
      };
    } catch (error) {
      console.error('Failed to get room stats:', error);
      throw error;
    }
  }

  // Admin monitoring
  async getAdminDashboardData(): Promise<{
    activeRooms: number;
    totalPlayers: number;
    recentEvents: GameEvent[];
  }> {
    try {
      // In a real application, this would fetch from the server
      return {
        activeRooms: 0,
        totalPlayers: 0,
        recentEvents: [],
      };
    } catch (error) {
      console.error('Failed to get admin dashboard data:', error);
      throw error;
    }
  }

  // Cleanup
  destroy(): void {
    this.stopPositionTracking();
    this.eventListeners.clear();
  }
}

// Hook for React components
export function useRealtimeService() {
  return RealtimeService.getInstance();
}
