'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { DatabaseService } from '@/lib/database';
import { useAuth } from '@/components/AuthProvider';
import { ArrowLeft, MapPin, Plus, Wand2 } from 'lucide-react';

interface RouteFormData {
  name: string;
  description: string;
  city: string;
  theme: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function CreateRoutePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState<RouteFormData>({
    name: '',
    description: '',
    city: '',
    theme: '',
    duration: 30,
    difficulty: 'medium',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerateWithAI = async () => {
    if (!formData.city || !formData.theme) {
      setError('Please provide city and theme for AI generation');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // TODO: Implement AI route generation
      // For now, we'll create a basic route structure
      const generatedData = {
        name: `${formData.theme} Adventure in ${formData.city}`,
        description: `An exciting ${formData.theme.toLowerCase()} themed adventure through ${formData.city}. Discover hidden gems and solve challenges along the way!`,
      };

      setFormData(prev => ({
        ...prev,
        ...generatedData,
      }));
    } catch (err) {
      setError('Failed to generate route with AI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const route = await DatabaseService.createRoute({
        name: formData.name,
        description: formData.description,
        city: formData.city,
        theme: formData.theme,
        duration: formData.duration,
        difficulty: formData.difficulty,
        createdBy: user?.id || 'unknown',
        isActive: true,
      });

      router.push(`/admin/routes/${route.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create route');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Create New Route</h1>
            <p className="text-gray-600 mt-2">
              Design a new location-based gaming experience for players
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="card-header">
                <h2 className="text-xl font-semibold">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Route Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Historic Downtown Adventure"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., San Francisco"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="input"
                  placeholder="Describe what makes this route special and what players will discover..."
                />
              </div>

              {/* Route Configuration */}
              <div className="card-header">
                <h2 className="text-xl font-semibold">Route Configuration</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                    Theme *
                  </label>
                  <select
                    id="theme"
                    name="theme"
                    required
                    value={formData.theme}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="">Select a theme</option>
                    <option value="Historical">Historical</option>
                    <option value="Art & Culture">Art & Culture</option>
                    <option value="Nature">Nature</option>
                    <option value="Food & Drink">Food & Drink</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Photography">Photography</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    required
                    min="15"
                    max="180"
                    value={formData.duration}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div>
                  <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    id="difficulty"
                    name="difficulty"
                    required
                    value={formData.difficulty}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* AI Generation */}
              <div className="card-header">
                <h2 className="text-xl font-semibold">AI-Powered Generation</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Use AI to automatically generate route details and checkpoints
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900">Generate with AI</h3>
                    <p className="text-sm text-blue-700">
                      AI will create checkpoints, challenges, and route details based on your city and theme
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateWithAI}
                    disabled={isGenerating || !formData.city || !formData.theme}
                    className="btn btn-primary"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
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
                  disabled={isLoading}
                  className="btn btn-primary"
                >
                  {isLoading ? 'Creating...' : 'Create Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
