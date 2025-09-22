'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { DatabaseService, Room, Route, User } from '@/lib/database';
import { useAuth } from '@/components/AuthProvider';
import { ArrowLeft, Users, Play, Pause, Trophy, MapPin, Clock } from 'lucide-react';

export default function RoomManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRoomData = async () => {
      try {
        const roomData = await DatabaseService.getRoom(roomId);
        if (!roomData) {
          setError('Room not found');
          return;
        }

        setRoom(roomData);
        
        // Load route data
        const routeData = await DatabaseService.getRoute(roomData.routeId);
        setRoute(routeData);

        // Load player data
        const playerPromises = (roomData.players || []).map(playerId => 
          DatabaseService.getUser(playerId)
        );
        const playerData = await Promise.all(playerPromises);
        setPlayers(playerData.filter(Boolean) as User[]);
      } catch (error) {
        console.error('Failed to load room data:', error);
        setError('Failed to load room data');
      } finally {
        setIsLoading(false);
      }
    };

    loadRoomData();
  }, [roomId]);

  const handleStartGame = async () => {
    if (!room) return;

    try {
      const updatedRoom = await DatabaseService.updateRoom(room.id, {
        status: 'active',
        startedAt: new Date(),
      });
      setRoom(updatedRoom);
    } catch (error) {
      console.error('Failed to start game:', error);
      setError('Failed to start game');
    }
  };

  const handleEndGame = async () => {
    if (!room) return;

    try {
      const updatedRoom = await DatabaseService.updateRoom(room.id, {
        status: 'completed',
        completedAt: new Date(),
      });
      setRoom(updatedRoom);
    } catch (error) {
      console.error('Failed to end game:', error);
      setError('Failed to end game');
    }
  };

  const copyRoomCode = () => {
    if (room?.code) {
      navigator.clipboard.writeText(room.code);
      // TODO: Show success toast
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

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Room Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => router.push('/admin/rooms')}
              className="btn btn-primary"
            >
              Back to Rooms
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
            <p className="text-gray-600 mt-2">
              Manage room: {room.code}
            </p>
          </div>

          {/* Room Status and Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Room Code</h3>
                  <p className="text-3xl font-bold text-primary-600">{room.code}</p>
                </div>
                <button
                  onClick={copyRoomCode}
                  className="btn btn-secondary"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Status</h3>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    room.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                    room.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Players</p>
                  <p className="text-2xl font-bold">{players.length}/{room.maxPlayers}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Game Controls</h3>
                  <p className="text-sm text-gray-600">
                    {room.status === 'waiting' ? 'Ready to start' :
                     room.status === 'active' ? 'Game in progress' :
                     'Game completed'}
                  </p>
                </div>
                <div className="space-x-2">
                  {room.status === 'waiting' && (
                    <button
                      onClick={handleStartGame}
                      disabled={players.length < 1}
                      className="btn btn-success"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </button>
                  )}
                  {room.status === 'active' && (
                    <button
                      onClick={handleEndGame}
                      className="btn btn-danger"
                    >
                      <Pause className="w-4 h-4 mr-2" />
                      End
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Players List */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Players ({players.length})</h2>
              </div>

              {players.length > 0 ? (
                <div className="space-y-3">
                  {players.map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{player.username}</h4>
                          <p className="text-sm text-gray-600">{player.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary-600">
                          {player.totalPoints} pts
                        </p>
                        <p className="text-xs text-gray-500">
                          {player.gamesPlayed} games
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No players joined yet</p>
                  <p className="text-sm">Share the room code to invite players</p>
                </div>
              )}
            </div>

            {/* Route Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Route Information</h2>
              </div>

              {route ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>
                    <p className="text-gray-600">{route.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {route.city}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {route.duration} min
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      route.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      route.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {route.difficulty}
                    </span>
                    <span className="text-sm text-gray-600">
                      {route.checkpoints.length} checkpoints
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Checkpoints</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {route.checkpoints.map((checkpoint, index) => (
                        <div key={checkpoint.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {index + 1}. {checkpoint.name}
                          </span>
                          <span className="text-primary-600 font-medium">
                            {checkpoint.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Route not found</p>
                </div>
              )}
            </div>
          </div>

          {/* Game Progress (if active) */}
          {room.status === 'active' && (
            <div className="card mt-8">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Game Progress</h2>
              </div>
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Game is in progress</p>
                <p className="text-sm">Real-time tracking will be available here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
