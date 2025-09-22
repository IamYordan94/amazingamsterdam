'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navbar } from '@/components/Navbar';
import { DatabaseService, Checkpoint, Submission } from '@/lib/database';
import { useAuth } from '@/components/AuthProvider';
import { ArrowLeft, Camera, Lightbulb, CheckCircle, XCircle } from 'lucide-react';

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const checkpointId = params.checkpointId as string;
  
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ isCorrect: boolean; message: string } | null>(null);

  useEffect(() => {
    const loadCheckpoint = async () => {
      try {
        // TODO: Implement getCheckpointById in DatabaseService
        // For now, we'll create a mock checkpoint
        const mockCheckpoint: Checkpoint = {
          id: checkpointId,
          routeId: 'route-1',
          name: 'Historic Landmark',
          description: 'A beautiful historic building in the city center',
          latitude: 37.7749,
          longitude: -122.4194,
          order: 1,
          challenge: {
            id: 'challenge-1',
            type: 'trivia',
            question: 'What year was this building constructed?',
            answer: '1906',
            options: ['1906', '1910', '1900', '1915'],
            hint: 'This building survived the great earthquake of 1906',
          },
          points: 20,
        };
        setCheckpoint(mockCheckpoint);
      } catch (error) {
        console.error('Failed to load checkpoint:', error);
        setError('Failed to load challenge');
      } finally {
        setIsLoading(false);
      }
    };

    loadCheckpoint();
  }, [checkpointId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkpoint) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Validate answer based on challenge type
      let isCorrect = false;
      let message = '';

      switch (checkpoint.challenge.type) {
        case 'trivia':
          isCorrect = selectedOption === checkpoint.challenge.answer;
          message = isCorrect ? 'Correct! Well done!' : `Incorrect. The answer was: ${checkpoint.challenge.answer}`;
          break;
        case 'word_puzzle':
          isCorrect = answer.toLowerCase().trim() === checkpoint.challenge.answer?.toLowerCase().trim();
          message = isCorrect ? 'Correct! Great job!' : `Incorrect. The answer was: ${checkpoint.challenge.answer}`;
          break;
        case 'photo_proof':
          // For photo challenges, we'll assume they're correct if a photo is uploaded
          isCorrect = photoFile !== null;
          message = isCorrect ? 'Photo submitted successfully!' : 'Please upload a photo to complete this challenge';
          break;
      }

      // Create submission
      const submission = await DatabaseService.createSubmission({
        roomId: 'current-room-id', // TODO: Get from context
        playerId: user?.id || 'unknown',
        checkpointId: checkpoint.id,
        answer: checkpoint.challenge.type === 'trivia' ? selectedOption : answer,
        photoUrl: photoFile ? 'uploaded-photo-url' : undefined, // TODO: Upload photo
        isCorrect,
        points: isCorrect ? checkpoint.points : 0,
      });

      setResult({ isCorrect, message });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
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

  if (error || !checkpoint) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Challenge Not Found</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => router.back()}
              className="btn btn-primary"
            >
              Go Back
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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{checkpoint.name}</h1>
            <p className="text-gray-600 mt-2">{checkpoint.description}</p>
          </div>

          {result ? (
            /* Result Display */
            <div className="card">
              <div className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  result.isCorrect ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {result.isCorrect ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  result.isCorrect ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.isCorrect ? 'Correct!' : 'Incorrect'}
                </h2>
                <p className="text-gray-600 mb-6">{result.message}</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => router.back()}
                    className="btn btn-primary"
                  >
                    Continue Game
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Challenge Form */
            <div className="card">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {checkpoint.challenge.type === 'trivia' ? 'Trivia Question' :
                     checkpoint.challenge.type === 'word_puzzle' ? 'Word Puzzle' :
                     'Photo Challenge'}
                  </h2>
                  <span className="text-sm text-primary-600 font-medium">
                    {checkpoint.points} points
                  </span>
                </div>
                
                {checkpoint.challenge.question && (
                  <p className="text-lg text-gray-700 mb-4">
                    {checkpoint.challenge.question}
                  </p>
                )}

                {checkpoint.challenge.photoPrompt && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center mb-2">
                      <Camera className="w-5 h-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-blue-900">Photo Challenge</h3>
                    </div>
                    <p className="text-blue-800">{checkpoint.challenge.photoPrompt}</p>
                  </div>
                )}

                {checkpoint.challenge.hint && (
                  <div className="mb-4">
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      <Lightbulb className="w-4 h-4 mr-2" />
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                    {showHint && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-sm">{checkpoint.challenge.hint}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {checkpoint.challenge.type === 'trivia' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select your answer:
                    </label>
                    <div className="space-y-2">
                      {checkpoint.challenge.options?.map((option, index) => (
                        <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="answer"
                            value={option}
                            checked={selectedOption === option}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="mr-3"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {checkpoint.challenge.type === 'word_puzzle' && (
                  <div>
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                      Your answer:
                    </label>
                    <input
                      type="text"
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="input"
                      placeholder="Enter your answer..."
                    />
                  </div>
                )}

                {checkpoint.challenge.type === 'photo_proof' && (
                  <div>
                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                      Upload your photo:
                    </label>
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="input"
                    />
                    {photoPreview && (
                      <div className="mt-4">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full max-w-md rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || 
                      (checkpoint.challenge.type === 'trivia' && !selectedOption) ||
                      (checkpoint.challenge.type === 'word_puzzle' && !answer.trim()) ||
                      (checkpoint.challenge.type === 'photo_proof' && !photoFile)
                    }
                    className="btn btn-primary"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
