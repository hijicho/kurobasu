// 検索用の全授業データ
// 実際のプロダクションではAPIから取得するが、現在はモックデータを使用

export interface SearchableOffering {
  offering_id: number;
  title: string;
  course_code: string;
  instructor_names: string[];
  description?: string; // 将来的に授業概要を追加する場合
  category: string; // カテゴリ名
}

// 全授業データ（モック）
export const allOfferings: SearchableOffering[] = [
  // 総合教養科目（般教）
  {
    offering_id: 501,
    title: '線形代数',
    course_code: '1GBB001101',
    instructor_names: ['山田 太郎', '公大　花子'],
    category: '総合教養科目（般教）'
  },
  {
    offering_id: 502,
    title: '微分積分学',
    course_code: '1GBB001102',
    instructor_names: ['佐藤 次郎'],
    category: '総合教養科目（般教）'
  },
  {
    offering_id: 503,
    title: '情報リテラシー',
    course_code: '1GBB001103',
    instructor_names: ['田中 三郎'],
    category: '総合教養科目（般教）'
  },
  
  // 初年次教育科目（初ゼミ）
  {
    offering_id: 601,
    title: '人工知能を知り、考える',
    course_code: '1GBA001003',
    instructor_names: ['増山 直輝'],
    category: '初年次教育科目（初ゼミ）'
  },
  {
    offering_id: 602,
    title: 'GISを使って地域のことを考えよう',
    course_code: '1GBA001004',
    instructor_names: ['根本 達也'],
    category: '初年次教育科目（初ゼミ）'
  },
  {
    offering_id: 603,
    title: '日本近現代史の諸問題について',
    course_code: '1GBA001005',
    instructor_names: ['住友 陽文'],
    category: '初年次教育科目（初ゼミ）'
  },
  {
    offering_id: 604,
    title: '判例を読むー法学や刑事事件が好きな人へー',
    course_code: '1GBA001007',
    instructor_names: ['松倉 治代'],
    category: '初年次教育科目（初ゼミ）'
  },

  // 基礎教育科目 - 数学
  {
    offering_id: 1001,
    title: '解析Ⅰ',
    course_code: 'MATH101',
    instructor_names: ['山名'],
    category: '基礎教育科目（数学）'
  },
  {
    offering_id: 1002,
    title: '基礎数学A',
    course_code: 'MATH102',
    instructor_names: ['佐野', '壁谷', '宮地', '尾角'],
    category: '基礎教育科目（数学）'
  },
  {
    offering_id: 1003,
    title: '常微分方程式',
    course_code: 'MATH103',
    instructor_names: ['尾角', '濱本', '谷川'],
    category: '基礎教育科目（数学）'
  },
  {
    offering_id: 1004,
    title: '線形代数1',
    course_code: 'MATH104',
    instructor_names: ['佐藤', '佐野', '吉冨', '宮地', '山名', '川添', '松野', '源', '神田'],
    category: '基礎教育科目（数学）'
  },
  {
    offering_id: 1005,
    title: '統計学基礎1',
    course_code: 'MATH105',
    instructor_names: ['田中', '綿森'],
    category: '基礎教育科目（数学）'
  },
  {
    offering_id: 1006,
    title: '微積分1A',
    course_code: 'MATH106',
    instructor_names: ['中野', '古澤', '大須賀', '山名', '枡田', '田村', '砂川', '高松', '高橋'],
    category: '基礎教育科目（数学）'
  },
  {
    offering_id: 1007,
    title: '微積分1B',
    course_code: 'MATH107',
    instructor_names: ['山口'],
    category: '基礎教育科目（数学）'
  },
  {
    offering_id: 1008,
    title: 'ベクトル解析',
    course_code: 'MATH108',
    instructor_names: ['壁谷', '菅'],
    category: '基礎教育科目（数学）'
  },

  // 基礎教育科目 - 化学
  {
    offering_id: 1101,
    title: '基礎化学実験',
    course_code: 'CHEM101',
    instructor_names: ['臼杵', '複数人'],
    category: '基礎教育科目（化学）'
  },
  {
    offering_id: 1102,
    title: '基礎有機化学A',
    course_code: 'CHEM102',
    instructor_names: ['中瀬', '堀川', '藤岡'],
    category: '基礎教育科目（化学）'
  },
  {
    offering_id: 1103,
    title: '基礎無機・分析化学A',
    course_code: 'CHEM103',
    instructor_names: ['中沢', '道志'],
    category: '基礎教育科目（化学）'
  },
  {
    offering_id: 1104,
    title: '基礎無機・物理化学',
    course_code: 'CHEM104',
    instructor_names: ['佐藤', '谷口', '陶山'],
    category: '基礎教育科目（化学）'
  },
  {
    offering_id: 1105,
    title: '基礎物理化学A',
    course_code: 'CHEM105',
    instructor_names: ['手木', '池田'],
    category: '基礎教育科目（化学）'
  },

  // 基礎教育科目 - 物理学
  {
    offering_id: 1201,
    title: '応用物理学実験',
    course_code: 'PHYS101',
    instructor_names: ['田口'],
    category: '基礎教育科目（物理学）'
  },
  {
    offering_id: 1202,
    title: '基礎力学1A',
    course_code: 'PHYS102',
    instructor_names: ['安井', '有馬'],
    category: '基礎教育科目（物理学）'
  },
  {
    offering_id: 1203,
    title: '基礎力学B1',
    course_code: 'PHYS103',
    instructor_names: ['譚', '魚住'],
    category: '基礎教育科目（物理学）'
  },
  {
    offering_id: 1204,
    title: '基礎力学B3',
    course_code: 'PHYS104',
    instructor_names: ['原田'],
    category: '基礎教育科目（物理学）'
  },
  {
    offering_id: 1205,
    title: '基礎力学C',
    course_code: 'PHYS105',
    instructor_names: ['吉野', '星野', '濱端'],
    category: '基礎教育科目（物理学）'
  },
  {
    offering_id: 1206,
    title: '基礎熱力学',
    course_code: 'PHYS106',
    instructor_names: ['吉田', '坪田', '松野', '石原'],
    category: '基礎教育科目（物理学）'
  },
  {
    offering_id: 1207,
    title: '基礎統計力学',
    course_code: 'PHYS107',
    instructor_names: ['堀田'],
    category: '基礎教育科目（物理学）'
  },
  {
    offering_id: 1208,
    title: '基礎電磁気学C',
    course_code: 'PHYS108',
    instructor_names: ['大橋', '櫻井', '濱端'],
    category: '基礎教育科目（物理学）'
  },
  {
    offering_id: 1209,
    title: '基礎物理学実験1B',
    course_code: 'PHYS109',
    instructor_names: ['梅澤', '臼井', '市川'],
    category: '基礎教育科目（物理学）'
  },
  {
    offering_id: 1210,
    title: '近代物理学',
    course_code: 'PHYS110',
    instructor_names: ['阪部'],
    category: '基礎教育科目（物理学）'
  },
  {
    offering_id: 1211,
    title: '入門物理学1',
    course_code: 'PHYS111',
    instructor_names: ['大田'],
    category: '基礎教育科目（物理学）'
  },

  // 基礎教育科目 - 生物学
  {
    offering_id: 1301,
    title: '生物学1',
    course_code: 'BIO101',
    instructor_names: ['加藤', '名波', '宮崎', '寺北', '竹門', '刀祢', '笠松', '齋藤', '安房田'],
    category: '基礎教育科目（生物学）'
  },
  {
    offering_id: 1302,
    title: '生物学実験A',
    course_code: 'BIO102',
    instructor_names: ['白石'],
    category: '基礎教育科目（生物学）'
  },

  // 基礎教育科目 - 地学
  {
    offering_id: 1401,
    title: '地球学基礎A',
    course_code: 'GEO101',
    instructor_names: ['瀬戸', '柵山', '足立'],
    category: '基礎教育科目（地学）'
  },
  {
    offering_id: 1402,
    title: '地球学入門',
    course_code: 'GEO102',
    instructor_names: ['山口', '桑原'],
    category: '基礎教育科目（地学）'
  },

  // 基礎教育科目 - 情報学
  {
    offering_id: 1501,
    title: '人間システムとサスティナビリティ',
    course_code: 'INFO101',
    instructor_names: [],
    category: '基礎教育科目（情報学）'
  },
  {
    offering_id: 1502,
    title: '情報システムとサステイナビリティ',
    course_code: 'INFO102',
    instructor_names: [],
    category: '基礎教育科目（情報学）'
  },

  // 情報リテラシー科目
  {
    offering_id: 2001,
    title: '情報リテラシー演習',
    course_code: 'IL001',
    instructor_names: ['林 祐樹'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2002,
    title: '情報リテラシー演習',
    course_code: 'IL002',
    instructor_names: ['桝田聖子'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2003,
    title: '情報リテラシー演習',
    course_code: 'IL003',
    instructor_names: ['藤田昭人'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2004,
    title: '情報リテラシー演習',
    course_code: 'IL004',
    instructor_names: ['野口 典正'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2005,
    title: '情報リテラシー演習',
    course_code: 'IL005',
    instructor_names: ['戸出英樹', '北條仁志'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2006,
    title: '情報リテラシー演習',
    course_code: 'IL006',
    instructor_names: ['永田 好克'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2007,
    title: '情報リテラシー演習',
    course_code: 'IL007',
    instructor_names: ['藤本まなと'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2008,
    title: '情報リテラシー演習',
    course_code: 'IL008',
    instructor_names: ['岩田基'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2009,
    title: '情報リテラシー演習',
    course_code: 'IL009',
    instructor_names: ['増山直輝', '能島裕介'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2010,
    title: '情報リテラシー演習',
    course_code: 'IL010',
    instructor_names: ['木谷裕紀'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2011,
    title: '情報リテラシー演習',
    course_code: 'IL011',
    instructor_names: ['西村雄一郎'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2012,
    title: '情報リテラシー演習',
    course_code: 'IL012',
    instructor_names: ['吉田 大介'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2013,
    title: '情報リテラシー演習',
    course_code: 'IL013',
    instructor_names: ['TRAN THI HONG'],
    category: '情報リテラシー科目'
  },
  {
    offering_id: 2014,
    title: '情報リテラシー演習',
    course_code: 'IL014',
    instructor_names: ['大西 克実'],
    category: '情報リテラシー科目'
  },

  // 外国語科目(英語必修)-日本語教師（一部抜粋）
  {
    offering_id: 3001,
    title: '英語コミュニケーション',
    course_code: 'ENG001',
    instructor_names: ['井狩幸男'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3002,
    title: '英語コミュニケーション',
    course_code: 'ENG002',
    instructor_names: ['稲垣 スーチン'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3003,
    title: '英語コミュニケーション',
    course_code: 'ENG003',
    instructor_names: ['田路 敏彦'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3004,
    title: '英語コミュニケーション',
    course_code: 'ENG004',
    instructor_names: ['藤井 佳子'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3005,
    title: '英語コミュニケーション',
    course_code: 'ENG005',
    instructor_names: ['薮井恵美子'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3006,
    title: '英語コミュニケーション',
    course_code: 'ENG006',
    instructor_names: ['高谷 華'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3007,
    title: '英語コミュニケーション',
    course_code: 'ENG007',
    instructor_names: ['熊懐 祐樹'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3008,
    title: '英語コミュニケーション',
    course_code: 'ENG008',
    instructor_names: ['倉垣 澄子'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3009,
    title: '英語コミュニケーション',
    course_code: 'ENG009',
    instructor_names: ['川端 淳司'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3010,
    title: '英語コミュニケーション',
    course_code: 'ENG010',
    instructor_names: ['筒井 香代子'],
    category: '外国語科目(英語必修)'
  },

  // 外国語科目(英語必修)-英語教師（一部抜粋）
  {
    offering_id: 3101,
    title: 'English Communication',
    course_code: 'ENG101',
    instructor_names: ['Pollock Timothy Wayne'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3102,
    title: 'English Communication',
    course_code: 'ENG102',
    instructor_names: ['Richard Farmer'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3103,
    title: 'English Communication',
    course_code: 'ENG103',
    instructor_names: ['Ocon Auric Bertram'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3104,
    title: 'English Communication',
    course_code: 'ENG104',
    instructor_names: ['Selzer Mark Alan'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3105,
    title: 'English Communication',
    course_code: 'ENG105',
    instructor_names: ['Jones Barbara Ann'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3106,
    title: 'English Communication',
    course_code: 'ENG106',
    instructor_names: ['Kanaras Ioanis'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3107,
    title: 'English Communication',
    course_code: 'ENG107',
    instructor_names: ['Joseph Mark McAvoy'],
    category: '外国語科目(英語必修)'
  },
  {
    offering_id: 3108,
    title: 'English Communication',
    course_code: 'ENG108',
    instructor_names: ['Hudgens Donald James'],
    category: '外国語科目(英語必修)'
  },

  // 経済学部専門科目（一部抜粋）
  {
    offering_id: 4001,
    title: 'マクロ経済学',
    course_code: 'ECO001',
    instructor_names: ['齊藤'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4002,
    title: 'ミクロ経済学',
    course_code: 'ECO002',
    instructor_names: ['廣瀬'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4003,
    title: '金融論',
    course_code: 'ECO003',
    instructor_names: ['北野'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4004,
    title: '財政学',
    course_code: 'ECO004',
    instructor_names: ['中矢'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4005,
    title: '経済史',
    course_code: 'ECO005',
    instructor_names: ['牧'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4006,
    title: '経済政策論',
    course_code: 'ECO006',
    instructor_names: ['松永'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4007,
    title: '経営戦略論',
    course_code: 'ECO007',
    instructor_names: ['中本'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4008,
    title: '労働経済学',
    course_code: 'ECO008',
    instructor_names: ['瀬尾'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4009,
    title: '環境政策論',
    course_code: 'ECO009',
    instructor_names: ['除本'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4010,
    title: '公共経済学',
    course_code: 'ECO010',
    instructor_names: ['鈴木'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4011,
    title: '国際貿易論',
    course_code: 'ECO011',
    instructor_names: ['韓'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4012,
    title: 'ゲーム理論',
    course_code: 'ECO012',
    instructor_names: ['廣瀬'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4013,
    title: '統計学',
    course_code: 'ECO013',
    instructor_names: ['田中'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4014,
    title: '計量経済学',
    course_code: 'ECO014',
    instructor_names: ['金子'],
    category: '経済学部専門科目'
  },
  {
    offering_id: 4015,
    title: '開発経済学',
    course_code: 'ECO015',
    instructor_names: ['辻'],
    category: '経済学部専門科目'
  },

  // 商学部専門科目（一部抜粋）
  {
    offering_id: 5001,
    title: '会計基礎論',
    course_code: 'COM001',
    instructor_names: ['浅野'],
    category: '商学部専門科目'
  },
  {
    offering_id: 5002,
    title: 'マーケティング管理論',
    course_code: 'COM002',
    instructor_names: ['小林'],
    category: '商学部専門科目'
  },
  {
    offering_id: 5003,
    title: '経営管理論',
    course_code: 'COM003',
    instructor_names: ['松尾'],
    category: '商学部専門科目'
  },
  {
    offering_id: 5004,
    title: '自治体財政論',
    course_code: 'COM004',
    instructor_names: ['水上'],
    category: '商学部専門科目'
  },
  {
    offering_id: 5005,
    title: '都市交通論',
    course_code: 'COM005',
    instructor_names: ['姜'],
    category: '商学部専門科目'
  },
  {
    offering_id: 5006,
    title: '国際経営論',
    course_code: 'COM006',
    instructor_names: ['石井'],
    category: '商学部専門科目'
  },
  {
    offering_id: 5007,
    title: '経営学',
    course_code: 'COM007',
    instructor_names: ['中瀬'],
    category: '商学部専門科目'
  },
  {
    offering_id: 5008,
    title: '地域経済論',
    course_code: 'COM008',
    instructor_names: ['松永'],
    category: '商学部専門科目'
  },
  {
    offering_id: 5009,
    title: '中小企業論',
    course_code: 'COM009',
    instructor_names: ['本多'],
    category: '商学部専門科目'
  },
  {
    offering_id: 5010,
    title: '不動産概論',
    course_code: 'COM010',
    instructor_names: ['北野'],
    category: '商学部専門科目'
  },
];

/**
 * 授業を検索する
 * @param query 検索クエリ
 * @param maxResults 最大件数（デフォルト10件）
 * @returns 検索結果
 */
export function searchOfferings(query: string, maxResults: number = 10): SearchableOffering[] {
  if (!query || query.trim() === '') {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  const results = allOfferings.filter(offering => {
    // 授業名で検索
    if (offering.title.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // 授業コードで検索
    if (offering.course_code.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    // 教員名で検索
    if (offering.instructor_names.some(name => name.toLowerCase().includes(normalizedQuery))) {
      return true;
    }
    
    // 授業概要で検索（将来的に対応）
    if (offering.description && offering.description.toLowerCase().includes(normalizedQuery)) {
      return true;
    }
    
    return false;
  });

  // 最大件数まで返す
  return results.slice(0, maxResults);
}