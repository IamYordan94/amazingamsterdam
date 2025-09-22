'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { DatabaseService, Route, Room } from '@/lib/database';
import { useAuth } from '@/components/AuthProvider';
import { ArrowLeft, Users, Clock, MapPin } from 'lucide-react';

export default function CreateRoomPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routesData = await DatabaseService.getAllRoutes();
        setRoutes(routesData.filter(route => route.isActive));
      } catch (error) {
        console.error('Failed to load routes:', error);
        setError('Failed to load routes');
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    loadRoutes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRoute) {
      setError('Please select a route');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const room = await DatabaseService.createRoom({
        routeId: selectedRoute.id,
        createdBy: user?.id || 'unknown',
        players: [],
        status: 'waiting',
        maxPlayers,
      });

      router.push(`/admin/rooms/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingRoutes) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requireAdmin>
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
            <h1 className="text-3xl font-bold text-gray-900">Create New Room</h1>
            <p className="text-gray-600 mt-2">
              Set up a new gaming session for players to join
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Room Configuration */}
            <div className="card">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card-header">
                  <h2 className="text-xl font-semibold">Room Configuration</h2>
                </div>

                <div>
                  <label htmlFor="route" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Route *
                  </label>
                  <select
                    id="route"
                    required
                    value={selectedRoute?.id || ''}
                    onChange={(e) => {
                      const route = routes.find(r => r.id === e.target.value);
                      setSelectedRoute(route || null);
                    }}
                    className="input"
                  >
                    <option value="">Choose a route...</option>
                    {routes.map((route) => (
                      <option key={route.id} value={route.id}>
                        {route.name} - {route.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Players
                  </label>
                  <input
                    type="number"
                    id="maxPlayers"
                    min="2"
                    max="50"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    className="input"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    How many players can join this room (2-50)
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !selectedRoute}
                    className="btn btn-primary"
                  >
                    {isLoading ? 'Creating...' : 'Create Room'}
                  </button>
                </div>
              </form>
            </div>

            {/* Route Preview */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold">Route Preview</h2>
              </div>

              {selectedRoute ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedRoute.name}</h3>
                    <p className="text-gray-600">{selectedRoute.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {selectedRoute.city}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      {selectedRoute.duration} min
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedRoute.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      selectedRoute.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedRoute.difficulty}
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedRoute.checkpoints.length} checkpoints
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Checkpoints</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedRoute.checkpoints.map((checkpoint, index) => (
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
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a route to see details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
