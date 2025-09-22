'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { DatabaseService, Room, Route } from '@/lib/database';
import { useAuth } from '@/components/AuthProvider';
import { ArrowLeft, Users, MapPin, Clock, Play } from 'lucide-react';

export default function JoinRoomPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const roomData = await DatabaseService.getRoomByCode(roomCode.toUpperCase());
      if (!roomData) {
        setError('Room not found. Please check the code and try again.');
        return;
      }

      if (roomData.status !== 'waiting') {
        setError('This room is not accepting new players.');
        return;
      }

      if ((roomData.players?.length || 0) >= roomData.maxPlayers) {
        setError('This room is full.');
        return;
      }

      setRoom(roomData);
      
      // Load route data
      const routeData = await DatabaseService.getRoute(roomData.routeId);
      setRoute(routeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmJoin = async () => {
    if (!room || !user) return;

    try {
      // TODO: Add current user to room players
      // For now, we'll just navigate to the game
      router.push(`/play/room/${room.id}`);
    } catch (error) {
      setError('Failed to join room');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Join a Game</h1>
            <p className="text-gray-600 mt-2">
              Enter a room code to join an active game session
            </p>
          </div>

          {!room ? (
            <div className="max-w-md mx-auto">
              <div className="card">
                <form onSubmit={handleJoinRoom} className="space-y-6">
                  <div>
                    <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Room Code
                    </label>
                    <input
                      type="text"
                      id="roomCode"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="input text-center text-2xl font-mono tracking-wider"
                      placeholder="ABC123"
                      maxLength={6}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Enter the 6-character room code provided by the game host
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !roomCode.trim()}
                    className="w-full btn btn-primary"
                  >
                    {isLoading ? 'Joining...' : 'Join Room'}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="card">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Room Found!</h2>
                  <p className="text-gray-600">Review the game details before joining</p>
                </div>

                {route && (
                  <div className="space-y-6">
                    {/* Room Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Room: {room.code}</h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                          room.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                          room.status === 'active' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {room.players?.length || 0}/{room.maxPlayers} players
                      </div>
                    </div>

                    {/* Route Info */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3">{route.name}</h3>
                      <p className="text-gray-600 mb-4">{route.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {route.city}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {route.duration} minutes
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
                    </div>

                    {/* Checkpoints Preview */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Checkpoints</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {route.checkpoints.slice(0, 3).map((checkpoint, index) => (
                          <div key={checkpoint.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {index + 1}. {checkpoint.name}
                            </span>
                            <span className="text-primary-600 font-medium">
                              {checkpoint.points} pts
                            </span>
                          </div>
                        ))}
                        {route.checkpoints.length > 3 && (
                          <p className="text-sm text-gray-500 text-center">
                            ... and {route.checkpoints.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Join Button */}
                    <div className="flex space-x-4">
                      <button
                        onClick={() => {
                          setRoom(null);
                          setRoute(null);
                          setRoomCode('');
                        }}
                        className="flex-1 btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmJoin}
                        className="flex-1 btn btn-primary"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Join Game
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
