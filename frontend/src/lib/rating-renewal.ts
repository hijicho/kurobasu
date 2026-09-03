// おすすめ度のランク基準見直し（2026-09-03）を告知する期間の終了日時。
// この日時を過ぎたら、お知らせは自動的に表示されなくなる。
const RATING_RENEWAL_NOTICE_UNTIL = new Date('2026-10-15T00:00:00+09:00');

export function isRatingRenewalNoticeActive(now: Date = new Date()): boolean {
  return now.getTime() < RATING_RENEWAL_NOTICE_UNTIL.getTime();
}
