import { DatabaseService, User } from './database';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'player';
}

export class AuthService {
  private static currentUser: AuthUser | null = null;

  static async signUp(email: string, username: string, role: 'admin' | 'player' = 'player'): Promise<AuthUser> {
    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = await DatabaseService.createUser({
      email,
      username,
      role,
    });

    this.currentUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return this.currentUser;
  }

  static async signIn(email: string): Promise<AuthUser> {
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    this.currentUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return this.currentUser;
  }

  static signOut(): void {
    this.currentUser = null;
  }

  static getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  static isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  static isPlayer(): boolean {
    return this.currentUser?.role === 'player';
  }

  static requireAuth(): AuthUser {
    if (!this.currentUser) {
      throw new Error('Authentication required');
    }
    return this.currentUser;
  }

  static requireAdmin(): AuthUser {
    const user = this.requireAuth();
    if (user.role !== 'admin') {
      throw new Error('Admin access required');
    }
    return user;
  }
}
