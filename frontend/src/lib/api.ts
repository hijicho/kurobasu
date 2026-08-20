const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');

// CORS対策:
// バックエンド側で以下の設定が必要です
// - Access-Control-Allow-Origin: フロントエンドのOrigin
// - Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
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
      // Lets the anonymous rating voter cookie (set by the backend on
      // POST /offerings/{id}/ratings) round-trip across origins.
      credentials: 'include',
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

export interface SiteSettings {
  default_academic_year: number;
  default_term: string;
  updated_at: string;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return fetchApi<SiteSettings>('/meta/site-settings');
}

export async function getAdminSiteSettings(idToken: string | null | undefined): Promise<SiteSettings> {
  return fetchApi<SiteSettings>('/admin/site-settings', {
    headers: authHeaders(idToken),
  });
}

export async function updateAdminSiteSettings(
  idToken: string | null | undefined,
  defaultAcademicYear: number,
  defaultTerm: string
): Promise<SiteSettings> {
  return fetchApi<SiteSettings>('/admin/site-settings', {
    method: 'PATCH',
    headers: authHeaders(idToken),
    body: JSON.stringify({
      default_academic_year: defaultAcademicYear,
      default_term: defaultTerm,
    }),
  });
}

export interface DefaultTermResponse {
  term: 'spring' | 'fall';
  is_override: boolean;
}

export async function getDefaultTerm(): Promise<DefaultTermResponse> {
  return fetchApi<DefaultTermResponse>('/meta/default-term');
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
  // 曜日・時限が定まらない集中講義・時間割外は null（講義室だけ入っている）
  day: number | null;
  period: number | null;
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
  rating_average?: number;
  rating_count: number;
  rating_rank?: 'AA' | 'A' | 'B' | 'C';
  review_count: number; // 承認済みの口コミ（良かった/悪かった/その他）の件数合計
  latest_review_at?: string; // 最新の承認済み口コミの投稿日時（口コミが無ければ未設定）
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

export interface OfferingRatingResponse {
  offering_id: number;
  rating_average?: number;
  rating_count: number;
  rating_rank?: 'AA' | 'A' | 'B' | 'C';
}

export async function createOfferingRating(
  offeringId: number,
  score: number,
  idToken?: string | null
): Promise<OfferingRatingResponse> {
  return fetchApi<OfferingRatingResponse>(`/offerings/${offeringId}/ratings`, {
    method: 'POST',
    headers: authHeaders(idToken),
    body: JSON.stringify({ score }),
  });
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
  review_id: number;
  type: 'pros' | 'cons' | 'others';
  status: string;
}

export async function createReview(
  idToken: string | null | undefined,
  offeringId: number,
  review: { type: 'pros' | 'cons' | 'others'; comment: string }
): Promise<CreateReviewResponse> {
  return fetchApi<CreateReviewResponse>('/reviews', {
    method: 'POST',
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
    body: JSON.stringify({
      offering_id: offeringId,
      type: review.type,
      comment: review.comment,
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
  count: number;
  role_counts: Record<string, number>;
}

export async function listAdminUsers(
  idToken: string | null | undefined,
  filters?: { role?: string; query?: string }
): Promise<ListAdminUsersResponse> {
  const params = new URLSearchParams();
  if (filters?.role) {
    params.set('role', filters.role);
  }
  if (filters?.query) {
    params.set('q', filters.query);
  }
  const query = params.toString();
  return fetchApi<ListAdminUsersResponse>(`/admin/users${query ? `?${query}` : ''}`, {
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

export interface ApproveAllReviewsResponse {
  approved_count: number;
}

export async function approveAllReviews(idToken: string | null | undefined): Promise<ApproveAllReviewsResponse> {
  return fetchApi<ApproveAllReviewsResponse>('/admin/reviews/approve-all', {
    method: 'POST',
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
// Admin: Timetable rows (時間割の直接編集・CSVインポート)
// ============================
// 下書き/公開の2段階は廃止。CSVインポートも手動編集の保存も、対象の
// カテゴリ・年度・学期の授業データを丸ごと入れ替える1本の経路を通る
// （バックエンド: OfferingRepository.ReplaceForScope）。

export interface TimetableRow {
  offering_id?: number;
  day: number | null; // 1=月 ... 5=金
  period: number | null; // 1〜5
  course_code: string;
  course_name: string;
  instructor: string;
  campus: string;
  classroom: string;
  note: string;
}

export interface ListTimetableRowsResponse {
  items: TimetableRow[];
}

export async function listAdminTimetableRows(
  idToken: string | null | undefined,
  categorySlug: string,
  academicYear: number,
  term: string
): Promise<ListTimetableRowsResponse> {
  const params = new URLSearchParams({
    category_slug: categorySlug,
    academic_year: String(academicYear),
    term,
  });
  return fetchApi<ListTimetableRowsResponse>(`/admin/timetable-rows?${params}`, {
    headers: authHeaders(idToken),
  });
}

export async function saveAdminTimetableRows(
  idToken: string | null | undefined,
  categorySlug: string,
  academicYear: number,
  term: string,
  rows: TimetableRow[]
): Promise<ListTimetableRowsResponse> {
  return fetchApi<ListTimetableRowsResponse>('/admin/timetable-rows', {
    method: 'PUT',
    headers: authHeaders(idToken),
    body: JSON.stringify({ category_slug: categorySlug, academic_year: academicYear, term, rows }),
  });
}

// csv is optional: passing only intensiveCsv merges it into the scope's
// current live data instead of replacing everything from a fresh CSV, so
// intensive courses can be added after the main timetable is already in.
export async function importAdminTimetableRowsCSV(
  idToken: string | null | undefined,
  academicYear: number,
  term: string,
  csv: File | null,
  categorySlug = 'general-education',
  intensiveCsv?: File | null
): Promise<ListTimetableRowsResponse> {
  const formData = new FormData();
  formData.append('academic_year', String(academicYear));
  formData.append('term', term);
  formData.append('category_slug', categorySlug);
  if (csv) {
    formData.append('csv', csv);
  }
  if (intensiveCsv) {
    formData.append('intensive_csv', intensiveCsv);
  }

  return fetchApi<ListTimetableRowsResponse>('/admin/timetable-rows/import', {
    method: 'POST',
    headers: authHeaders(idToken),
    body: formData,
  });
}

// ============================
// Admin: Site settings (サイト設定)
// ============================

export async function updateAdminDefaultTerm(
  idToken: string | null | undefined,
  term: 'spring' | 'fall' | 'auto'
): Promise<DefaultTermResponse> {
  return fetchApi<DefaultTermResponse>('/admin/settings/default-term', {
    method: 'PUT',
    headers: authHeaders(idToken),
    body: JSON.stringify({ term }),
  });
}
