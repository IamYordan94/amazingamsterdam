'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { ScoringService, RoomResults, PlayerScore } from '@/lib/scoring-service';
import { Trophy, Medal, Clock, Target, Users, Award } from 'lucide-react';

export default function GameResultsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [results, setResults] = useState<RoomResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResults = async () => {
      try {
        const gameResults = await ScoringService.calculateRoomResults(roomId);
        setResults(gameResults);
      } catch (error) {
        console.error('Failed to load game results:', error);
        setError('Failed to load game results');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [roomId]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">
          {rank}
        </span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gray-50 border-gray-200';
      case 3:
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Results Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Game Complete!</h1>
            <p className="text-xl text-gray-600">{results.routeName}</p>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{results.totalPlayers}</h3>
              <p className="text-gray-600">Players</p>
            </div>

            <div className="card text-center">
              <div className="bg-secondary-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-secondary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{results.gameDuration}</h3>
              <p className="text-gray-600">Minutes</p>
            </div>

            <div className="card text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{results.gameStats.averageCompletionRate}%</h3>
              <p className="text-gray-600">Avg Completion</p>
            </div>

            <div className="card text-center">
              <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{results.gameStats.mostPoints}</h3>
              <p className="text-gray-600">High Score</p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-2xl font-semibold">Final Leaderboard</h2>
              <p className="text-gray-600">Congratulations to all players!</p>
            </div>

            <div className="space-y-4">
              {results.playerScores.map((player, index) => (
                <div
                  key={player.playerId}
                  className={`p-4 rounded-lg border-2 ${getRankColor(player.rank)} ${
                    index < 3 ? 'shadow-md' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(player.rank)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {player.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {player.completedCheckpoints}/{player.totalCheckpoints} checkpoints
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {player.totalPoints}
                      </div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(player.completionRate)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${player.completionRate}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Avg Time:</span>
                      <span className="ml-2 font-medium">
                        {player.averageTimePerCheckpoint.toFixed(1)} min
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Completion:</span>
                      <span className="ml-2 font-medium">
                        {Math.round(player.completionRate)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Game Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Game Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route:</span>
                  <span className="font-medium">{results.routeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{results.gameDuration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Points Available:</span>
                  <span className="font-medium">{results.totalPossiblePoints}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Score:</span>
                  <span className="font-medium">{results.gameStats.averageScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fastest Completion:</span>
                  <span className="font-medium">{results.gameStats.fastestCompletion} min</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Achievements</h3>
              <div className="space-y-3">
                {results.playerScores.length > 0 && (
                  <>
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm">
                        <strong>{results.playerScores[0].username}</strong> won with {results.playerScores[0].totalPoints} points!
                      </span>
                    </div>
                    {results.gameStats.mostPoints > 0 && (
                      <div className="flex items-center space-x-3">
                        <Award className="w-5 h-5 text-purple-500" />
                        <span className="text-sm">
                          High score: <strong>{results.gameStats.mostPoints}</strong> points
                        </span>
                      </div>
                    )}
                    {results.gameStats.fastestCompletion > 0 && (
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-green-500" />
                        <span className="text-sm">
                          Fastest completion: <strong>{results.gameStats.fastestCompletion}</strong> minutes
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push('/play/join')}
              className="btn btn-secondary"
            >
              Join Another Game
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
