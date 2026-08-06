// 般教レベル評価.txtから抽出したレベル評価マッピング
// 授業名と教員名のペアでレベルを検索

export type LevelType = 'AA' | 'A' | 'B' | 'C' | null;

interface LevelMapping {
  courseName: string;
  instructor: string;
  level: LevelType;
}

export const levelMappings: LevelMapping[] = [
  // AA：楽単！！（非常にとりやすい、オンデマンドで完結、持ち込みで余裕など）
  { courseName: '現代の経営', instructor: '高橋 信弘', level: 'AA' },
  { courseName: '化学への招待', instructor: '藤井 律子', level: 'AA' },
  { courseName: '心理学入門', instructor: '橋本 博文', level: 'AA' },
  { courseName: '教育と文化', instructor: '高根 雅啓', level: 'AA' },
  { courseName: '日本国憲法', instructor: '松本 慶信', level: 'AA' },
  { courseName: '東洋史の見方', instructor: '櫻井 俊郎', level: 'AA' },
  { courseName: 'コンピューターグラフィックス概論', instructor: '野口 典正', level: 'AA' },
  { courseName: '大阪の都市づくり', instructor: '大塚 耕司', level: 'AA' },
  { courseName: '障がい者と人権A', instructor: '松波 めぐみ', level: 'AA' },
  { courseName: '健康へのアプローチ', instructor: '古澤 直人', level: 'AA' },
  { courseName: '政治学入門', instructor: '井坂 圭吾', level: 'AA' },
  { courseName: '心理学入門', instructor: '畑野 快', level: 'AA' },
  { courseName: '現代社会と健康', instructor: '吉川 貴仁', level: 'AA' },
  { courseName: '工学研究の最先端', instructor: '野村 俊之 ほか', level: 'AA' },

  // A：普通（普通に出席・課題をこなせば順当に取れる、少しの努力で取れるなど）
  { courseName: '共生社会と宗教', instructor: '岡尾 将秀', level: 'A' },
  { courseName: '大学でどう学ぶか', instructor: '山東 功', level: 'A' },
  { courseName: '東洋史の見方', instructor: '櫻井 俊郎', level: 'A' },
  { courseName: '都市生活と人間福祉', instructor: '田中 弘美', level: 'A' },
  { courseName: 'スポーツと社会', instructor: '中山 健', level: 'A' },
  { courseName: '日本の近代文学', instructor: '奥野 久美子', level: 'A' },
  { courseName: 'ことばの歴史', instructor: '奥村 和子', level: 'A' },
  { courseName: '教育と発達の心理学', instructor: '西垣 順子', level: 'A' },
  { courseName: '数理・データサイエンス基礎B', instructor: '杉山 京', level: 'A' },
  { courseName: '東洋社会の歴史', instructor: '櫻井 俊郎', level: 'A' },
  { courseName: 'プレゼンテーション技法', instructor: '橋本 智也', level: 'A' },
  { courseName: '西洋史の見方', instructor: '向井 伸哉', level: 'A' },
  { courseName: '世界のなかの日本経済', instructor: '小川 亮', level: 'A' },
  { courseName: '生物学への招待', instructor: '加藤 幹男', level: 'A' },
  { courseName: '地球学への招待', instructor: '桑原 希世子', level: 'A' },
  { courseName: '倫理学入門', instructor: '亀喜 信', level: 'A' },
  { courseName: '日本国憲法', instructor: '竹村 和也', level: 'A' },
  { courseName: '現代の医療', instructor: '橘 大介', level: 'A' },
  { courseName: 'コミュニティ防災', instructor: '生田 英輔', level: 'A' },
  { courseName: '生物学への招待', instructor: '山口 良弘', level: 'A' },
  { courseName: '戦争と人間', instructor: '小林 啓治', level: 'A' },
  { courseName: '都市の地理学', instructor: '菅野 拓', level: 'A' },
  { courseName: '日本事情A', instructor: '森田 耕平', level: 'A' },
  { courseName: '現代科学と人間', instructor: '天尾 豊', level: 'A' },
  { courseName: '大阪落語への招待', instructor: '久堀 裕朗', level: 'A' },
  { courseName: '心理学入門', instructor: '田端 拓哉 / 中村 敏', level: 'A' },
  { courseName: 'クィアスタディーズ', instructor: '新ヶ江 章友', level: 'A' },
  { courseName: 'バリアフリー論', instructor: '三田 優子', level: 'A' },

  // B：興味があれば（課題が重め、暗記やノート・板書が必須、最高評価が取りづらいなど）
  { courseName: '日本史の見方', instructor: '磐下 徹', level: 'B' },
  { courseName: '生物化学への招待', instructor: '木下 誉富', level: 'B' },
  { courseName: '芸術の世界', instructor: '高梨 友宏', level: 'B' },
  { courseName: 'アーツマネジメント', instructor: '菅原 真弓', level: 'B' },
  { courseName: '現代社会学入門', instructor: '片桐 勇人', level: 'B' },
  { courseName: '西洋社会文化史', instructor: '佐々木 博光', level: 'B' },
  { courseName: '中国の思想', instructor: '池平 紀子', level: 'B' },
  { courseName: '現代地理学入門', instructor: '山﨑 孝史', level: 'B' },
  { courseName: '東洋美術史', instructor: '西尾 歩', level: 'B' },
  { courseName: 'アイデンティティと文化', instructor: '今松 泰', level: 'B' },
  { courseName: '哲学的人間学', instructor: '亀喜 信', level: 'B' },
  { courseName: '哲学と社会', instructor: '内藤 葉子', level: 'B' },
  { courseName: 'ことばの歴史', instructor: '大島 英之', level: 'B' },
  { courseName: 'ジェンダー論入門', instructor: '東 優子', level: 'B' },
  { courseName: '創薬科学のすすめ', instructor: '乾 隆', level: 'B' },
  { courseName: '日本の古典文学', instructor: '西田 正宏', level: 'B' },
  { courseName: '測定・実験で学ぶ人間と社会', instructor: '平 知宏', level: 'B' },
  { courseName: '環境と文化', instructor: '祖田 亮次', level: 'B' },
  { courseName: 'エスニック・スタディ', instructor: '明戸 隆浩', level: 'B' },
  { courseName: '労働と人権', instructor: '川越 道子', level: 'B' },
  { courseName: '現代の部落問題', instructor: '廣岡 浄進', level: 'B' },
  { courseName: '地球市民と人権', instructor: '阿久澤 麻理子', level: 'B' },
  { courseName: '人間と居住環境', instructor: '岡本 滋史', level: 'B' },
  { courseName: '美術史', instructor: '一本 崇之', level: 'B' },
  { courseName: '大阪の都市づくり', instructor: '岡田 広久', level: 'B' },
  { courseName: '言語学入門', instructor: '宮畑 一範', level: 'B' },
  { courseName: '人体を考える', instructor: '鈴木 周五', level: 'B' },
  { courseName: '現代社会と大学', instructor: '深野 政之', level: 'B' },
  { courseName: '東洋史の見方', instructor: '三浦 雄城', level: 'B' },
  { courseName: '倫理学入門', instructor: '土屋 貴志', level: 'B' },
  { courseName: '経済学の歴史と思想', instructor: '下村 晃平', level: 'B' },
  { courseName: 'メディアと人権', instructor: '中村 一成', level: 'B' },
  { courseName: 'ジェンダー論入門', instructor: '藤田 朋子', level: 'B' },
  { courseName: '暮らしと政治', instructor: '稲永 祐介', level: 'B' },
  { courseName: '西洋宗教文化史', instructor: '佐々木 博光', level: 'B' },

  // C：よほど興味があれば（落単者が多い、テストが激ムズ、教授の思想が強く合わないとキツいなど）
  { courseName: '文化人類学入門', instructor: '多和田 裕司', level: 'C' },
  { courseName: '観光研究入門', instructor: '天野 景太', level: 'C' },
  { courseName: '音楽の諸相', instructor: '増田 聡', level: 'C' },
  { courseName: '思想と社会', instructor: '前川 真行', level: 'C' },
  { courseName: '新西洋事情', instructor: '佐々木 博光', level: 'C' },
];

// 授業名と教員名からレベルを取得する関数
export function getLevel(courseName: string, instructor: string): LevelType {
  // 授業名と教員名を正規化（スペース削除）
  const normalizedCourseName = courseName.trim();
  const normalizedInstructor = instructor.replace(/\s+/g, '');
  
  const mapping = levelMappings.find((m) => {
    const mappingInstructor = m.instructor.replace(/\s+/g, '');
    return m.courseName === normalizedCourseName && mappingInstructor === normalizedInstructor;
  });
  
  // 完全一致で見つからない場合、教員名の部分一致も試す
  if (!mapping) {
    const partialMapping = levelMappings.find((m) => {
      const mappingInstructor = m.instructor.replace(/\s+/g, '');
      // スラッシュ区切りの教員名の場合、最初の教員名で比較
      const firstInstructor = mappingInstructor.split('/')[0];
      return m.courseName === normalizedCourseName && normalizedInstructor.includes(firstInstructor);
    });
    return partialMapping?.level || null;
  }
  
  return mapping?.level || null;
}