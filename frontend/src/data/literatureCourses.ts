interface CourseData {
  name: string;
  instructor: string;
  evaluationCriteria: string;
  allowedMaterials: string;
  pros: string[];
  cons: string[];
  others: string[];
}

const courses: Record<string, CourseData> = {
  'folklore-ono': {
    name: '民俗学',
    instructor: '大野',
    evaluationCriteria: '出席点あり, 中間レポート, 毎回の課題, 期末レポート',
    allowedMaterials: '(記載なし)',
    pros: [
      '民俗学自体の成立や歴史などに関する講義が中心で興味深かった。レポートは3回あったがそこまでしんどくない内容だった',
    ],
    cons: [
      '4000字を3回くらい書かされるので割と課題が重いところ',
    ],
    others: [
      '特になし',
    ],
  },
  'comparative-expression-takashima': {
    name: '比較表現論',
    instructor: '高島',
    evaluationCriteria: '期末テスト, 毎回の課題',
    allowedMaterials: 'レジュメ',
    pros: [
      '内容がおもしろい。最終回には、プロの人の読み聞かせがきける。テストも持ち込みありで難しくなかった。',
    ],
    cons: [
      '特になし',
    ],
    others: [
      '特になし',
    ],
  },
  'asian-coexistence-culture-tawada': {
    name: 'アジア共生文化論',
    instructor: '多和田',
    evaluationCriteria: '期末レポート, 中間レポート, 中間テスト',
    allowedMaterials: '自筆ノート',
    pros: [
      '3.4回の軽い小レポートと1600字くらいの期末レポートだけで楽',
    ],
    cons: [
      'レジュメがMoodleにあがらないところ',
      'レジュメをムードルにあげてくれないので、ひたすら板書をするタイピング練習の授業。3回に一回、テストがあるのでその日は休めない。',
    ],
    others: [
      '特になし',
    ],
  },
  'sociology-research-methods-kim': {
    name: '社会学研究法',
    instructor: '金',
    evaluationCriteria: '期末レポート, 毎回の課題',
    allowedMaterials: '(記載なし)',
    pros: [
      '前で先生がひたすら喋る授業。毎回の課題やコミュカは授業時間内に書き終わらせるよう言われるがそこまで難しくない。内容も、他コースでも履修可能な難易度。',
    ],
    cons: [
      '期末課題が研究計画書みたいなもので、普通のレポートとは違うためちょっと大変。',
    ],
    others: [
      '特になし',
    ],
  },
  'education-history-hirota': {
    name: '教育史',
    instructor: '弘田',
    evaluationCriteria: '出席点あり, プレゼンテーション, 毎回の課題',
    allowedMaterials: '(記載なし)',
    pros: [
      '先生がひたすらに優しい 毎回来て発表さえ終わらせれば単位はある 自分の調べたい教育の内容について発表すれば良いので、発表そのものも気楽にできる',
      '先生が優しく発表をきいてくれる。発表で取り上げるテーマが様々で興味深い。',
      '授業にほどほどに出席して、発表を1度してしまえば単位もらえる。先生が優しい。',
    ],
    cons: [
      '出席は必須',
    ],
    others: [
      '前半は先生が教育史の原典史資料について解説し、学生はコミュカを書くと言う形で授業が進む。中、後半から学生の1人10分程度の発表が始まる。',
      '教育の知識が無くても全然大丈夫。興味ある教育者を1人発表できればそれで良い。',
    ],
  },
  'sociology-special-d-hirayama': {
    name: '社会学特論D',
    instructor: '平山',
    evaluationCriteria: '期末テスト, 中間テスト',
    allowedMaterials: '持ち込みなし',
    pros: [
      '一般に言われる感情論経験論的なジェンダー論とは違い、それらを批判的に見て、本当の意味でのジェンダーの社会学を学ぶことができる。テストも論述だが、授業内容をなぞれば十分に書ける。',
    ],
    cons: [
      '配布物はほとんどないため、毎回出席してメモをとる必要がある。',
    ],
    others: [
      '主に海外で研究されている内容であるため、貴重な機会であると思う。社会の見方が変わる。',
    ],
  },
  'human-behavior-data-analysis-1b-moriya': {
    name: '人間行動学データ解析法１b',
    instructor: '森谷',
    evaluationCriteria: '期末テスト, (ないときもあるが)宿題',
    allowedMaterials: '電卓',
    pros: [
      '他の文学部の授業とは違って、数字を扱う。中学や高校の内容も一部ある。個人的には気分転換になった。煩雑な計算を求められることもあるが、授業やテストでは電卓を使える(テストではスマホは?)ので心配なし。',
    ],
    cons: [
      '難しい、わかりにくいと感じる人もいるかも。でも、他にも同じように思う人はいるとおもうのであまり気にしないでほしい。',
    ],
    others: [
      '地理学、教育学の人が取る授業。心理学や社会学の人が取る授業は１aで、教室も内容も全く別の授業なので気をつけてほしい。',
    ],
  },
  'human-culture-intro-b-kusao': {
    name: '人間文化概論B',
    instructor: '草生',
    evaluationCriteria: '期末レポート, 毎回の課題',
    allowedMaterials: '(記載なし)',
    pros: [
      '先生が持参した貴重な資料を手に取って見ることができる',
    ],
    cons: [
      '特になし',
    ],
    others: [
      '杉本Cではフィールドワークが実施された',
    ],
  },
  'education-research-methods-soeda': {
    name: '教育学研究法',
    instructor: '添田',
    evaluationCriteria: '期末レポート, 中間レポート, 毎回の課題, プレゼンテーション',
    allowedMaterials: '(記載なし)',
    pros: [
      '先生が優しく、面白い(しかし2026年は違う先生かも)。論文を評価したり、それについてレポートを書いたりする知識が身につく。',
      '内容がためになる。論文の読み方とか構成、図書館の使い方も知れるので受けるべし。発表はグループになって評価するものだったが、やることが難しいのでその分やり終えた達成感がある。',
    ],
    cons: [
      '論文の評価を行うため、そもそもそれが難しく、時間もかかる。毎回それなりの量の課題をこなす必要がある。',
    ],
    others: [
      '教育学コース以外の人はほぼ受けていない。教育学コースの人は頑張ってほしい。しかし、やっていればそれなりにできるようにはなると思う。1回だけ図書館を回るツアーがあった。',
    ],
  },
  'philosophy-history-survey-nakahata': {
    name: '哲学史通論',
    instructor: '中畑',
    evaluationCriteria: '期末テスト, 中間レポート, 毎回の課題, 出席点あり',
    allowedMaterials: 'レジュメ, 自筆ノート',
    pros: [
      '先生の説明が分かりやすい',
      'テストは授業前半の内容と後半の内容のどちらかを選んで記述する形式だったため、どちらかに絞って勉強すれば単位は取れた。',
    ],
    cons: [
      '先生の出す具体例は分かりやすいが、内容自体が難しい',
      '元々3限だったのが急に4限に変更になった。授業内容が難しい。先生の喋り方がゆっくりなためか眠くなる。',
    ],
    others: [
      '中間2回のレポートを出せばできるだけ単位を出すよう配慮してくれるらしい。テストは記述式。事前にどんな感じの問題を出すか教えてくれるため対策はしやすい。',
    ],
  },
  'psychology-intro-1-kawabe': {
    name: '心理学概論1',
    instructor: '川邉',
    evaluationCriteria: '出席点あり, 期末テスト',
    allowedMaterials: 'レジュメ, 自筆ノート',
    pros: [
      '特になし',
    ],
    cons: [
      '教授の滑舌が気になる。',
    ],
    others: [
      '特になし',
    ],
  },
  'human-behavior-data-analysis-1-moriya': {
    name: '人間行動学データ解析法1',
    instructor: '森谷',
    evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題',
    allowedMaterials: '持ち込みなし',
    pros: [
      '授業内容がためになる。テストもそこまで難しくはない。勉強さえしていれば解ける。',
    ],
    cons: [
      '先生が毎回全員当ててくる上に質問がざっくりしていてどう答えればいいのかわからない。授業も少しわかりにくいし、できる人とできない人を明確に分けてできない人を馬鹿にする節がある。',
    ],
    others: [
      'Rでのプログラミングはテストには出ないので毎授業の課題さえこなせば問題ない。',
    ],
  },
  'linguistic-culture-intro-a-omnibus': {
    name: '言語文化概論A',
    instructor: 'オムニバス / 豊田 / 小林 / LIN / 張 / 高橋 / 大岩本 / 山本 / 田中 / 西田',
    evaluationCriteria: '出席点あり, 期末レポート, 毎回の課題',
    allowedMaterials: '(記載なし)',
    pros: [
      '人数が多く寝ていても怒られない 面白い話が多い オムニバス形式のため複数の先生によって色々な言語のことが知れてどの言語か迷っている人にはとてもいい',
      'いろんな人の話が聞ける。',
    ],
    cons: [
      'AかBか忘れたがどちらかは毎回のコミカを書かなければ5点ずつ引かれていくのである程度埋めての提出の必要がある',
      'JEAN LIN先生が全て英語で授業を進めるので理解が大変だった。毎回の振り返りが大変だった。',
    ],
    others: [
      '期末レポートは各回の先生が提示したテーマ(だいたい1人の先生が複数提示してくれるため、ひとつの言語でみれば選択の余地はある)から選んで書く 2400字以上をAとBの両方書くためちょっと大変だが興味のある分野ならわりと書けると思う',
    ],
  },
  'geographic-information-kimura': {
    name: '地理情報学',
    instructor: '木村',
    evaluationCriteria: '期末レポート, 中間レポート',
    allowedMaterials: '(記載なし)',
    pros: [
      '地図やそれに関する技術について教えてくれる。地図好きには面白い授業。オンデマンドが多い(半分ぐらい)ので助かる。',
    ],
    cons: [
      '特になし',
    ],
    others: [
      '特になし',
    ],
  },
  'linguistic-culture-intro-b-shirata': {
    name: '言語文化概論B',
    instructor: '白田 / 奥野 / 福島 / 信國 / 丹羽 / 久堀 / 大山 / 髙井 / 長谷川',
    evaluationCriteria: '期末レポート, 毎回の課題',
    allowedMaterials: '(記載なし)',
    pros: [
      'いろんな人の話が聞ける',
    ],
    cons: [
      '休むたびにレポートの点数が減ってしまう。',
    ],
    others: [
      '4回も休んで、本来なら20点減点でB以下が確定しているはずなのに、AAを取ることができた。(レポートは福島先生に提出)',
    ],
  },
  'education-seminar-c-shimada': {
    name: '教育学演習C',
    instructor: '島田',
    evaluationCriteria: '期末レポート, 毎回の課題, プレゼンテーション',
    allowedMaterials: '(記載なし)',
    pros: [
      '自分の発表を1回して、それ以外は人の発表を聞いて、グループで議論するという授業。内容は議論のしがいがある面白いものばかりだった。',
      '毎回１グループ発表をし、それを聞いた後にディスカッションやその意見を発表したり、まとめたりする。ちゃんと「演習」という感じ。退屈することはない。',
    ],
    cons: [
      '発表グループも議論をするグループも全部先生が組むので友達と一緒にはできない。なので苦手な人は苦手かも。',
      '先生が選んだ教育者について発表しなければいけないので、教育学コース以外の人には重めかも。ただ、教育学コース以外の人もたくさんいた。',
    ],
    others: [
      '特になし',
    ],
  },
  'japanese-literature-history-c-hayashi': {
    name: '国文学史C',
    instructor: '林',
    evaluationCriteria: '出席点あり, 期末レポート, 中間レポート',
    allowedMaterials: '(記載なし)',
    pros: [
      '寝ていても全く怒られない 好きな人は本当に楽しいところ 期末レポートはテーマが授業に関連していれば自由のため好きなことを調べられる',
    ],
    cons: [
      '先生の声が囁きくらいに小さいせいで聞く気があっても聞き取れないことが多発する 3回くらい書く中間レポート(2?400字)はちょっと面倒',
    ],
    others: [
      '特になし',
    ],
  },
  'music-culture-resource-seminar-numata': {
    name: '音楽文化資源論演習',
    instructor: '沼田',
    evaluationCriteria: '出席点あり, 期末レポート, 簡単な発表がおおい',
    allowedMaterials: '(記載なし)',
    pros: [
      '音楽たのしい?',
    ],
    cons: [
      '特になし',
    ],
    others: [
      '特になし',
    ],
  },
  'popular-culture-masuda': {
    name: 'ポピュラー文化論',
    instructor: '増田',
    evaluationCriteria: '期末レポート',
    allowedMaterials: '(記載なし)',
    pros: [
      '出席がない。期末レポートと授業内容が関係ないのでしっかり頑張って理解する必要はない。ビートルズやマイケル・ジャクソンなどの有名人やボカロなどの話もあり、ポピュラー音楽に興味のある人なら授業内容は面白いと思う。',
    ],
    cons: [
      '授業内容が期末レポートと関係がないこと。出席するモチベーションが低下する可能性があるかも。レポートの内容も15個以上の文献から1つの文献につき200字以内という条件付きで一字一句変えずに組み合わせるという独特すぎるもので、かなりハードだった。',
    ],
    others: [
      '特になし',
    ],
  },
  'japanese-history-basic-reading-1-iwashita': {
    name: '日本史基礎講読1',
    instructor: '磐下',
    evaluationCriteria: '中間レポート, 報告内容、授業態度, プレゼンテーション',
    allowedMaterials: '(記載なし)',
    pros: [
      '史料の扱い方を学ぶことができ、取り扱う史料がおもしろい。 1回史料報告をすれば大丈夫。',
      '出席点はなし、たまにコミュカ提出があったが、それが出席点に入っているかは不明 単に感想を聞いているだけのような気もする',
    ],
    cons: [
      '与えられる課題は難しいが、複数人で一つの発表を作るため、場所が良ければ一瞬で発表準備が終わる 一方で担当場所について名乗っているわけではないので、正当に個人が評価されたのかは疑問点が残る なんだかよくわからない授業だった',
    ],
    others: [
      '事前知識は特に必要ない。',
    ],
  },
  'asian-culture-basic-theory-tawada': {
    name: 'アジア文化学基礎論',
    instructor: '多和田',
    evaluationCriteria: '期末レポート, 中間レポート, 数回発表あり',
    allowedMaterials: '(記載なし)',
    pros: [
      '基本的に先生の話を聞いているだけでいいです。2~3回小レポートがありますが、自分の考えを自由に論じるものなので書きやすい。発表は小レポートの内容を話せばよく、先生も否定せず聞いてくれるので気が楽。',
    ],
    cons: [
      '時々スライドが変わるのが早く板書が追いつかない',
    ],
    others: [
      '特になし',
    ],
  },
  'latin-1-sato': {
    name: 'ラテン語1',
    instructor: '佐藤',
    evaluationCriteria: '期末テスト, 毎回の課題',
    allowedMaterials: '持ち込みなし',
    pros: [
      '毎回の小テスト採点が甘い',
      '練習問題を解いてくることが毎回課されるが検索すれば答えが全てでてくる',
    ],
    cons: [
      'そもそものラテン語が難しく、予習しないとついていけない 教科書購入必須',
      'ひたすら文法について学ぶ 文章読んでみましょうみたいなのはない 授業の始めに練習問題を当てられて回答しないといけない 音読か黒板に筆記しないといけない 普通に内容が難しい ラテン語ちょっと知ってるからできるかな?楽しそうかな?って感じなら取らん方が良い',
    ],
    others: [
      '隔年実施のため注意 期末テスト85%毎回の小テスト15%',
    ],
  },
  'museum-education-inoue': {
    name: '博物館教育論',
    instructor: '井上',
    evaluationCriteria: '出席点あり, 期末レポート, 中間レポート',
    allowedMaterials: '(記載なし)',
    pros: [
      '特になし',
    ],
    cons: [
      'Moodle使わないとこ。小課題や最終課題の内容、提出先のメールアドレスは全部黒板に手書きなので休みすぎると詰む。友達がいないなら朝頑張って起きよう。',
    ],
    others: [
      '特になし',
    ],
  },
  'human-culture-basic-theory-1-niki': {
    name: '人間文化基礎論1',
    instructor: '仁木',
    evaluationCriteria: 'プレゼンテーション',
    allowedMaterials: '(記載なし)',
    pros: [
      '出席しなくても何も言われない。ピ逃げできる。',
    ],
    cons: [
      '資料作りがとてつもなくめんどくさい。先生が興味のある内容でないとあまりいい反応はもらえないし、前で1人10分ほどの発表があるが、構成がしっかりしていないと突っ込まれる。結構厳しい言葉を言われる人もいる。',
    ],
    others: [
      '特になし',
    ],
  },
  'human-behavior-intro-b-ishida-soda': {
    name: '人間行動学概論B',
    instructor: '石田 / 祖田',
    evaluationCriteria: '中間テスト, 期末レポート, 毎回の課題',
    allowedMaterials: '持ち込みなし',
    pros: [
      '社会学の授業の方は、オンデマンドも少しあった。地理学の方は、大学院の方の授業で、実際に地理学に進んだ時がイメージできて良かった。先生も面白かった。',
    ],
    cons: [
      '社会学の方は、テスト持ち込みが不可であるのに、用語解説や自身の見解などを解答しなければならず負担が大きかった。どちらの先生も毎回振り返りを書く必要があり、大変だった。',
    ],
    others: [
      '特になし',
    ],
  },
  'sociology-intro-b-kim': {
    name: '社会学概論B',
    instructor: '金',
    evaluationCriteria: '期末レポート, 毎回の課題',
    allowedMaterials: '(記載なし)',
    pros: [
      '先生が優しくて、レポート出せば単位落とすことはあんまりないって言ってた',
    ],
    cons: [
      '課題出る時と出ない時があるから行かないといけない。次からは出席ありになるかもしれない',
    ],
    others: [
      '特になし',
    ],
  },
  'museum-information-media-yoshida': {
    name: '博物館情報・メディア論',
    instructor: '吉田',
    evaluationCriteria: '期末レポート, 毎回の課題',
    allowedMaterials: '(記載なし)',
    pros: [
      '先生が前でずっと喋るタイプの講義。内容は博物館というよりはメディア寄りで、先生がちょっとした小話を入れてくれたりしておもしろい。',
    ],
    cons: [
      '特になし',
    ],
    others: [
      '特になし',
    ],
  },
  'archaeology-survey-kishimoto': {
    name: '考古学通論',
    instructor: '岸本',
    evaluationCriteria: '期末レポート',
    allowedMaterials: '(記載なし)',
    pros: [
      '特になし',
    ],
    cons: [
      '対面で貰えるレジュメ以外に配布資料がない。',
    ],
    others: [
      '考古学の視点で古墳時代前後の近畿地方について学ぶことができる。出席点はなく期末レポートだけで評価が決まる。',
    ],
  },
  'human-culture-basic-theory-1b-niki': {
    name: '人間文化基礎論1b',
    instructor: '仁木',
    evaluationCriteria: '期末レポート, プレゼンテーション',
    allowedMaterials: '(記載なし)',
    pros: [
      '説明を含む最初の数回と自分の発表回以外は寝ているどころか出席しなくても何も言われない 友だちの発表を聞くのがかなり楽しい',
    ],
    cons: [
      '発表の準備が大変 大阪や京都などの近畿圏、もしくは知名度のとても高い場所はめちゃくちゃ細かくツッコまれる 地方民は先生が地理や伝承を把握していないこともありちょっと楽',
    ],
    others: [
      'ひとり10分程度で自分の好きな町について発表 発表後の先生からのフィードバックを踏まえて修正し、期末レポートとしてプレゼンのパワポを提出 先生のパワポの好みを知るために出席して人の発表を見ておくのをおすすめする 地方誌の多くが杉本のキャンパスにあるため、森之宮移行後の発表準備は計画的に……',
    ],
  },
  'psychological-assessment-special-son': {
    name: '心理的アセスメント特論',
    instructor: '孫',
    evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題',
    allowedMaterials: '教科書',
    pros: [
      '後半を少しすぎたくらいでオンデマンドが対面かのアンケートがあり、その結果授業の1/3くらいがオンデマンドだった。',
    ],
    cons: [
      '教科書の内容に沿ってゆっくり進み、基本的に授業中に学生がやることはないのでかなり暇だった。また、勉強していなかった自分も悪いが、テストの内容の6割くらいがアセスメントの結果の報告書を書くもので、どこに何を書くべきなのか普通に分からなかった。',
    ],
    others: [
      '特になし',
    ],
  },
  'western-classical-studies-horikawa': {
    name: '西洋古典学',
    instructor: '堀川',
    evaluationCriteria: '毎回の課題',
    allowedMaterials: '(記載なし)',
    pros: [
      '毎日最後に授業の感想や考察を提出するだけなので、授業外で課題が一切ない。事前知識がなくても大丈夫かつ夏休み期間なので、他学部でも履修できる',
    ],
    cons: [
      '特になし',
    ],
    others: [
      'ずっと講義形式なので、1人でも受講できると思います。',
    ],
  },
  'philosophy-intro-1-sakane': {
    name: '哲学概論1',
    instructor: '佐金',
    evaluationCriteria: '出席点あり, 期末レポート, 毎回の課題',
    allowedMaterials: '(記載なし)',
    pros: [
      '時間に関する哲学に注目することがなかったので内容自体は面白く感じた。課題はやや面倒だが、基本的に教科書に書いてあることをまとめる国語の問題のような形式だったのでそこまで時間はかからない。',
    ],
    cons: [
      '毎回課題がある上、期末レポートが1800-3000字なので単純に重い。また、課題を各自印刷して授業で集める形式だったので面倒だった。',
    ],
    others: [
      '特になし',
    ],
  },
  'education-research-methods-1-soeda': {
    name: '教育学研究法1',
    instructor: '添田',
    evaluationCriteria: '期末レポート, プレゼンテーション',
    allowedMaterials: '(記載なし)',
    pros: [
      'ややハイレベルだがその分楽しい。論文をどう評価すればいいか学べる。いい所はしっかり褒めてくれるので自己肯定感上がる。',
    ],
    cons: [
      '発表準備に時間を取られる。',
    ],
    others: [
      '他コースの人はあまり履修をオススメしません… 担当の添田先生は今年でご退職なので2026年度以降は毛色が変わるかも。',
    ],
  },
  'aesthetics-intro-1-takanashi': {
    name: '美学概論I',
    instructor: '高梨',
    evaluationCriteria: '出席点あり, 期末テスト',
    allowedMaterials: 'レジュメ',
    pros: [
      'テストでメモありのレジュメ持ち込みできた。',
    ],
    cons: [
      '哲学に興味がある、授業受ける前からカントに興味あったり本読んでるとかじゃないと、本当に先生が何言ってるか分からない。',
    ],
    others: [
      '特になし',
    ],
  },
  'japanese-history-survey-a-niki': {
    name: '日本史通論A',
    instructor: '仁木',
    evaluationCriteria: '期末レポート, 中間レポート',
    allowedMaterials: '(記載なし)',
    pros: [
      'レポートの字数が少ない。毎回冒頭に、前回の内容を説明してくれるため、1回休む分には問題なくついていける。',
    ],
    cons: [
      '特になし',
    ],
    others: [
      '他の授業や書籍では聞けない話を聞くことができる。',
    ],
  },
  'neurophysiological-psychology-special-kawabe': {
    name: '神経・生理心理学特論',
    instructor: '川邉',
    evaluationCriteria: '出席点あり, 期末テスト',
    allowedMaterials: 'レジュメ, 自筆ノート',
    pros: [
      '特になし',
    ],
    cons: [
      '内容が結構難しい',
    ],
    others: [
      'テストは穴埋め問題と記述問題です。レジュメを見て分からないところをしらみ潰しに勉強していけば取れます。頑張ってください！',
    ],
  },
  'human-culture-basic-theory-1a-sakane': {
    name: '人間文化基礎論1a',
    instructor: '佐金',
    evaluationCriteria: '出席点あり, 毎回の課題, プレゼンテーション',
    allowedMaterials: '(記載なし)',
    pros: [
      '先生が優しい プレゼンの日に間に合わなくてもパワポを後日送れば評価はしてくれるらしい',
    ],
    cons: [
      '毎回のレポートが重い',
    ],
    others: [
      '生徒達で話し合う時間がかなりある コミュ障や自分の考えを持たない人は厳しい',
    ],
  },
  'education-methodology-ii': {
    name: '教育方法学',
    instructor: '井伊',
    evaluationCriteria: '期末レポート, 毎回の課題, プレゼンテーション',
    allowedMaterials: '(記載なし)',
    pros: [
      '基本グループワーク。内容がおもしろい。2回プレゼンをして、授業で考えたことについて1500字程度で最終レポートなので、割とすぐに終わる。休んだり遅れていっても、回によっては問題ない。毎回の小課題さえ書いておけば問題無い。',
    ],
    cons: [
      'グループワークが多くて、発表も全てグループでやるので苦手な人はやめておいた方がいいかも。',
    ],
    others: [
      '特になし',
    ],
  },
};

export function getCourseDataById(id: string): CourseData {
  return courses[id] || courses['folklore-ono'];
}
