export const DEFAULT_PUBLIC_TERM = 'spring';

export const termLabels: Record<string, string> = {
  spring: '前期',
  fall: '後期',
  intensive: '集中',
  year: '通年',
};

export const categoryNames: Record<string, string> = {
  'general-education': '総合教養科目（般教）',
  'foundation-list': '基礎教育科目',
  'first-year-education': '初年次教育科目（初ゼミ）',
  'information-literacy': '情報リテラシー科目',
  'english-japanese': '外国語科目(英語必修)-日本語教師',
  'english-native': '外国語科目(英語必修)-英語教師',
  'modern-system': '現代システム科学域',
  science: '理学部',
  engineering: '工学部',
  agriculture: '農学部',
  veterinary: '獣医学部',
  medicine: '医学部医学科',
  'medical-rehab': '医学部リハビリテーション学科',
  nursing: '看護学部',
  'human-life': '生活科学部',
  literature: '文学部',
  law: '法学部',
  economics: '経済学部',
  commerce: '商学部',
};

export function publicTopPath(year: number | string, term: string) {
  return `/${year}/${term}`;
}

export function publicCategoryPath(year: number | string, term: string, categorySlug: string) {
  return `/${year}/${term}/courses/${categorySlug}`;
}

export function publicOfferingPath(year: number | string, term: string, categorySlug: string, offeringId: number | string) {
  return `/${year}/${term}/courses/${categorySlug}/${offeringId}`;
}

export function fallbackPublicYear() {
  return new Date().getFullYear();
}

export function isValidPublicTerm(term: string) {
  return Object.prototype.hasOwnProperty.call(termLabels, term);
}

export function parsePublicYear(year: string) {
  const value = Number(year);
  if (!Number.isInteger(value) || value < 2000 || value > 2100) {
    return null;
  }
  return value;
}
