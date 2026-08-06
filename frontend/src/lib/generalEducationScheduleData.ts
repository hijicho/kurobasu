// 総合教養科目の時間割データ（CSVから生成）
export interface ScheduleCourse {
  id: string;
  day: string; // 月、火、水、木、金、時間割外
  period: string; // 1限、2限、3限、4限、5限
  courseCode: string;
  courseName: string;
  instructor: string;
  classroom: string;
  note: string;
}

// 添付ファイルのCSVデータから抽出した時間割データ
export const scheduleCoursesData: ScheduleCourse[] = [
  // 月曜日
  { id: 'sch-001', day: '月', period: '1限', courseCode: '1GAF018301', courseName: '現代の経営 /全(商以外)_森', instructor: '高橋　信弘', classroom: '遠隔授業（定期試験は対面）', note: '抽選' },
  { id: 'sch-002', day: '月', period: '1限', courseCode: '1GAF028201', courseName: 'スポーツと社会 /全_森', instructor: '中山　健', classroom: '401大教室', note: '抽選' },
  { id: 'sch-003', day: '月', period: '2限', courseCode: '1GAA003301', courseName: '日本史の見方 /全_森', instructor: '磐下　徹', classroom: '403大教室', note: '抽選' },
  { id: 'sch-004', day: '月', period: '2限', courseCode: '1GAC006301', courseName: '生物化学への招待 /全_森', instructor: '木下　誉富', classroom: '602大教室', note: '抽選' },
  { id: 'sch-005', day: '月', period: '2限', courseCode: '1GAC004301', courseName: '化学への招待 /全_森', instructor: '藤井　律子', classroom: '401大教室', note: '抽選' },
  { id: 'sch-006', day: '月', period: '2限', courseCode: '1GAG016301', courseName: '日本の近代文学 /全_森', instructor: '奥野　久美子', classroom: '516大教室', note: '抽選' },
  { id: 'sch-007', day: '月', period: '2限', courseCode: '1GAG018301', courseName: '芸術の世界 /全_森', instructor: '高梨　友宏', classroom: '402大教室', note: '抽選' },
  { id: 'sch-008', day: '月', period: '2限', courseCode: '1GAG024301', courseName: 'アーツマネジメント /全_森', instructor: '菅原　真弓', classroom: '601大教室', note: '抽選' },
  { id: 'sch-009', day: '月', period: '3限', courseCode: '1GAF004201', courseName: '共生社会と宗教 /全_森', instructor: '岡尾　将秀', classroom: '402大教室', note: '抽選' },
  { id: 'sch-010', day: '月', period: '4限', courseCode: '1GAB002302', courseName: '心理学入門 /全_森', instructor: '橋本　博文', classroom: '講堂', note: '抽選' },
  { id: 'sch-011', day: '月', period: '4限', courseCode: '1GAB003301', courseName: '現代社会学入門 /全_森', instructor: '片桐　勇人', classroom: '518中教室', note: '抽選' },
  { id: 'sch-012', day: '月', period: '4限', courseCode: '1GAF005201', courseName: '教育と文化 /全_森', instructor: '高根　雅啓', classroom: '515大教室', note: '抽選' },
  { id: 'sch-013', day: '月', period: '4限', courseCode: '1GAG006201', courseName: 'ことばの歴史 /全_森', instructor: '奥村　和子', classroom: '303中教室', note: '抽選' },
  { id: 'sch-014', day: '月', period: '4限', courseCode: '1GAG035201', courseName: '西洋社会文化史 /全_森', instructor: '佐々木　博光', classroom: '404中教室', note: '抽選' },
  { id: 'sch-015', day: '月', period: '5限', courseCode: '1GAB001301', courseName: '日本国憲法 /全_森', instructor: '松本　慶信', classroom: '515大教室', note: '抽選' },
  { id: 'sch-016', day: '月', period: '5限', courseCode: '1GAG031201', courseName: '中国の思想 /全_森', instructor: '池平　紀子', classroom: '516大教室', note: '抽選' },
  
  // 火曜日
  { id: 'sch-017', day: '火', period: '1限', courseCode: '1GAF010301', courseName: '教育と発達の心理学 /全_森', instructor: '西垣　順子', classroom: '403大教室', note: '抽選' },
  { id: 'sch-018', day: '火', period: '1限', courseCode: '1GAK002301', courseName: '数理・データサイエンス基礎B /全_森', instructor: '杉山　京', classroom: '515大教室', note: '抽選' },
  { id: 'sch-019', day: '火', period: '2限', courseCode: '1GAG003201', courseName: '東洋社会の歴史 /全_森', instructor: '櫻井　俊郎', classroom: '516大教室', note: '抽選' },
  { id: 'sch-020', day: '火', period: '2限', courseCode: '1GBC003101', courseName: 'プレゼンテーション技法 /全_森', instructor: '橋本　智也', classroom: '402大教室', note: '抽選' },
  { id: 'sch-021', day: '火', period: '3限', courseCode: '1GAB006301', courseName: '文化人類学入門 /全_森', instructor: '多和田　裕司', classroom: '講堂', note: '抽選' },
  { id: 'sch-022', day: '火', period: '3限', courseCode: '1GAC001201', courseName: '科学技術と社会 /全_森', instructor: '市田　秀樹', classroom: '602大教室', note: '抽選' },
  { id: 'sch-023', day: '火', period: '4限', courseCode: '1GAA001301', courseName: '哲学入門 /全_森', instructor: '佐金　武', classroom: '402大教室', note: '抽選' },
  { id: 'sch-024', day: '火', period: '4限', courseCode: '1GAA005301', courseName: '西洋史の見方 /全_森', instructor: '向井　伸哉', classroom: '講堂', note: '抽選' },
  { id: 'sch-025', day: '火', period: '4限', courseCode: '1GAB005301', courseName: '現代地理学入門 /全_森', instructor: '山﨑　孝史', classroom: '516大教室', note: '抽選' },
  { id: 'sch-026', day: '火', period: '4限', courseCode: '1GAG019201', courseName: '東洋美術史 /全_森', instructor: '西尾　歩', classroom: '603大教室', note: '抽選' },
  { id: 'sch-027', day: '火', period: '4限', courseCode: '1GAF016301', courseName: '世界のなかの日本経済 /全_森', instructor: '小川　亮', classroom: '遠隔授業（定期試験は対面）', note: '抽選' },
  { id: 'sch-028', day: '火', period: '5限', courseCode: '1GAC008301', courseName: '英語で学ぶ基礎科学への招待 /全_森', instructor: 'ＫＩＭＢＡＬＬ　ＭＡＲＴＩＮ', classroom: '403大教室', note: '抽選' },
  
  // 水曜日
  { id: 'sch-029', day: '水', period: '1限', courseCode: '1GAG012301', courseName: '世界の文学 /全_森', instructor: '福田　知可志', classroom: '401大教室', note: '抽選' },
  { id: 'sch-030', day: '水', period: '1限', courseCode: '1GAG027201', courseName: 'アイデンティティと文化 /全_森', instructor: '今松　泰', classroom: '601大教室', note: '抽選' },
  { id: 'sch-031', day: '水', period: '2限', courseCode: '1GAC005201', courseName: '生物学への招待 /全_森', instructor: '加藤　幹男', classroom: '603大教室', note: '抽選' },
  { id: 'sch-032', day: '水', period: '2限', courseCode: '1GAC007201', courseName: '地球学への招待 /全_森', instructor: '桑原　希世子', classroom: '515大教室', note: '抽選' },
  { id: 'sch-033', day: '水', period: '2限', courseCode: '1GAF001203', courseName: '哲学的人間学 /全_森', instructor: '亀喜　信', classroom: '417中教室', note: '抽選' },
  { id: 'sch-034', day: '水', period: '2限', courseCode: '1GAF002201', courseName: '哲学と社会 /全_森', instructor: '内藤　葉子', classroom: '303中教室', note: '抽選' },
  { id: 'sch-035', day: '水', period: '2限', courseCode: '1GAF022301', courseName: '都市的世界の社会学 /全_森', instructor: '金　希相', classroom: '403大教室', note: '抽選' },
  { id: 'sch-036', day: '水', period: '2限', courseCode: '1GAG006301', courseName: 'ことばの歴史 /全_森', instructor: '大島　英之', classroom: '516大教室', note: '抽選' },
  { id: 'sch-037', day: '水', period: '2限', courseCode: '1GAH006301', courseName: '植物の科学 /全_森', instructor: '曽我　康一', classroom: '402大教室', note: '抽選' },
  { id: 'sch-038', day: '水', period: '3限', courseCode: '1GAA002202', courseName: '倫理学入門 /全_森', instructor: '亀喜　信', classroom: '401大教室', note: '抽選' },
  { id: 'sch-039', day: '水', period: '3限', courseCode: '1GAB009201', courseName: 'ジェンダー論入門 /全_森', instructor: '東　優子', classroom: '515大教室', note: '抽選' },
  { id: 'sch-040', day: '水', period: '3限', courseCode: '1GAF024301', courseName: 'メディアの社会学 /全_森', instructor: '石田　佐恵子', classroom: '601大教室', note: '抽選' },
  { id: 'sch-041', day: '水', period: '3限', courseCode: '1GAF030301', courseName: '観光研究入門 /全_森', instructor: '天野　景太', classroom: '402大教室', note: '抽選' },
  { id: 'sch-042', day: '水', period: '3限', courseCode: '1GAG021301', courseName: '音楽の諸相 /全_森', instructor: '増田　聡', classroom: '403大教室', note: '抽選' },
  { id: 'sch-043', day: '水', period: '3限', courseCode: '1GAH014201', courseName: '創薬科学のすすめ /全_森', instructor: '乾　隆', classroom: '516大教室', note: '抽選' },
  { id: 'sch-044', day: '水', period: '4限', courseCode: '1GAA004201', courseName: '東洋史の見方 /全_森', instructor: '櫻井　俊郎', classroom: '515大教室', note: '抽選' },
  { id: 'sch-045', day: '水', period: '4限', courseCode: '1GAB001202', courseName: '日本国憲法 /全_森', instructor: '竹村　和也', classroom: '516大教室', note: '抽選' },
  { id: 'sch-046', day: '水', period: '4限', courseCode: '1GAG001101', courseName: '歴史を学ぶとは /全_森', instructor: '林　尚之', classroom: '602大教室', note: '抽選' },
  { id: 'sch-047', day: '水', period: '4限', courseCode: '1GAJ005201', courseName: '現代社会と大学 /全_森', instructor: '深野　政之', classroom: '601大教室', note: '抽選' },
  { id: 'sch-048', day: '水', period: '5限', courseCode: '1GAB001203', courseName: '日本国憲法 /全_森', instructor: '竹村　和也', classroom: '516大教室', note: '抽選' },
  { id: 'sch-049', day: '水', period: '5限', courseCode: '1GAE008301', courseName: '現代の医療 /全_森', instructor: '橘　大介', classroom: '402大教室', note: '抽選' },
  { id: 'sch-050', day: '水', period: '5限', courseCode: '1GAF040301', courseName: 'コミュニティ防災 /全_森', instructor: '生田　英輔', classroom: '401大教室', note: '抽選' },
  { id: 'sch-051', day: '水', period: '5限', courseCode: '1GAJ004301', courseName: '大学でどう学ぶか /全_森', instructor: '飯吉　弘子', classroom: '601大教室', note: '抽選' },
  
  // 木曜日
  { id: 'sch-052', day: '木', period: '1限', courseCode: '1GAH001201', courseName: '社会に活きる科学 /全_森', instructor: '尾角　正人', classroom: '515大教室', note: '抽選' },
  { id: 'sch-053', day: '木', period: '1限', courseCode: '1GAH012201', courseName: 'コンピューターグラフィックス概論 /全_森', instructor: '野口　典正', classroom: '516大教室', note: '抽選' },
  { id: 'sch-054', day: '木', period: '2限', courseCode: '1GAA004301', courseName: '東洋史の見方 /全_森', instructor: '三浦　雄城', classroom: '402大教室', note: '抽選' },
  { id: 'sch-055', day: '木', period: '2限', courseCode: '1GAC003301', courseName: '物理学への招待 /全_森', instructor: '濱端　広充', classroom: '講堂', note: '抽選' },
  { id: 'sch-056', day: '木', period: '2限', courseCode: '1GAC005301', courseName: '生物学への招待 /全_森', instructor: '山口　良弘', classroom: '403大教室', note: '抽選' },
  { id: 'sch-057', day: '木', period: '2限', courseCode: '1GAD002201', courseName: '関西文学論 /全_森', instructor: '西田　正宏', classroom: '302中教室', note: '抽選' },
  { id: 'sch-058', day: '木', period: '2限', courseCode: '1GAF013201', courseName: '思想と社会 /全_森', instructor: '前川　真行', classroom: '515大教室', note: '抽選' },
  { id: 'sch-059', day: '木', period: '3限', courseCode: '1GAA002301', courseName: '倫理学入門 /全_森', instructor: '土屋　貴志', classroom: '402大教室', note: '抽選' },
  { id: 'sch-060', day: '木', period: '3限', courseCode: '1GAD005201', courseName: '大阪の都市づくり /全_森', instructor: '大塚　耕司', classroom: '515大教室', note: '抽選' },
  { id: 'sch-061', day: '木', period: '3限', courseCode: '1GAF015301', courseName: '戦争と人間 /全_森', instructor: '小林　啓治', classroom: '516大教室', note: '抽選' },
  { id: 'sch-062', day: '木', period: '3限', courseCode: '1GAF023201', courseName: '現代文化の社会学 /全_森', instructor: '上村　隆広', classroom: '601大教室', note: '抽選' },
  { id: 'sch-063', day: '木', period: '3限', courseCode: '1GAF031301', courseName: '都市の地理学 /全_遠隔', instructor: '菅野　拓', classroom: '403大教室', note: '抽選' },
  { id: 'sch-064', day: '木', period: '3限', courseCode: '1GAG010201', courseName: '日本の古典文学 /全_森', instructor: '西田　正宏', classroom: '602大教室', note: '抽選' },
  { id: 'sch-065', day: '木', period: '3限', courseCode: '1GAG040201', courseName: '日本事情A /全_森', instructor: '森田　耕平', classroom: '504中教室', note: '抽選' },
  { id: 'sch-066', day: '木', period: '4限', courseCode: '1GAF014201', courseName: '経済学の歴史と思想 /全_森', instructor: '下村　晃平', classroom: '601大教室', note: '抽選' },
  { id: 'sch-067', day: '木', period: '4限', courseCode: '1GAF029301', courseName: '測定・実験で学ぶ人間と社会 /全_森', instructor: '平　知宏', classroom: '516大教室', note: '抽選' },
  { id: 'sch-068', day: '木', period: '4限', courseCode: '1GAH002301', courseName: '現代科学と人間 /全_森', instructor: '天尾　豊', classroom: '401大教室', note: '抽選' },
  { id: 'sch-069', day: '木', period: '4限', courseCode: '1GAH016101', courseName: '自然史 /全_森', instructor: '斎藤　光', classroom: '402大教室', note: '抽選' },
  { id: 'sch-070', day: '木', period: '5限', courseCode: '1GAD006301', courseName: '大阪落語への招待 /全_森', instructor: '久堀　裕朗', classroom: '講堂', note: '抽選' },
  { id: 'sch-071', day: '木', period: '5限', courseCode: '1GAG029301', courseName: '環境と文化 /全_森', instructor: '祖田　亮次', classroom: '402大教室', note: '抽選' },
  
  // 金曜日
  { id: 'sch-072', day: '金', period: '1限', courseCode: '1GAB002303', courseName: '心理学入門 /全_森', instructor: '田端　拓哉', classroom: '講堂', note: '抽選' },
  { id: 'sch-073', day: '金', period: '1限', courseCode: '1GAF054301', courseName: 'エスニック・スタディ /全_森', instructor: '明戸　隆浩', classroom: '403大教室', note: '抽選' },
  { id: 'sch-074', day: '金', period: '2限', courseCode: '1GAF042301', courseName: 'メディアと人権 /全_森', instructor: '中村　一成', classroom: '講堂', note: '抽選' },
  { id: 'sch-075', day: '金', period: '2限', courseCode: '1GAF046301', courseName: '障がい者と人権A /全_森', instructor: '松波　めぐみ', classroom: '601大教室', note: '抽選' },
  { id: 'sch-076', day: '金', period: '2限', courseCode: '1GAF050301', courseName: '労働と人権 /全_森', instructor: '川越　道子', classroom: '705中教室', note: '抽選' },
  { id: 'sch-077', day: '金', period: '2限', courseCode: '1GAF053301', courseName: 'クィアスタディーズ /全_森', instructor: '新ヶ江　章友', classroom: '403大教室', note: '抽選' },
  { id: 'sch-078', day: '金', period: '2限', courseCode: '1GAG034201', courseName: '新西洋事情 /全_森', instructor: '佐々木　博光', classroom: '516大教室', note: '抽選' },
  { id: 'sch-079', day: '金', period: '3限', courseCode: '1GAB009301', courseName: 'ジェンダー論入門 /全_森', instructor: '藤田　朋子', classroom: '402大教室', note: '抽選' },
  { id: 'sch-080', day: '金', period: '3限', courseCode: '1GAE009301', courseName: '健康へのアプローチ /全_森', instructor: '古澤　直人', classroom: '403大教室', note: '抽選' },
  { id: 'sch-081', day: '金', period: '3限', courseCode: '1GAF041301', courseName: '現代の部落問題 /全_森', instructor: '廣岡　浄進', classroom: '401大教室', note: '抽選' },
  { id: 'sch-082', day: '金', period: '3限', courseCode: '1GAF049301', courseName: '地球市民と人権 /全_森', instructor: '阿久澤　麻理子', classroom: '601大教室', note: '抽選' },
];