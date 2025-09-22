import { Challenge, Submission } from './database';

export interface ValidationResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  details?: any;
}

export class ValidationService {
  static validateSubmission(
    challenge: Challenge,
    submission: {
      answer?: string;
      photoUrl?: string;
    }
  ): ValidationResult {
    switch (challenge.type) {
      case 'trivia':
        return this.validateTrivia(challenge, submission.answer || '');
      case 'word_puzzle':
        return this.validateWordPuzzle(challenge, submission.answer || '');
      case 'photo_proof':
        return this.validatePhotoProof(challenge, submission.photoUrl);
      default:
        return {
          isCorrect: false,
          score: 0,
          feedback: 'Unknown challenge type',
        };
    }
  }

  private static validateTrivia(challenge: Challenge, answer: string): ValidationResult {
    const correctAnswer = challenge.answer?.toLowerCase().trim();
    const userAnswer = answer.toLowerCase().trim();

    const isCorrect = correctAnswer === userAnswer;

    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect 
        ? 'Correct! Well done!' 
        : `Incorrect. The correct answer was: ${challenge.answer}`,
      details: {
        correctAnswer: challenge.answer,
        userAnswer: answer,
      },
    };
  }

  private static validateWordPuzzle(challenge: Challenge, answer: string): ValidationResult {
    const correctAnswer = challenge.answer?.toLowerCase().trim();
    const userAnswer = answer.toLowerCase().trim();

    // Allow for some flexibility in word puzzles
    const isCorrect = this.fuzzyMatch(correctAnswer || '', userAnswer);

    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect 
        ? 'Correct! Great job!' 
        : `Incorrect. The answer was: ${challenge.answer}`,
      details: {
        correctAnswer: challenge.answer,
        userAnswer: answer,
        fuzzyMatch: !isCorrect && this.fuzzyMatch(correctAnswer || '', userAnswer, 0.8),
      },
    };
  }

  private static validatePhotoProof(challenge: Challenge, photoUrl?: string): ValidationResult {
    // For photo challenges, we assume they're correct if a photo is uploaded
    // In a real application, you might use AI to verify the photo content
    const hasPhoto = !!photoUrl;

    return {
      isCorrect: hasPhoto,
      score: hasPhoto ? 100 : 0,
      feedback: hasPhoto 
        ? 'Photo submitted successfully!' 
        : 'Please upload a photo to complete this challenge',
      details: {
        hasPhoto,
        photoUrl,
      },
    };
  }

  private static fuzzyMatch(str1: string, str2: string, threshold: number = 0.9): boolean {
    if (str1 === str2) return true;
    
    // Simple fuzzy matching - in a real app, you'd use a proper fuzzy matching library
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return true;
    
    const distance = this.levenshteinDistance(longer, shorter);
    const similarity = (longer.length - distance) / longer.length;
    
    return similarity >= threshold;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  static calculateScore(
    challenge: Challenge,
    validationResult: ValidationResult,
    timeBonus: number = 0
  ): number {
    const baseScore = challenge.points || 0;
    const validationScore = (validationResult.score / 100) * baseScore;
    const bonus = timeBonus > 0 ? Math.min(timeBonus, baseScore * 0.2) : 0; // Max 20% bonus
    
    return Math.round(validationScore + bonus);
  }

  static generateFeedback(
    challenge: Challenge,
    validationResult: ValidationResult,
    timeTaken: number
  ): string {
    let feedback = validationResult.feedback;
    
    if (validationResult.isCorrect && timeTaken < 30) {
      feedback += ' Quick thinking!';
    } else if (validationResult.isCorrect && timeTaken > 120) {
      feedback += ' Took your time, but got it right!';
    }
    
    return feedback;
  }
}
