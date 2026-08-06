// API Base URL
// 開発環境: http://localhost:8000/api/v1
// 本番環境: 環境変数などで切り替える
const API_BASE_URL = 'http://localhost:8000/api/v1';

// 開発モード設定
// バックエンドが未起動の場合、この値をtrueにするとモックデータのみ使用します
export const USE_MOCK_DATA = true;

// CORS対策:
// バックエンド側で以下の設定が必要です
// - Access-Control-Allow-Origin: http://localhost:5173 (開発環境のURL)
// - Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
// - Access-Control-Allow-Headers: Content-Type, Authorization

// API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || `HTTP Error: ${response.status}`,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error or other issues
    throw new ApiError(0, 'Network error or server is unreachable');
  }
}

// ============================
// Categories API
// ============================

export interface Category {
  category_id: number;
  slug: string;
  name: string;
}

export interface CategoriesResponse {
  items: Category[];
}

export async function getCategories(): Promise<CategoriesResponse> {
  return fetchApi<CategoriesResponse>('/categories');
}

// ============================
// Meta API
// ============================

export interface DefaultAcademicYearResponse {
  academic_year: string;
}

export async function getDefaultAcademicYear(): Promise<DefaultAcademicYearResponse> {
  return fetchApi<DefaultAcademicYearResponse>('/meta/default-academic-year');
}

// ============================
// Offerings API
// ============================

export interface Subject {
  subject_id: number;
  title: string;
  course_code?: string; // コース番号（例：1GBA001003）
  credits?: number; // 単位数（例：2.0）
}

export interface Meeting {
  day: number;
  period: number;
}

export interface Offering {
  offering_id: number;
  subject: Subject;
  academic_year: number;
  term: string;
  modality: string;
  instructor_names: string[];
  rate: string;
  meetings: Meeting[];
}

export interface OfferingsResponse {
  items: Offering[];
}

export async function getOfferings(
  categorySlug: string,
  academicYear: number,
  term: string
): Promise<OfferingsResponse> {
  return fetchApi<OfferingsResponse>(
    `/categories/${categorySlug}/offerings?academic_year=${academicYear}&term=${term}`
  );
}

// ============================
// Reviews API (保留)
// ============================

export interface ReviewAuthor {
  user_id: number;
  display_name: string;
}

export interface Review {
  review_id: number;
  md_url: string;
  status: string;
  author: ReviewAuthor;
  created_at: string;
}

export interface ReviewsResponse {
  items: Review[];
}

export async function getReviews(offeringId: number): Promise<ReviewsResponse> {
  return fetchApi<ReviewsResponse>(`/offerings/${offeringId}/reviews`);
}

// ============================
// Auth API (Firebase Authentication)
// ============================

export interface UserProfile {
  user_id: number;
  firebase_uid?: string;
  display_name: string;
  created_at: string;
}

export async function bootstrap(
  idToken: string,
  displayName: string
): Promise<UserProfile> {
  return fetchApi<UserProfile>('/auth/bootstrap', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ display_name: displayName }),
  });
}

export async function getMe(idToken: string): Promise<UserProfile> {
  return fetchApi<UserProfile>('/me', {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function updateMe(
  idToken: string,
  displayName: string
): Promise<void> {
  return fetchApi<void>('/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ display_name: displayName }),
  });
}