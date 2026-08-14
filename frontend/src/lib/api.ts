const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');

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
        ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || errorData.error || `HTTP Error: ${response.status}`,
        errorData
      );
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    const parsed = JSON.parse(text);
    // バックエンドは成功時のペイロードを {"data": ...} で包んで返すため、ここで剥がす
    if (parsed && typeof parsed === 'object' && 'data' in parsed) {
      return parsed.data as T;
    }
    return parsed as T;
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

export interface ReviewsResponse {
  pros: string[];
  cons: string[];
  others: string[];
  count: number;
}

export async function getReviews(offeringId: number): Promise<ReviewsResponse> {
  return fetchApi<ReviewsResponse>(`/offerings/${offeringId}/reviews`);
}

export interface CreateReviewResponse {
  review_ids: number[];
  status: string;
}

export async function createReview(
  idToken: string,
  offeringId: number,
  review: { pros: string; cons: string; others?: string }
): Promise<CreateReviewResponse> {
  return fetchApi<CreateReviewResponse>('/reviews', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      offering_id: offeringId,
      pros: review.pros,
      cons: review.cons,
      others: review.others,
    }),
  });
}

// ============================
// Auth API (Supabase Auth)
// ============================

export interface UserProfile {
  user_id: number;
  auth_uid?: string;
  display_name: string;
  role: string;
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

export async function logout(idToken: string): Promise<void> {
  return fetchApi<void>('/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

// ============================
// Admin API (admin ロールのみ)
// ============================

export interface ListAdminUsersResponse {
  items: UserProfile[];
}

export async function listAdminUsers(idToken: string): Promise<ListAdminUsersResponse> {
  return fetchApi<ListAdminUsersResponse>('/admin/users', {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function updateUserRole(
  idToken: string,
  userId: number,
  role: string
): Promise<UserProfile> {
  return fetchApi<UserProfile>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ role }),
  });
}

export interface AdminReview {
  review_id: number;
  user_id: number;
  user_display_name: string;
  offering_id: number;
  subject_title: string;
  instructor_names: string[];
  academic_year: number;
  term: string;
  comment: string;
  type: 'pros' | 'cons' | 'others';
  status: 'pending' | 'approved';
  created_at: string;
  updated_at: string;
}

export interface ListAdminReviewsResponse {
  items: AdminReview[];
  count: number;
}

export async function listAdminReviews(
  idToken: string,
  status?: AdminReview['status']
): Promise<ListAdminReviewsResponse> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return fetchApi<ListAdminReviewsResponse>(`/admin/reviews${query}`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function updateReviewStatus(
  idToken: string,
  reviewId: number,
  status: AdminReview['status']
): Promise<AdminReview> {
  return fetchApi<AdminReview>(`/admin/reviews/${reviewId}/status`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ status }),
  });
}

export async function deleteAdminReview(idToken: string, reviewId: number): Promise<void> {
  return fetchApi<void>(`/admin/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export interface AdImage {
  ad_id: number;
  instrument_key: string;
  image_url: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListAdImagesResponse {
  items: AdImage[];
  count: number;
}

export async function listAdminAds(idToken: string): Promise<ListAdImagesResponse> {
  return fetchApi<ListAdImagesResponse>('/admin/ads', {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function uploadAdminAd(
  idToken: string,
  instrumentKey: string,
  image: File
): Promise<AdImage> {
  const formData = new FormData();
  formData.append('instrument_key', instrumentKey);
  formData.append('image', image);

  return fetchApi<AdImage>('/admin/ads', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  });
}

export async function deleteAdminAd(idToken: string, adId: number): Promise<AdImage> {
  return fetchApi<AdImage>(`/admin/ads/${adId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}
