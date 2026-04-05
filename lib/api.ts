import type {
  User,
  AuthCredentials,
  AuthResponse,
  UserProgress,
  LeaderboardEntry,
  Certificate,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function register(credentials: AuthCredentials): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function getCurrentUser(): Promise<User> {
  return request<User>('/auth/me');
}

export async function getUserProgress(): Promise<UserProgress> {
  return request<UserProgress>('/progress');
}

export async function submitScenarioResult(
  scenarioId: string,
  result: { score: number; mistakes: number; timeSpentSeconds: number }
): Promise<UserProgress> {
  return request<UserProgress>(`/progress/scenarios/${scenarioId}/complete`, {
    method: 'POST',
    body: JSON.stringify(result),
  });
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  return request<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`);
}

export async function requestCertificate(): Promise<Certificate> {
  return request<Certificate>('/certificates', {
    method: 'POST',
  });
}

export async function getCertificates(): Promise<Certificate[]> {
  return request<Certificate[]>('/certificates');
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  league: string;
  role: string;
  totalScore: number;
  createdAt: string;
  scenariosCompleted: number;
}

export interface AdminUserDetail extends AdminUser {
  totalScenarioScore: number;
  totalMistakes: number;
  totalTimeSpent: number;
}

export interface PaginatedUsers {
  users: AdminUser[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminStats {
  totalUsers: number;
  totalScenarios: number;
  totalCertificates: number;
  averageScore: number;
  usersByLeague: Record<string, number>;
  recentRegistrations: Array<{ id: string; username: string; createdAt: string }>;
  topUsers: Array<{ id: string; username: string; league: string; totalScore: number; scenariosCompleted: number }>;
}

export async function adminListUsers(page = 1, limit = 20, search?: string): Promise<PaginatedUsers> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) params.set('search', search);
  return request<PaginatedUsers>(`/admin/users?${params}`);
}

export async function adminGetUser(userId: string): Promise<AdminUserDetail> {
  return request<AdminUserDetail>(`/admin/users/${userId}`);
}

export async function adminUpdateUser(userId: string, updates: { league?: string; role?: string; totalScore?: number }): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function adminDeleteUser(userId: string): Promise<void> {
  return request<void>(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
}

export async function adminGetStats(): Promise<AdminStats> {
  return request<AdminStats>('/admin/stats');
}

export interface AdminCertificate {
  id: string;
  userId: string;
  username: string;
  league: string;
  finalScore: number;
  issuedAt: string;
  isValid: boolean;
}

export interface PaginatedCertificates {
  certificates: AdminCertificate[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

export async function adminListCertificates(
  page = 1,
  limit = 20,
  search?: string,
  validOnly = false
): Promise<PaginatedCertificates> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    validOnly: String(validOnly),
  });
  if (search) params.set('search', search);
  return request<PaginatedCertificates>(`/admin/certificates?${params}`);
}

export async function adminDeleteCertificate(certId: string): Promise<void> {
  return request<void>(`/admin/certificates/${certId}`, {
    method: 'DELETE',
  });
}

export async function adminRevokeCertificate(certId: string): Promise<void> {
  return request<void>(`/admin/certificates/${certId}/revoke`, {
    method: 'PATCH',
  });
}

export async function adminBulkUsersOperation(data: {
  user_ids: string[];
  operation: 'delete' | 'change_league' | 'change_role';
  league?: string;
  role?: string;
}): Promise<BulkOperationResult> {
  return request<BulkOperationResult>('/admin/users/bulk', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface ImportedScenario {
  id: string;
  title: string;
  description: string;
  location: string;
  attackType: string;
  difficulty: number;
  steps: any;
}

export async function getImportedScenarios(): Promise<ImportedScenario[]> {
  return request<ImportedScenario[]>('/scenarios');
}

export async function getImportedScenario(id: string): Promise<ImportedScenario> {
  return request<ImportedScenario>(`/scenarios/${id}`);
}
