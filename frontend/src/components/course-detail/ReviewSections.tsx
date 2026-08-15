import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, Clock } from 'lucide-react';
import { User } from 'lucide-react';
import { createReview, getReviews } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ReviewItem } from './ReviewItem';
import { ReviewForm, ReviewCategory } from './ReviewForm';

interface SubmittedReview {
  type: ReviewCategory;
  comment: string;
  approved: boolean;
}

interface ReviewSectionsProps {
  pros: string[];
  cons: string[];
  others: string[];
  offeringId?: number;
}

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  pros: '良かったところ',
  cons: '悪かったところ',
  others: 'その他の情報',
};

export function ReviewSections({ pros, cons, others, offeringId }: ReviewSectionsProps) {
  const { isAuthenticated, getIdToken } = useAuth();
  const [submitted, setSubmitted] = useState<SubmittedReview[]>([]);
  const [apiReviews, setApiReviews] = useState<{ pros: string[]; cons: string[]; others: string[] } | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      if (!offeringId) {
        setApiReviews(null);
        return;
      }

      setLoadingReviews(true);
      try {
        const response = await getReviews(offeringId);
        if (!cancelled) {
          setApiReviews({
            pros: response.pros ?? [],
            cons: response.cons ?? [],
            others: response.others ?? [],
          });
        }
      } catch {
        if (!cancelled) {
          setApiReviews(null);
        }
      } finally {
        if (!cancelled) {
          setLoadingReviews(false);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [offeringId]);

  const handleSubmit = async (review: { type: ReviewCategory; comment: string }) => {
    if (!offeringId) {
      throw new Error('review submission is not available');
    }

    const idToken = isAuthenticated ? await getIdToken() : null;

    await createReview(idToken, offeringId, review);
    setSubmitted((prev) => [...prev, { ...review, approved: false }]);
  };

  const displayPros = apiReviews?.pros ?? pros;
  const displayCons = apiReviews?.cons ?? cons;
  const displayOthers = apiReviews?.others ?? others;
  const pendingList = submitted.filter((r) => !r.approved);
  const approvedList = submitted.filter((r) => r.approved);
  const hasSubmitted = submitted.length > 0;
  const formDisabled = !offeringId;
  const disabledMessage = !offeringId
    ? 'この授業はまだ投稿 API と紐づいていません。'
    : undefined;

  return (
    <div className="space-y-4 md:space-y-6">
      {loadingReviews && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6 text-sm text-gray-500">
          口コミを読み込んでいます。
        </div>
      )}

      {displayPros.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <h2 className="text-base md:text-xl">良かったところ</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {displayPros.map((text, i) => (
              <ReviewItem key={i} text={text} />
            ))}
          </div>
        </div>
      )}

      {displayCons.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <h2 className="text-base md:text-xl">悪かったところ</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {displayCons.map((text, i) => (
              <ReviewItem key={i} text={text} />
            ))}
          </div>
        </div>
      )}

      {displayOthers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0" />
            <h2 className="text-base md:text-xl">その他の情報</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {displayOthers.map((text, i) => (
              <ReviewItem key={i} text={text} />
            ))}
          </div>
        </div>
      )}

      {/* 投稿した口コミのステータス */}
      {hasSubmitted && (
        <div className="border border-blue-200 bg-blue-50 rounded-2xl p-4 md:p-6 space-y-4">
          {/* 承認待ち */}
          {pendingList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                <h2 className="text-base md:text-xl text-blue-700">承認待ちの口コミ</h2>
              </div>
              <p className="text-xs md:text-sm text-blue-500 mb-3">
                投稿いただきありがとうございます。管理者が確認後、掲載されます。
              </p>
              <div className="space-y-3">
                {pendingList.map((review, i) => (
                  <div key={i} className="bg-white border border-blue-200 rounded-xl p-3 md:p-4 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-blue-400" />
                        </div>
                        <span className="text-xs text-blue-600 shrink-0">
                          {CATEGORY_LABELS[review.type]}
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-xs text-blue-400 shrink-0">
                          <Clock className="w-3 h-3" />
                          承認待ち
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed pl-7">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 承認済み */}
          {approvedList.length > 0 && (
            <div>
              {pendingList.length > 0 && <div className="border-t border-blue-200 my-1" />}
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-[#2B4DCA] shrink-0" />
                <h2 className="text-base md:text-xl text-[#2B4DCA]">承認済みの口コミ</h2>
              </div>
              <p className="text-xs md:text-sm text-blue-500 mb-3">
                以下の口コミは承認され、掲載されています。
              </p>
              <div className="space-y-3">
                {approvedList.map((review, i) => (
                  <div key={i} className="bg-white border border-blue-100 rounded-xl p-3 md:p-4 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-[#2B4DCA]" />
                        </div>
                        <span className="text-xs text-[#2B4DCA] shrink-0">
                          {CATEGORY_LABELS[review.type]}
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-xs text-[#2B4DCA] shrink-0">
                          <CheckCircle className="w-3 h-3" />
                          掲載中
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed pl-7">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ReviewForm onSubmit={handleSubmit} disabled={formDisabled} disabledMessage={disabledMessage} />
    </div>
  );
}
