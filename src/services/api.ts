/**
 * API Service Layer
 * 
 * This service handles all communication with your Node.js backend.
 * Update the BASE_URL to point to your deployed Node.js server.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Types
export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  personalInfo: any;
  education: any[];
  experience: any[];
  skills: any[];
  certifications: any[];
  template: string;
  atsScore: number | null;
  lastAnalyzedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ATSAnalysisResult {
  score: number;
  analysis: string;
  timestamp: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to set auth token
const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Helper function to clear auth token
const clearAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

// Helper function to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Handle unauthorized responses
  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/auth';
    throw new Error('Unauthorized');
  }

  return response;
}

// Authentication API
export const authAPI = {
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const response = await fetchWithAuth('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign up');
    }

    const data = await response.json();
    setAuthToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await fetchWithAuth('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign in');
    }

    const data = await response.json();
    setAuthToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  async signOut(): Promise<void> {
    clearAuthToken();
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetchWithAuth('/auth/me');
      
      if (!response.ok) {
        clearAuthToken();
        return null;
      }

      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      clearAuthToken();
      return null;
    }
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Resume API
export const resumeAPI = {
  async getAll(): Promise<Resume[]> {
    const response = await fetchWithAuth('/resumes');
    
    if (!response.ok) {
      throw new Error('Failed to fetch resumes');
    }

    return response.json();
  },

  async getById(id: string): Promise<Resume> {
    const response = await fetchWithAuth(`/resumes/${id}`);
    
    if (!response.ok) {
      throw new Error('Resume not found');
    }

    return response.json();
  },

  async create(title: string): Promise<Resume> {
    const response = await fetchWithAuth('/resumes', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to create resume');
    }

    return response.json();
  },

  async update(id: string, updates: Partial<Resume>): Promise<Resume> {
    const response = await fetchWithAuth(`/resumes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update resume');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetchWithAuth(`/resumes/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete resume');
    }
  },

  async analyzeATS(resumeData: any, jobDescription?: string): Promise<ATSAnalysisResult> {
    const response = await fetchWithAuth('/resumes/analyze', {
      method: 'POST',
      body: JSON.stringify({ resumeData, jobDescription }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze resume');
    }

    return response.json();
  },

  async generateContent(type: 'summary' | 'bullet' | 'skills', context: string, jobTitle?: string): Promise<string[]> {
    const response = await fetchWithAuth('/resumes/suggest', {
      method: 'POST',
      body: JSON.stringify({ type, context, jobTitle }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate content');
    }

    const data = await response.json();
    return data.suggestions;
  }
};
