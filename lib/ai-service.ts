import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-development',
});

export interface AIGeneratedCheckpoint {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  challenge: {
    type: 'trivia' | 'word_puzzle' | 'photo_proof';
    question?: string;
    answer?: string;
    options?: string[];
    hint?: string;
    photoPrompt?: string;
  };
  points: number;
}

export interface AIGeneratedRoute {
  name: string;
  description: string;
  checkpoints: AIGeneratedCheckpoint[];
}

export class AIService {
  static async generateRoute(
    city: string,
    theme: string,
    duration: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): Promise<AIGeneratedRoute> {
    try {
      // Check if API key is available
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key-for-development') {
        throw new Error('OpenAI API key not configured');
      }

      const prompt = this.buildRoutePrompt(city, theme, duration, difficulty);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert location-based game designer. Create engaging routes with checkpoints and challenges for players to explore cities."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error('Failed to generate route with AI');
    }
  }

  private static buildRoutePrompt(
    city: string,
    theme: string,
    duration: number,
    difficulty: 'easy' | 'medium' | 'hard'
  ): string {
    const checkpointCount = Math.max(3, Math.min(8, Math.floor(duration / 10)));
    
    return `
Create a location-based gaming route for ${city} with a ${theme} theme.

Requirements:
- Duration: ${duration} minutes
- Difficulty: ${difficulty}
- Number of checkpoints: ${checkpointCount}
- Each checkpoint should be a real, accessible location in ${city}

For each checkpoint, provide:
1. Name (attractive, descriptive)
2. Description (what makes this location special)
3. Approximate coordinates (latitude, longitude)
4. Challenge type and details:
   - Trivia: question, correct answer, 3 wrong options, hint
   - Word puzzle: puzzle description, answer, hint
   - Photo proof: what the player needs to photograph, hint
5. Points value (${difficulty === 'easy' ? '10-20' : difficulty === 'medium' ? '15-30' : '20-40'})

Format your response as JSON with this structure:
{
  "name": "Route Name",
  "description": "Route description",
  "checkpoints": [
    {
      "name": "Checkpoint Name",
      "description": "Checkpoint description",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "challenge": {
        "type": "trivia|word_puzzle|photo_proof",
        "question": "Question text (for trivia)",
        "answer": "Correct answer",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "hint": "Helpful hint",
        "photoPrompt": "What to photograph (for photo_proof)"
      },
      "points": 20
    }
  ]
}

Make sure the route flows logically and includes diverse challenge types. Focus on ${theme} theme throughout.
    `.trim();
  }

  private static parseAIResponse(response: string): AIGeneratedRoute {
    try {
      // Clean up the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);

      // Validate the structure
      if (!parsed.name || !parsed.description || !Array.isArray(parsed.checkpoints)) {
        throw new Error('Invalid route structure from AI');
      }

      // Validate each checkpoint
      for (const checkpoint of parsed.checkpoints) {
        if (!checkpoint.name || !checkpoint.description || 
            typeof checkpoint.latitude !== 'number' || 
            typeof checkpoint.longitude !== 'number' ||
            !checkpoint.challenge || !checkpoint.points) {
          throw new Error('Invalid checkpoint structure from AI');
        }
      }

      return parsed as AIGeneratedRoute;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to parse AI-generated route');
    }
  }

  static async generateChallenge(
    location: string,
    theme: string,
    type: 'trivia' | 'word_puzzle' | 'photo_proof'
  ): Promise<AIGeneratedCheckpoint['challenge']> {
    try {
      const prompt = this.buildChallengePrompt(location, theme, type);
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert game designer creating engaging challenges for location-based games."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI service');
      }

      return this.parseChallengeResponse(response, type);
    } catch (error) {
      console.error('AI challenge generation error:', error);
      throw new Error('Failed to generate challenge with AI');
    }
  }

  private static buildChallengePrompt(
    location: string,
    theme: string,
    type: 'trivia' | 'word_puzzle' | 'photo_proof'
  ): string {
    const basePrompt = `Create a ${type} challenge for a location-based game at ${location} with a ${theme} theme.`;

    switch (type) {
      case 'trivia':
        return `${basePrompt}
        
Create a trivia question about this location or the ${theme} theme. Include:
- A clear, engaging question
- The correct answer
- 3 plausible wrong answers
- A helpful hint

Format as JSON:
{
  "question": "Question text",
  "answer": "Correct answer",
  "options": ["Correct answer", "Wrong 1", "Wrong 2", "Wrong 3"],
  "hint": "Helpful hint"
}`;

      case 'word_puzzle':
        return `${basePrompt}
        
Create a word puzzle related to this location or the ${theme} theme. Include:
- Puzzle description (anagram, crossword clue, etc.)
- The answer
- A helpful hint

Format as JSON:
{
  "question": "Puzzle description",
  "answer": "Answer",
  "hint": "Helpful hint"
}`;

      case 'photo_proof':
        return `${basePrompt}
        
Create a photo challenge where players must photograph something specific at this location. Include:
- What they need to photograph
- A helpful hint about where to find it

Format as JSON:
{
  "photoPrompt": "What to photograph",
  "hint": "Helpful hint"
}`;

      default:
        throw new Error(`Unknown challenge type: ${type}`);
    }
  }

  private static parseChallengeResponse(
    response: string,
    type: 'trivia' | 'word_puzzle' | 'photo_proof'
  ): AIGeneratedCheckpoint['challenge'] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);

      const challenge: AIGeneratedCheckpoint['challenge'] = {
        type,
      };

      if (type === 'trivia') {
        challenge.question = parsed.question;
        challenge.answer = parsed.answer;
        challenge.options = parsed.options;
        challenge.hint = parsed.hint;
      } else if (type === 'word_puzzle') {
        challenge.question = parsed.question;
        challenge.answer = parsed.answer;
        challenge.hint = parsed.hint;
      } else if (type === 'photo_proof') {
        challenge.photoPrompt = parsed.photoPrompt;
        challenge.hint = parsed.hint;
      }

      return challenge;
    } catch (error) {
      console.error('Failed to parse AI challenge response:', error);
      throw new Error('Failed to parse AI-generated challenge');
    }
  }
}
