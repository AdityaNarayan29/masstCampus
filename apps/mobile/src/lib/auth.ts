/**
 * Authentication utilities for mobile app
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'parent';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const getUserRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_role');
};

export const setAuthData = (token: string, user: AuthUser) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_role', user.role);
  localStorage.setItem('user_name', user.name);
  localStorage.setItem('user_id', user.id);
};

export const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_id');
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

export const isTeacher = (): boolean => {
  return getUserRole() === 'teacher';
};

export const isParent = (): boolean => {
  return getUserRole() === 'parent';
};
