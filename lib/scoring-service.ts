import { DatabaseService, Submission, User, Room, Route } from './database';

export interface PlayerScore {
  playerId: string;
  username: string;
  totalPoints: number;
  completedCheckpoints: number;
  totalCheckpoints: number;
  completionRate: number;
  averageTimePerCheckpoint: number;
  rank: number;
  submissions: Submission[];
}

export interface RoomResults {
  roomId: string;
  routeId: string;
  routeName: string;
  totalPlayers: number;
  gameDuration: number;
  totalPossiblePoints: number;
  playerScores: PlayerScore[];
  gameStats: {
    averageCompletionRate: number;
    averageScore: number;
    fastestCompletion: number;
    mostPoints: number;
  };
}

export class ScoringService {
  static async calculateRoomResults(roomId: string): Promise<RoomResults> {
    try {
      const room = await DatabaseService.getRoom(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const route = await DatabaseService.getRoute(room.routeId);
      if (!route) {
        throw new Error('Route not found');
      }

      const submissions = await DatabaseService.getSubmissionsByRoom(roomId);
      const players = await Promise.all(
        (room.players || []).map(playerId => DatabaseService.getUser(playerId))
      );

      const playerScores: PlayerScore[] = [];
      const totalPossiblePoints = route.checkpoints.reduce((sum, cp) => sum + cp.points, 0);

      for (const player of players) {
        if (!player) continue;

        const playerSubmissions = submissions.filter(s => s.playerId === player.id);
        const correctSubmissions = playerSubmissions.filter(s => s.isCorrect);
        
        const totalPoints = correctSubmissions.reduce((sum, s) => sum + s.points, 0);
        const completedCheckpoints = correctSubmissions.length;
        const completionRate = route.checkpoints.length > 0 
          ? (completedCheckpoints / route.checkpoints.length) * 100 
          : 0;

        // Calculate average time per checkpoint (mock for now)
        const averageTimePerCheckpoint = this.calculateAverageTime(playerSubmissions);

        playerScores.push({
          playerId: player.id,
          username: player.username,
          totalPoints,
          completedCheckpoints,
          totalCheckpoints: route.checkpoints.length,
          completionRate,
          averageTimePerCheckpoint,
          rank: 0, // Will be set after sorting
          submissions: playerSubmissions,
        });
      }

      // Sort by points (descending) and assign ranks
      playerScores.sort((a, b) => b.totalPoints - a.totalPoints);
      playerScores.forEach((score, index) => {
        score.rank = index + 1;
      });

      // Calculate game statistics
      const gameStats = this.calculateGameStats(playerScores, totalPossiblePoints);

      // Calculate game duration
      const gameDuration = room.startedAt && room.completedAt
        ? Math.round((room.completedAt.getTime() - room.startedAt.getTime()) / 1000 / 60) // minutes
        : 0;

      return {
        roomId,
        routeId: route.id,
        routeName: route.name,
        totalPlayers: players.length,
        gameDuration,
        totalPossiblePoints,
        playerScores,
        gameStats,
      };
    } catch (error) {
      console.error('Failed to calculate room results:', error);
      throw error;
    }
  }

  private static calculateAverageTime(submissions: Submission[]): number {
    if (submissions.length === 0) return 0;
    
    // Mock calculation - in a real app, you'd track actual time spent
    return Math.random() * 5 + 1; // 1-6 minutes average
  }

  private static calculateGameStats(
    playerScores: PlayerScore[],
    totalPossiblePoints: number
  ) {
    if (playerScores.length === 0) {
      return {
        averageCompletionRate: 0,
        averageScore: 0,
        fastestCompletion: 0,
        mostPoints: 0,
      };
    }

    const averageCompletionRate = playerScores.reduce(
      (sum, score) => sum + score.completionRate, 0
    ) / playerScores.length;

    const averageScore = playerScores.reduce(
      (sum, score) => sum + score.totalPoints, 0
    ) / playerScores.length;

    const fastestCompletion = Math.min(
      ...playerScores.map(score => score.averageTimePerCheckpoint)
    );

    const mostPoints = Math.max(
      ...playerScores.map(score => score.totalPoints)
    );

    return {
      averageCompletionRate: Math.round(averageCompletionRate * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      fastestCompletion: Math.round(fastestCompletion * 100) / 100,
      mostPoints,
    };
  }

  static async updatePlayerStats(playerId: string, gameResults: PlayerScore): Promise<void> {
    try {
      const user = await DatabaseService.getUser(playerId);
      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = await DatabaseService.updateUser(playerId, {
        totalPoints: user.totalPoints + gameResults.totalPoints,
        gamesPlayed: user.gamesPlayed + 1,
      });

      console.log('Updated player stats:', updatedUser);
    } catch (error) {
      console.error('Failed to update player stats:', error);
      throw error;
    }
  }

  static async getPlayerLeaderboard(limit: number = 10): Promise<PlayerScore[]> {
    try {
      const leaderboard = await DatabaseService.getLeaderboard(limit);
      
      return leaderboard.map(entry => ({
        playerId: entry.userId,
        username: entry.username,
        totalPoints: entry.totalPoints,
        completedCheckpoints: 0, // Not tracked in current schema
        totalCheckpoints: 0,
        completionRate: 0,
        averageTimePerCheckpoint: 0,
        rank: 0,
        submissions: [],
      }));
    } catch (error) {
      console.error('Failed to get player leaderboard:', error);
      throw error;
    }
  }

  static calculateBonusPoints(
    basePoints: number,
    timeBonus: boolean,
    streakBonus: number,
    difficultyMultiplier: number
  ): number {
    let bonusPoints = basePoints;

    // Time bonus (10% for quick completion)
    if (timeBonus) {
      bonusPoints += basePoints * 0.1;
    }

    // Streak bonus (5% per consecutive correct answer, max 50%)
    const streakMultiplier = Math.min(1 + (streakBonus * 0.05), 1.5);
    bonusPoints *= streakMultiplier;

    // Difficulty multiplier
    bonusPoints *= difficultyMultiplier;

    return Math.round(bonusPoints);
  }

  static generateScoreBreakdown(playerScore: PlayerScore): {
    basePoints: number;
    timeBonus: number;
    streakBonus: number;
    difficultyBonus: number;
    totalPoints: number;
  } {
    const basePoints = playerScore.submissions
      .filter(s => s.isCorrect)
      .reduce((sum, s) => sum + s.points, 0);

    // Mock calculations for demo
    const timeBonus = basePoints * 0.1; // 10% time bonus
    const streakBonus = basePoints * 0.2; // 20% streak bonus
    const difficultyBonus = basePoints * 0.15; // 15% difficulty bonus

    return {
      basePoints,
      timeBonus,
      streakBonus,
      difficultyBonus,
      totalPoints: playerScore.totalPoints,
    };
  }
}
