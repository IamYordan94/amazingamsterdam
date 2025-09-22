'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { DatabaseService, Room, Route, Checkpoint, Submission } from '@/lib/database';
import { MapComponent } from '@/components/MapComponent';
import { useAuth } from '@/components/AuthProvider';
import { MapPin, Trophy, Users, Clock, CheckCircle, Lock } from 'lucide-react';

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [playerPosition, setPlayerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadGameData = async () => {
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

        // Load submissions
        const submissionsData = await DatabaseService.getSubmissionsByRoom(roomId);
        setSubmissions(submissionsData);

        // Get current player position (mock for now)
        if (typeof window !== 'undefined' && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setPlayerPosition({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.error('Geolocation error:', error);
              // Set a default position for demo purposes
              setPlayerPosition({
                lat: 37.7749,
                lng: -122.4194,
              });
            }
          );
        } else {
          // Set a default position for demo purposes
          setPlayerPosition({
            lat: 37.7749,
            lng: -122.4194,
          });
        }
      } catch (error) {
        console.error('Failed to load game data:', error);
        setError('Failed to load game data');
      } finally {
        setIsLoading(false);
      }
    };

    loadGameData();
  }, [roomId]);

  const getCheckpointStatus = (checkpoint: Checkpoint) => {
    const submission = submissions.find(s => s.checkpointId === checkpoint.id);
    if (submission) {
      return submission.isCorrect ? 'completed' : 'failed';
    }
    return 'locked';
  };

  const getDistanceToCheckpoint = (checkpoint: Checkpoint) => {
    if (!playerPosition) return null;
    
    // Simple distance calculation (not accurate for real GPS)
    const latDiff = checkpoint.latitude - playerPosition.lat;
    const lngDiff = checkpoint.longitude - playerPosition.lng;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
    
    return distance < 0.1 ? 'near' : 'far';
  };

  const handleCheckpointClick = (checkpoint: Checkpoint) => {
    const status = getCheckpointStatus(checkpoint);
    const distance = getDistanceToCheckpoint(checkpoint);
    
    if (status === 'locked' && distance === 'far') {
      alert('You need to get closer to this checkpoint to unlock it!');
      return;
    }
    
    setCurrentCheckpoint(checkpoint);
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

  if (error || !room || !route) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h1>
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Game Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{route.name}</h1>
                <p className="text-gray-600">{route.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Room Code</p>
                <p className="text-2xl font-bold text-primary-600">{room.code}</p>
              </div>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Checkpoints</p>
                    <p className="text-lg font-bold text-gray-900">
                      {submissions.filter(s => s.isCorrect).length}/{route.checkpoints.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="bg-secondary-100 p-2 rounded-lg">
                    <Trophy className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Points</p>
                    <p className="text-lg font-bold text-gray-900">
                      {submissions.reduce((sum, s) => sum + (s.isCorrect ? s.points : 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Players</p>
                    <p className="text-lg font-bold text-gray-900">{room.players?.length || 0}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{room.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Game Map</h2>
                <MapComponent
                  route={route}
                  onCheckpointClick={handleCheckpointClick}
                  height="500px"
                />
              </div>
            </div>

            {/* Checkpoints List */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Checkpoints</h2>
              <div className="space-y-3">
                {route.checkpoints.map((checkpoint, index) => {
                  const status = getCheckpointStatus(checkpoint);
                  const distance = getDistanceToCheckpoint(checkpoint);
                  
                  return (
                    <div
                      key={checkpoint.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        status === 'completed' ? 'bg-green-50 border-green-200' :
                        status === 'failed' ? 'bg-red-50 border-red-200' :
                        distance === 'near' ? 'bg-blue-50 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => handleCheckpointClick(checkpoint)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            status === 'completed' ? 'bg-green-500 text-white' :
                            status === 'failed' ? 'bg-red-500 text-white' :
                            distance === 'near' ? 'bg-blue-500 text-white' :
                            'bg-gray-300 text-gray-600'
                          }`}>
                            {status === 'completed' ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : status === 'failed' ? (
                              <span className="text-xs">✗</span>
                            ) : distance === 'near' ? (
                              <span className="text-xs font-bold">!</span>
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {index + 1}. {checkpoint.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {checkpoint.points} points
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            status === 'completed' ? 'bg-green-100 text-green-800' :
                            status === 'failed' ? 'bg-red-100 text-red-800' :
                            distance === 'near' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {status === 'completed' ? 'Completed' :
                             status === 'failed' ? 'Failed' :
                             distance === 'near' ? 'Nearby' :
                             'Locked'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Challenge Modal would go here */}
          {currentCheckpoint && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-xl font-semibold mb-4">
                  {currentCheckpoint.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {currentCheckpoint.description}
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setCurrentCheckpoint(null)}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Navigate to challenge page
                      setCurrentCheckpoint(null);
                    }}
                    className="btn btn-primary"
                  >
                    Start Challenge
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
