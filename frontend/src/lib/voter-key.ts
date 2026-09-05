// 匿名投稿者ID。以前はバックエンドが発行するCookieで管理していたが、本番では
// フロントエンド(Vercel)とAPI(Cloud Run)がクロスサイトになるため、そのCookieは
// ブラウザからは「サードパーティCookie」として扱われ、Safari/Firefox/Chromeの
// サードパーティCookieブロックにより保存・送信されないことがある。その結果、
// おすすめ度を投稿した直後に削除しようとすると「削除対象の評価が見つかりません」
// になる不具合が起きていた。
//
// そこでCookieをやめ、フロントエンド側でlocalStorageにIDを持たせて
// X-Voter-Key ヘッダで明示的に送る方式にした。localStorageは常に
// ファーストパーティなので、この問題が起きない。
const VOTER_KEY_STORAGE_KEY = 'kb_voter_key';

function generateVoterKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// サーバーサイドレンダリング時やlocalStorageが使えない環境ではundefinedを返す。
export function getVoterKey(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    const existing = window.localStorage.getItem(VOTER_KEY_STORAGE_KEY);
    if (existing) return existing;
    const key = generateVoterKey();
    window.localStorage.setItem(VOTER_KEY_STORAGE_KEY, key);
    return key;
  } catch {
    // プライベートブラウジング等でlocalStorageが使えない場合は諦める
    // （投稿・削除の紐付けはできないが、閲覧自体は引き続き可能）。
    return undefined;
  }
}
