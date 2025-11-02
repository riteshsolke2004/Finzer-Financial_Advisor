// src/services/profileService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  
  profile: {
    avatar_url?: string;
    phone?: string;
    bio?: string;
    date_of_birth?: string;
    country?: string;
    location?: string;
  };
  
  preferences: {
    currency: string;
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      budget_alerts: boolean;
      weekly_reports: boolean;
      newsletter: boolean;
    };
  };
  
  financial_profile: {
    monthly_income_range?: string;
    financial_goal?: string;
    financial_status?: string;
    risk_tolerance?: string;
    investment_experience?: string;
  };
  
  onboarding: {
    completed: boolean;
    steps_completed: string[];
    completed_at?: string;
  };
  
  stats: {
    profile_completion: number;
    account_age_days: number;
    financial_score: number;
    is_verified: boolean;
    account_type: 'free' | 'premium';
    total_logins: number;
  };
}

class ProfileService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getProfile(): Promise<UserProfile> {
    console.log('🔄 Fetching user profile from database...');
    
    const response = await fetch(`${this.baseUrl}/profile/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to fetch profile:', error);
      throw new Error(error.detail || 'Failed to fetch profile');
    }

    const data = await response.json();
    console.log('✅ Profile fetched successfully:', data);
    return data;
  }

  async updatePersonalInfo(data: {
    name?: string;
    phone?: string;
    bio?: string;
    country?: string;
    date_of_birth?: string;
  }): Promise<UserProfile> {
    console.log('🔄 Updating personal info...', data);
    
    const response = await fetch(`${this.baseUrl}/profile/personal`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to update personal info:', error);
      throw new Error(error.detail || 'Failed to update profile');
    }

    const result = await response.json();
    console.log('✅ Personal info updated successfully');
    return result.data;
  }

  async updatePreferences(data: {
    currency?: string;
    language?: string;
    email_notifications?: boolean;
    budget_alerts?: boolean;
    weekly_reports?: boolean;
    newsletter?: boolean;
  }): Promise<UserProfile> {
    console.log('🔄 Updating preferences...', data);
    
    const response = await fetch(`${this.baseUrl}/profile/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Failed to update preferences:', error);
      throw new Error(error.detail || 'Failed to update preferences');
    }

    const result = await response.json();
    console.log('✅ Preferences updated successfully');
    return result.data;
  }
}

export const profileService = new ProfileService();
