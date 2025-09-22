'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/components/AuthProvider';
import { DatabaseService, Route, Room } from '@/lib/database';
import { MapPin, Users, Trophy, Plus, Play } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [routesData, roomsData] = await Promise.all([
          DatabaseService.getAllRoutes(),
          // For now, we'll get all rooms - in a real app, you'd filter by user
          Promise.resolve([]) // TODO: Implement getRoomsByUser
        ]);
        setRoutes(routesData);
        setRooms(roomsData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === 'admin' 
                ? 'Manage your routes and create new gaming experiences'
                : 'Join games and explore new locations'
              }
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-secondary-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Your Points</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Admin Tools</h2>
                <div className="flex space-x-4">
                  <Link href="/admin/routes/create" className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Route
                  </Link>
                  <Link href="/admin/rooms/create" className="btn btn-secondary">
                    <Play className="w-4 h-4 mr-2" />
                    Create Room
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link href="/admin/routes" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Manage Routes</span>
                        <span className="text-sm text-gray-500">{routes.length} routes</span>
                      </div>
                    </Link>
                    <Link href="/admin/rooms" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Manage Rooms</span>
                        <span className="text-sm text-gray-500">{rooms.length} rooms</span>
                      </div>
                    </Link>
                    <Link href="/admin/analytics" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">View Analytics</span>
                        <span className="text-sm text-gray-500">Stats & reports</span>
                      </div>
                    </Link>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Player Section */}
          {user?.role === 'player' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Join a Game</h2>
                <Link href="/play/join" className="btn btn-primary">
                  <Play className="w-4 h-4 mr-2" />
                  Join Room
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Available Routes</h3>
                  <div className="space-y-3">
                    {routes.length > 0 ? (
                      routes.slice(0, 3).map((route) => (
                        <div key={route.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{route.name}</h4>
                              <p className="text-sm text-gray-600">{route.city} • {route.duration}min</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              route.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                              route.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {route.difficulty}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No routes available yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Start playing to see your progress!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Routes */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Available Routes</h3>
            {routes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {routes.map((route) => (
                  <div key={route.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h4 className="font-semibold text-lg mb-2">{route.name}</h4>
                    <p className="text-gray-600 text-sm mb-3">{route.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{route.city}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        route.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                        route.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {route.difficulty}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-500">{route.duration} minutes</span>
                      <span className="text-sm text-gray-500">{route.checkpoints.length} checkpoints</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No routes available yet. {user?.role === 'admin' && 'Create your first route to get started!'}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
