const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');

// CORS対策:
// バックエンド側で以下の設定が必要です
// - Access-Control-Allow-Origin: フロントエンドのOrigin
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

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'ログインが必要です。';
    }
    if (error.status === 403) {
      return 'この操作を行う権限がありません。';
    }
    return error.message || fallback;
  }
  return fallback;
}

function authHeaders(idToken: string | null | undefined): HeadersInit | undefined {
  return idToken ? { Authorization: `Bearer ${idToken}` } : undefined;
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
  academic_year: number;
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
  credits?: number; // 単位数（例：2.0）
}

export interface Meeting {
  day: number;
  period: number;
  classroom?: string;
}

export interface Offering {
  offering_id: number;
  subject: Subject;
  academic_year: number;
  term: string;
  modality: string;
  course_code?: string; // コース番号（例：1GBA001003）。クラス・学期ごとに異なるため offering 側の値
  note?: string; // 時間割表の備考（例：抽選、不開講、通年）
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

export async function getOffering(offeringId: number): Promise<Offering> {
  return fetchApi<Offering>(`/offerings/${offeringId}`);
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
  idToken: string | null | undefined,
  offeringId: number,
  review: { pros: string; cons: string; others?: string }
): Promise<CreateReviewResponse> {
  return fetchApi<CreateReviewResponse>('/reviews', {
    method: 'POST',
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
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
  email?: string;
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

export async function updateMe(
  idToken: string,
  displayName: string
): Promise<UserProfile> {
  return fetchApi<UserProfile>('/me', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ display_name: displayName }),
  });
}

export async function getMe(idToken: string | null | undefined): Promise<UserProfile> {
  return fetchApi<UserProfile>('/me', {
    headers: authHeaders(idToken),
  });
}

export async function getAdminMe(idToken: string | null | undefined): Promise<UserProfile> {
  return fetchApi<UserProfile>('/admin/me', {
    headers: authHeaders(idToken),
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
// Admin API
// ============================

export interface ListAdminUsersResponse {
  items: UserProfile[];
}

export async function listAdminUsers(idToken: string | null | undefined): Promise<ListAdminUsersResponse> {
  return fetchApi<ListAdminUsersResponse>('/admin/users', {
    headers: authHeaders(idToken),
  });
}

export async function updateUserRole(
  idToken: string | null | undefined,
  userId: number,
  role: string
): Promise<UserProfile> {
  return fetchApi<UserProfile>(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: authHeaders(idToken),
    body: JSON.stringify({ role }),
  });
}

export interface AdminReview {
  review_id: number;
  user_id?: number | null;
  user_display_name?: string;
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
  idToken: string | null | undefined,
  status?: AdminReview['status']
): Promise<ListAdminReviewsResponse> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return fetchApi<ListAdminReviewsResponse>(`/admin/reviews${query}`, {
    headers: authHeaders(idToken),
  });
}

export async function updateReviewStatus(
  idToken: string | null | undefined,
  reviewId: number,
  status: AdminReview['status']
): Promise<AdminReview> {
  return fetchApi<AdminReview>(`/admin/reviews/${reviewId}/status`, {
    method: 'PATCH',
    headers: authHeaders(idToken),
    body: JSON.stringify({ status }),
  });
}

export async function deleteAdminReview(idToken: string | null | undefined, reviewId: number): Promise<void> {
  return fetchApi<void>(`/admin/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: authHeaders(idToken),
  });
}

export interface AdImage {
  ad_id: number;
  academic_year: number;
  term: string;
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

export async function listAdminAds(idToken: string | null | undefined): Promise<ListAdImagesResponse> {
  return fetchApi<ListAdImagesResponse>('/admin/ads', {
    headers: authHeaders(idToken),
  });
}

export async function uploadAdminAd(
  idToken: string | null | undefined,
  academicYear: number,
  term: string,
  image: File
): Promise<AdImage> {
  const formData = new FormData();
  formData.append('academic_year', String(academicYear));
  formData.append('term', term);
  formData.append('image', image);

  return fetchApi<AdImage>('/admin/ads', {
    method: 'POST',
    headers: authHeaders(idToken),
    body: formData,
  });
}

export async function deleteAdminAd(idToken: string | null | undefined, adId: number): Promise<void> {
  return fetchApi<void>(`/admin/ads/${adId}`, {
    method: 'DELETE',
    headers: authHeaders(idToken),
  });
}

export async function listAds(academicYear?: number, term?: string): Promise<ListAdImagesResponse> {
  const params = new URLSearchParams();
  if (academicYear !== undefined) {
    params.set('academic_year', String(academicYear));
  }
  if (term) {
    params.set('term', term);
  }
  const query = params.toString();
  return fetchApi<ListAdImagesResponse>(`/ads${query ? `?${query}` : ''}`);
}

// ============================
// Admin: Timetable PDF import (時間割PDFインポート)
// ============================

export interface TimetableImportRow {
  import_row_id: number;
  day: number | null; // 1=月 ... 5=金
  period: number | null; // 1〜5
  course_code: string;
  course_name: string;
  instructor: string;
  classroom: string;
  note: string;
}

export interface TimetableImportBatch {
  import_batch_id: number;
  category_slug: string;
  academic_year: number;
  term: string;
  source_filename: string;
  status: 'draft' | 'published';
  sheet_url: string;
  sheet_provider?: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  row_count: number;
  rows?: TimetableImportRow[];
}

export interface ListTimetableImportBatchesResponse {
  items: TimetableImportBatch[];
}

export async function listAdminTimetableImports(
  idToken: string | null | undefined,
  categorySlug = 'general-education'
): Promise<ListTimetableImportBatchesResponse> {
  return fetchApi<ListTimetableImportBatchesResponse>(
    `/admin/timetable-imports?category_slug=${encodeURIComponent(categorySlug)}`,
    { headers: authHeaders(idToken) }
  );
}

export async function getAdminTimetableImport(
  idToken: string | null | undefined,
  batchId: number
): Promise<TimetableImportBatch> {
  return fetchApi<TimetableImportBatch>(`/admin/timetable-imports/${batchId}`, {
    headers: authHeaders(idToken),
  });
}

export async function createAdminTimetableImport(
  idToken: string | null | undefined,
  academicYear: number,
  term: string,
  pdf: File,
  categorySlug = 'general-education',
  intensivePdf?: File | null
): Promise<TimetableImportBatch> {
  const formData = new FormData();
  formData.append('academic_year', String(academicYear));
  formData.append('term', term);
  formData.append('category_slug', categorySlug);
  formData.append('pdf', pdf);
  if (intensivePdf) {
    formData.append('intensive_pdf', intensivePdf);
  }

  return fetchApi<TimetableImportBatch>('/admin/timetable-imports', {
    method: 'POST',
    headers: authHeaders(idToken),
    body: formData,
  });
}

export interface TimetableImportRowInput {
  day: number | null;
  period: number | null;
  course_code: string;
  course_name: string;
  instructor: string;
  classroom: string;
  note: string;
}

export async function updateAdminTimetableImportRows(
  idToken: string | null | undefined,
  batchId: number,
  rows: TimetableImportRowInput[]
): Promise<TimetableImportBatch> {
  return fetchApi<TimetableImportBatch>(`/admin/timetable-imports/${batchId}/rows`, {
    method: 'PUT',
    headers: authHeaders(idToken),
    body: JSON.stringify({ rows }),
  });
}

export async function publishAdminTimetableImport(
  idToken: string | null | undefined,
  batchId: number
): Promise<TimetableImportBatch> {
  return fetchApi<TimetableImportBatch>(`/admin/timetable-imports/${batchId}/publish`, {
    method: 'POST',
    headers: authHeaders(idToken),
  });
}

export async function deleteAdminTimetableImport(idToken: string | null | undefined, batchId: number): Promise<void> {
  return fetchApi<void>(`/admin/timetable-imports/${batchId}`, {
    method: 'DELETE',
    headers: authHeaders(idToken),
  });
}
