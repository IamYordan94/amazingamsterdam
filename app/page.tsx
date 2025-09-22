'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { DatabaseService, LeaderboardEntry } from '@/lib/database';
import { Trophy, MapPin, Users, Zap, Shield, Smartphone } from 'lucide-react';

export default function HomePage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await DatabaseService.getLeaderboard(5);
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Location-Based Gaming
              <span className="block text-secondary-400">Reimagined</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Explore your city like never before with AI-generated challenges, 
              GPS checkpoints, and real-time multiplayer experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn btn-secondary text-lg px-8 py-3">
                Start Playing
              </Link>
              <Link href="/auth/signin" className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of location-based gaming with cutting-edge features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">GPS Checkpoints</h3>
              <p className="text-gray-600">
                Unlock challenges by reaching specific locations with precise GPS tracking
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Generated Challenges</h3>
              <p className="text-gray-600">
                Dynamic challenges created by AI based on your location and preferences
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Multiplayer</h3>
              <p className="text-gray-600">
                Compete with friends and strangers in live gaming sessions
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Admin Controls</h3>
              <p className="text-gray-600">
                Comprehensive admin panel for route creation and game management
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scoring System</h3>
              <p className="text-gray-600">
                Earn points and climb the leaderboard with our dynamic scoring system
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile Optimized</h3>
              <p className="text-gray-600">
                Fully responsive design that works perfectly on all devices
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and begin your location-based gaming adventure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up & Join</h3>
              <p className="text-gray-600">
                Create your account and join a game room using a simple room code
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Navigate & Explore</h3>
              <p className="text-gray-600">
                Use GPS to find checkpoints and unlock location-based challenges
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete & Compete</h3>
              <p className="text-gray-600">
                Solve challenges, earn points, and compete on the leaderboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Top Players
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See who's leading the competition
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((player, index) => (
                  <div key={player.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{player.username}</h3>
                        <p className="text-sm text-gray-600">{player.gamesPlayed} games played</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">{player.totalPoints} pts</p>
                      <p className="text-sm text-gray-600">Avg: {player.averageScore.toFixed(1)}</p>
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No players yet. Be the first to join!
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <Link href="/auth/signup" className="btn btn-primary">
              Join the Competition
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">LocationGaming</h3>
            <p className="text-gray-400 mb-4">
              The future of location-based gaming is here
            </p>
            <div className="flex justify-center space-x-6">
              <Link href="/auth/signup" className="text-gray-400 hover:text-white">
                Sign Up
              </Link>
              <Link href="/auth/signin" className="text-gray-400 hover:text-white">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
