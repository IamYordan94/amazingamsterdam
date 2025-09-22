'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { useRealtimeService, RoomStats, GameEvent } from '@/lib/realtime-service';
import { DatabaseService, Room } from '@/lib/database';
import { MapComponent } from '@/components/MapComponent';
import { Users, MapPin, Activity, Trophy, Eye } from 'lucide-react';

export default function AdminMonitorPage() {
  const realtimeService = useRealtimeService();
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);
  const [roomStats, setRoomStats] = useState<Map<string, RoomStats>>(new Map());
  const [recentEvents, setRecentEvents] = useState<GameEvent[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load active rooms
        const rooms = await DatabaseService.getAllRoutes(); // TODO: Implement getActiveRooms
        setActiveRooms(rooms.map(route => ({
          id: `room-${route.id}`,
          routeId: route.id,
          code: `ROOM${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
          createdBy: 'admin',
          players: [], // Empty array for now
          status: 'active' as const,
          maxPlayers: 10,
          createdAt: new Date(),
        })));

        // Load room stats
        const statsMap = new Map<string, RoomStats>();
        for (const room of rooms) {
          const stats = await realtimeService.getRoomStats(`room-${room.id}`);
          statsMap.set(`room-${room.id}`, stats);
        }
        setRoomStats(statsMap);

        // Subscribe to real-time updates
        const unsubscribeEvents = realtimeService.subscribe('game_event', (event: GameEvent) => {
          setRecentEvents(prev => [event, ...prev.slice(0, 9)]); // Keep last 10 events
        });

        const unsubscribePositions = realtimeService.subscribe('position_update', (position) => {
          // Update room stats with new position data
          console.log('Position update:', position);
        });

        return () => {
          unsubscribeEvents();
          unsubscribePositions();
        };
      } catch (error) {
        console.error('Failed to load monitoring data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const cleanup = loadData();
    return () => {
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [realtimeService]);

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
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Real-Time Monitoring</h1>
            <p className="text-gray-600 mt-2">
              Monitor active games and player activity in real-time
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{activeRooms.length}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-secondary-100 p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-secondary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Players</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.from(roomStats.values()).reduce((sum, stats) => sum + stats.activePlayers, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Checkpoints</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.from(roomStats.values()).reduce((sum, stats) => sum + stats.completedCheckpoints, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeRooms.length > 0 
                      ? Math.round(Array.from(roomStats.values()).reduce((sum, stats) => sum + stats.gameProgress, 0) / activeRooms.length)
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Rooms */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Active Rooms</h2>
                <div className="space-y-4">
                  {activeRooms.length > 0 ? (
                    activeRooms.map((room) => {
                      const stats = roomStats.get(room.id);
                      return (
                        <div
                          key={room.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedRoom(room)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">Room {room.code}</h3>
                              <p className="text-sm text-gray-600">Route ID: {room.routeId}</p>
                            </div>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                              room.status === 'active' ? 'bg-green-100 text-green-800' :
                              room.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {room.status}
                            </span>
                          </div>

                          {stats && (
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Players</p>
                                <p className="font-semibold">{stats.activePlayers}/{room.maxPlayers}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Progress</p>
                                <p className="font-semibold">{stats.completedCheckpoints}/{stats.totalCheckpoints}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Completion</p>
                                <p className="font-semibold">{stats.gameProgress}%</p>
                              </div>
                            </div>
                          )}

                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${stats?.gameProgress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No active rooms</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
              <div className="space-y-3">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.type === 'player_joined' ? 'bg-green-500' :
                        event.type === 'challenge_completed' ? 'bg-blue-500' :
                        event.type === 'game_started' ? 'bg-purple-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-xs text-gray-600">
                          Room {event.roomId} • {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent events</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Room Detail Modal */}
          {selectedRoom && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Room {selectedRoom.code} Details</h2>
                    <button
                      onClick={() => setSelectedRoom(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Room Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className="font-medium capitalize">{selectedRoom.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Players:</span>
                          <span className="font-medium">{selectedRoom.players?.length || 0}/{selectedRoom.maxPlayers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="font-medium">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Live Map</h3>
                      <div className="h-64">
                        <MapComponent
                          height="100%"
                          center={[37.7749, -122.4194]}
                          zoom={13}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
