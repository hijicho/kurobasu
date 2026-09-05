// 管理画面（時間割・口コミ一括追加など）で共通して使うカテゴリ一覧。
// スラッグは全て backend の categories.slug と一致させる。

export interface CategoryOption {
  slug: string;
  label: string;
}

export const directCategories: CategoryOption[] = [
  { slug: 'general-education', label: '総合教養科目' },
  { slug: 'first-year-education', label: '初年次教育科目' },
  { slug: 'foundation-list', label: '基礎教育科目' },
  { slug: 'information-literacy', label: '情報リテラシー科目' },
  { slug: 'english-japanese', label: '外国語科目（英語必修）ー日本語教師' },
  { slug: 'english-native', label: '外国語科目（英語必修）ー英語教師' },
];

export const specializedCategories: CategoryOption[] = [
  { slug: 'modern-system', label: '現代システム科学域' },
  { slug: 'science', label: '理学部' },
  { slug: 'engineering', label: '工学部' },
  { slug: 'agriculture', label: '農学部' },
  { slug: 'veterinary', label: '獣医学部' },
  { slug: 'medicine', label: '医学部医学科' },
  { slug: 'medical-rehab', label: '医学部リハビリテーション学科' },
  { slug: 'nursing', label: '看護学部' },
  { slug: 'human-life', label: '生活科学部' },
  { slug: 'literature', label: '文学部' },
  { slug: 'law', label: '法学部' },
  { slug: 'economics', label: '経済学部' },
  { slug: 'commerce', label: '商学部' },
];

export const secondLanguageCategories: CategoryOption[] = [
  { slug: 'chinese', label: '中国語' },
  { slug: 'korean', label: '朝鮮語' },
  { slug: 'russian', label: 'ロシア語' },
  { slug: 'german', label: 'ドイツ語' },
  { slug: 'french', label: 'フランス語' },
];

export const allAdminCategories: CategoryOption[] = [
  ...directCategories,
  ...specializedCategories,
  ...secondLanguageCategories,
];

export function categoryButtonClass(active: boolean) {
  return `rounded-full border px-3 py-1 text-xs font-bold transition ${
    active
      ? 'border-[#2b4dca] bg-[#2b4dca] text-white'
      : 'border-slate-300 bg-white text-slate-700 hover:border-[#2b4dca] hover:text-[#2b4dca]'
  }`;
}
