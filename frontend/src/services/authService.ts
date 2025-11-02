// src/services/authService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  // Optional fields from signup form
  date_of_birth?: string;
  phone_number?: string;
  country?: string;
  monthly_income_range?: string;
  financial_goal?: string;
  financial_status?: string;
  subscribe_newsletter?: boolean;
  agree_to_terms?: boolean;
}

interface SignInData {
  email: string;
  password: string;
  remember_me: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

class AuthService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async signUp(userData: SignUpData) {
    console.log('📤 Sending signup request:', { ...userData, password: '[HIDDEN]', confirm_password: '[HIDDEN]' });
    
    const response = await fetch(`${this.baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    console.log('📥 Signup response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Signup error:', error);
      throw new Error(error.detail || error.message || 'Registration failed');
    }

    const data = await response.json();
    console.log('✅ Signup successful:', data);
    return data;
  }

  async signIn(credentials: SignInData): Promise<AuthResponse> {
    console.log('📤 Sending signin request:', { ...credentials, password: '[HIDDEN]' });
    
    const response = await fetch(`${this.baseUrl}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    console.log('📥 Signin response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Signin error:', error);
      throw new Error(error.detail || error.message || 'Sign in failed');
    }

    const data = await response.json();
    console.log('✅ Signin successful for user:', data.user.name);
    
    // Store tokens and user data
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('isAuthenticated', 'true');

    return data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      this.signOut();
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Update stored tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('No access token');

    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Try to refresh token
        try {
          await this.refreshToken();
          return this.getCurrentUser(); // Retry with new token
        } catch {
          this.signOut();
          throw new Error('Authentication required');
        }
      }
      throw new Error('Failed to get user profile');
    }

    return response.json();
  }

  signOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.setItem('isAuthenticated', 'false');
    console.log('👋 User signed out');
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('isAuthenticated') === 'true' && 
           localStorage.getItem('access_token') !== null;
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const authService = new AuthService();
export type { User, AuthResponse, SignUpData, SignInData };
