import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface ScienceCourseDetailPageProps {
  courseId?: string;
  isAuthenticated?: boolean;
}

interface CourseData {
  name: string;
  instructor: string;
  evaluationCriteria: string;
  allowedMaterials: string;
  pros: string[];
  cons: string[];
  others: string[];
}

export function ScienceCourseDetailPage({ courseId = 'modern-physics-intro-omnibus', isAuthenticated = false }: ScienceCourseDetailPageProps) {
  const getCourseData = (id: string): CourseData => {
    const courses: Record<string, CourseData> = {
      'modern-physics-intro-omnibus': {
        name: '現代物理学への招待',
        instructor: 'オムニバス',
        evaluationCriteria: '教員1人につきレポート課題1本',
        allowedMaterials: '(記載なし)',
        pros: [
          'ほとんどの学生は出ていない。教員も容認している。レポート出せばOKのスタンス。',
        ],
        cons: [
          '普通に話が難しい。そもそも声が聞きとれない教員が２人ほど。レポート課題のほとんどが手書きなのでちょっと面倒。参考資料にネット文献NGの場合がありこれまた面倒。',
        ],
        others: [
          '特になし',
        ],
      },
      'topology1-practice-hashimoto': {
        name: '位相数学1演習',
        instructor: '橋本',
        evaluationCriteria: '出席点あり, 期末レポート, 中間レポート',
        allowedMaterials: '(記載なし)',
        pros: [
          '提出したものは次週に採点して返却してくれるため、自分の数学力の向上に繋がる。',
          '噛みごたえのある問題が多い。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '毎回問題が渡されて、それを講義時間内にできるだけ解き、講義終了時にそれを提出する。これを提出することが出席扱いになる。',
        ],
      },
      'organic-chemistry1-kozaki': {
        name: '有機化学1',
        instructor: '小嵜',
        evaluationCriteria: '出席点あり, 期末テスト, 中間テスト, たまにある小テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '特になし',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '中間と期末の比重は教えてくれないけど、自分がギリギリだったからたぶんほぼ1対1に近いと思う。（過度な信頼はしないでほしい）',
        ],
      },
      'math-essentials-a-tamaru': {
        name: '数学要論A',
        instructor: '田丸',
        evaluationCriteria: '期末テスト, 中間テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '丁寧に説明してくれる。',
          '集合論の授業が面白い',
          '先生本人も面白い',
          '小テストの添削をしてくださる',
        ],
        cons: [
          'ない',
          '黒板の字が少し汚く、書く速度も早い',
          '田丸流の書き方でないと、バツされることがある',
        ],
        others: [
          '基本的に期末テスト100%だが、一発勝負の保険に、仮に期末テストを失敗した場合に中間テストとの平均を取るという措置が用意されている。火曜と金曜の2限目にある。そのため、4単位分である。内容が数学の基礎の基礎を扱うため、内容も難しく、これを一生懸命に勉強しないと今後の学習に支障が出るため、評価もキツくなっている。落単者も50人中7人と割と多い。しかし、努力がそのまま結果として現れるため悲観する必要はない。',
          '120点満点中60点を取れば単位がもらえる',
          '数学科に必須な知識ばかりなので、しっかり勉強しないと落単するし、今後履修する数学科の専門科目も落単する可能性が高い',
          'web上に先生が過去問を上げてあるので確認するべし',
        ],
      },
      'information-mathematics-akiyoshi': {
        name: '情報数学',
        instructor: '秋吉',
        evaluationCriteria: '出席点あり, 期末レポート, 中間レポート, 毎回の課題',
        allowedMaterials: '(記載なし)',
        pros: [
          '単位取得が容易',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '特になし',
        ],
      },
      'basic-organic-chemistry-fujioka': {
        name: '基礎有機化学',
        instructor: '藤岡',
        evaluationCriteria: '出席点あり, 期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          'ない',
        ],
        cons: [
          '声が聞き取りづらい、死ぬほど眠い、普通にむずい',
        ],
        others: [
          '特になし',
        ],
      },
      'analysis1-ishi': {
        name: '解析学1',
        instructor: '伊師',
        evaluationCriteria: '期末テスト, 中間レポート',
        allowedMaterials: '電子機器以外は全て持ち込み可能',
        pros: [
          '証明に一切の行間が無く、親切で分かりやすい講義をしてくれる。',
          'たまに話す雑談が面白い。',
        ],
        cons: [
          'なし',
        ],
        others: [
          '特になし',
        ],
      },
      'basic-physical-chemistry-kinoshita': {
        name: '基礎物理化学',
        instructor: '木下',
        evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題',
        allowedMaterials: '自筆ノート',
        pros: [
          'テスト持ち込みありだったこと',
          '授業の最後に課題をやって提出するのだが、レジュメ見れるし友達と相談もできるのでやりやすい',
        ],
        cons: [
          '生物選択にとっては授業内容が難しくてついて行くのが大変だった',
          '持ち込みありでもテストが難しいと感じた',
        ],
        others: [
          'テストは過去問の類題が出ます。できるなら過去問数年分集めておいた方が良いです',
        ],
      },
      'chemical-reaction-theory1-hosokawa': {
        name: '化学反応論1',
        instructor: '細川',
        evaluationCriteria: '出席点あり, 期末テスト, 中間テスト, 全3回のレポート課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '出席確認が甘い',
        ],
        cons: [
          'ほとんど教科書通りの説明を、レジュメとして提供しているだけなので、あまり授業に出る意味を感じられない。また、テストが結構難しい。',
        ],
        others: [
          'テストはレポート課題から多く出され、また、一部アトキンス物理化学の章末問題から出題されるが、章末問題の解説がないのと量が膨大過ぎて、テスト対策が難しい。',
        ],
      },
      'topology1-hashimoto': {
        name: '位相数学1',
        instructor: '橋本',
        evaluationCriteria: '期末テスト, 期末レポート, 中間レポート',
        allowedMaterials: '持ち込みなし',
        pros: [
          '行間は0で分かりやすい生徒に寄り添った講義をしてくださる。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          'チョークと黒板消しの持ち替えが凄くスマートでオシャレ。是非来年度の受講者はそこに注目して欲しい。',
          'テストは噛みごたえがあるため、理解の十分・不十分が顕著にでる',
        ],
      },
      'animal-physiology1-goto': {
        name: '動物生理学1',
        instructor: '後藤',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          'こうぎがわかりやすい',
        ],
        cons: [
          'テスト対策がかなり忙しい',
        ],
        others: [
          '特になし',
        ],
      },
      'plant-physiology1-wakabayashi': {
        name: '植物生理学1',
        instructor: '若林',
        evaluationCriteria: '期末テスト',
        allowedMaterials: 'ネットに繋げなければ何でも持ち込み可',
        pros: [
          '講義で結構ためになる情報を教えてくれる。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '特になし',
        ],
      },
      'cell-biochemistry1-ihara-kasamatsu': {
        name: '細胞生物化学1',
        instructor: '居原 / 笠松',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '特になし',
        ],
        cons: [
          '無慈悲',
        ],
        others: [
          '落単者がかなり居る。私もその1人だ。あまりにも悔しいのでここに思いの丈を綴らせていただく。私のテスト勉強の方法は一夜漬けなのだが、数多のテストをここまで乗り越えてきたぐらいにはハイレベルな短期記憶ができると自負している。前半の居原おじちゃんのとても分かりやすい板書の内容を覚えるところまでは順調だった。だがしかし、深夜1時を回り笠松くんの範囲に手をつけた瞬間、私の脳があまりの絶望でシャットダウンしかけたのだ。あまりにも範囲が多い。スライドをめくってもめくっても終わりが見えない。しかし諦めたら試合終了なので私の脳にカフェインをぶち込みブドウ糖を摂取して完徹でテストに挑んだ。テスト直前、正直6割は取れそうだな、と思いつつテストを解き進め、居原おじちゃんの範囲は順調に終わり、笠松くんの範囲を解き始めた。おわった。落単。私はそう確信した。にこにこしている笠松くんとは対照的に、寝不足の脳みそでも落単という2文字だけは鮮明に浮かび上がり、この半年間頑張って1限に出た走馬灯が流れ、冷や汗が滲み出てきた。私は怠惰なばかりに学費も時間も無駄にしたのだ。ってことで皆さんは事前にコツコツ勉強しましょう。',
        ],
      },
      'basic-organic-chemistry-tsuburaya': {
        name: '基礎有機化学',
        instructor: '円谷',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          'テスト問題のほとんどがMoodleに上がってる章末問題か授業中にやった小テストから出たため、その2つを完璧にすれば高得点狙える',
          '先生やさしい',
        ],
        cons: [
          '板書が早いため置いてかれる時ある',
        ],
        others: [
          '特になし',
        ],
      },
      'analysis1-practice-ishi': {
        name: '解析学1演習',
        instructor: '伊師',
        evaluationCriteria: '毎回の課題, プレゼンテーション',
        allowedMaterials: '(記載なし)',
        pros: [
          '最後らへんは7人ぐらいしか出席してないので、発表し放題。',
        ],
        cons: [
          '毎回提出の課題の返却が夏休みのため、自分の照明の善し悪しが分からない。',
        ],
        others: [
          '発表の際に、違う数学の分野を用いた証明には注意が必要',
        ],
      },
      'basic-electromagnetics-tsunesada': {
        name: '基礎電磁気学',
        instructor: '常定',
        evaluationCriteria: '期末テスト, 毎回の課題',
        allowedMaterials: '自筆ノート',
        pros: [
          'なんも聞かなくてもテスト前に教科書丸写ししたらそのまま出てきた',
        ],
        cons: [
          'せっかく手書きノートを完成させたのに過去問からしか出なくて唯一でた過去問以外の問題も不備があって全員丸になったのでほとんど意味がなかった',
        ],
        others: [
          '過去問を全部写しとけばいい。あとは金払ってノート書いたやつ印刷してもらえ',
        ],
      },
      'physics-practice1-kosuge-kubota-yamaguchi-obara': {
        name: '物理学演習1',
        instructor: '小菅 / 久保田 / 山口 / 小原',
        evaluationCriteria: '出席点あり, プレゼンテーション, その他担当教員による',
        allowedMaterials: '(記載なし)',
        pros: [
          '好きなことができる。',
          'ほとんどパワポの練習みたいな授業。',
        ],
        cons: [
          '何かやたら欠席に厳しい。',
          'スライド作成はするが発表は一部の学生のみなので別に発表能力が上がる訳では無い。',
        ],
        others: [
          '歴代のクロバスで酷評されている教員は、本年度は補講の担当だったので大半の学生はその教員の講義を受けていない。',
        ],
      },
      'inorganic-chemistry1-nakajima': {
        name: '無機化学1',
        instructor: '中島',
        evaluationCriteria: '期末テスト, 中間テスト, 4回に1回ほどの課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '点数が100点満点ではなく、約140点満点(中間が全2回で計60点、期末が50点、残り課題)という感じなので、単位取得は難しくはないです。',
        ],
        cons: [
          '他の専門科目と比較しても、圧倒的に難易度が高いです。友達やchatGPTを駆使しながらようやく解けるかどうかと言った感じです。分からない場合は、素直にオフィスアワーで質問した方が良いです。',
        ],
        others: [
          '2025年度の期末試験では、試験終了15分前に出題ミスが発覚してたので、注意してください。',
        ],
      },
      'biology-trends-suzuki': {
        name: '生物学の潮流',
        instructor: '鈴木',
        evaluationCriteria: '出席点あり, 期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '期末テストは各先生が出題する問題13個からいくつか選んで答える形式だが、ほとんどの先生が過去問そのままなので過去問を勉強してたら大丈夫。',
          '期末テストに出す問題を授業中に教えてくれる先生がいる。',
        ],
        cons: [
          '担当の先生は固定じゃないので過去問に乗ってない先生もいる。過去問と違う問題を出してくる先生も一部いる。なので1年分だけでなく2,3年分過去問を勉強しておく必要がある。',
        ],
        others: [
          '授業というより先生の研究紹介みたいな感じなので肩の力抜いて受講して欲しい。',
        ],
      },
      'ordinary-differential-equations-tanigawa': {
        name: '常微分方程式',
        instructor: '谷川',
        evaluationCriteria: '出席点あり, 期末テスト, 中間レポート, たまの提出物',
        allowedMaterials: '持ち込みなし',
        pros: [
          '教科書通りに進むので休んでも自分で勉強できる。4回までは休んでも評価に関係しない(先生が断言していた)。評価比率は言ってなかったと思うがほぼ中間に3回ほど出されるレポート。30分以内は先生に声をかけられるが遅刻にならない。',
          '難易度は低い',
        ],
        cons: [
          '演習中も常に見回っていて内職しにくい。4回まで休んでも減点しないと言っているものの休んだ日に課題が配られたら課題の点が引かれる。課題を提出する際、当日中でも遅れたら減点。',
          '証明を講義では一切触れず、基本的には解法のみ。つまりあまり講義に出席する意味はないが、出席点があるため出席しなければいけない。',
        ],
        others: [
          '課題出して授業に出れば単位取得はできるはず。',
        ],
      },
      'biochemistry1-nakase': {
        name: '生化学1',
        instructor: '中瀬',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          'テストで出る候補の問題を事前に教えてもらえた',
          '先生の話が面白い',
        ],
        cons: [
          '教えてもらえた問題全てがそのまま出る訳ではなくやや捻られた問題もあって焦った。(そのまま出た問いもあった)',
        ],
        others: [
          '特になし',
        ],
      },
      'quantum-chemistry1-sato': {
        name: '量子化学1',
        instructor: '佐藤',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '出席がなく、毎回の課題と中間、期末のテストのみ。また、教授が優しい。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          'テストには、テスト直前に行われるまとめの問題と似たような問題が多く出題されるので、対策が比較的簡単です。期末試験では、線形代数の知識を必要とする問題が出る(とは言うもののそこまで難しい訳では無いです。)ので、線形代数を取っておくと、後々楽です。',
        ],
      },
      'linear-algebra-kanda': {
        name: '線形代数',
        instructor: '神田',
        evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          'とてもわかりやすい。',
        ],
        cons: [
          'ない',
        ],
        others: [
          '毎回小テストがある。成績の40%を占めているが内容がとても簡単なので満点近く取れる。期末テストは60%分ある。期末テストも同様に内容がとても簡単なので満点近く取れる。この先生は当たりの人と思っていい。',
        ],
      },
      'math-basic-practice1-osumi': {
        name: '数学基礎演習1',
        instructor: '尾角',
        evaluationCriteria: '期末レポート, プレゼンテーション',
        allowedMaterials: '(記載なし)',
        pros: [
          'ない',
        ],
        cons: [
          '発表がだるい',
        ],
        others: [
          '発表だるいですが、期末テストはないです。',
        ],
      },
      'algebra1-kanda-hashimoto': {
        name: '代数学1',
        instructor: '神田 / 橋本',
        evaluationCriteria: '期末テスト, 期末レポート, 毎回の小テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '(神田)とても分かりやすく、様々な概念のお気持ちも教えてくれ、しかもイケメン。',
          '(橋本)講義の見通しは良い。',
        ],
        cons: [
          '(橋本)講義は無量空処を食らっているような感覚。',
        ],
        others: [
          'テストは余裕',
        ],
      },
      'algebra1-practice-kanda-hashimoto': {
        name: '代数学1演習',
        instructor: '神田 / 橋本',
        evaluationCriteria: '出席点あり, プレゼンテーション',
        allowedMaterials: '(記載なし)',
        pros: [
          '(橋本)確実に概念の深さをしれる。',
          '(神田)講義の理解の手助けになる。全問解いておくべき。',
        ],
        cons: [
          '(橋本)問題を選び、発表という形であるが、代数学1であるにも関わらず、ガロア理論の問題を出してしまうお茶目さ。',
        ],
        others: [
          'どちらの教授もとても楽しい',
        ],
      },
      'biomolecule-functional-chemistry-moritsugu': {
        name: '生体分子機能化学',
        instructor: '森次',
        evaluationCriteria: '出席点あり, 期末テスト, 中間テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          'テスト前に練習問題をMoodleに上げてくれたり、どこが出るか教えてくれたので対策がしやすい。後半の先生授業中にテストどこが出やすいかを結構教えてくれるため話聞いておいた方が良い。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '特になし',
        ],
      },
      'biological-systematics2-atsui-koguchi': {
        name: '生物体系学2',
        instructor: '厚井 / 小口',
        evaluationCriteria: '出席点あり, 期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '特になし',
        ],
        cons: [
          'テストが難しい',
        ],
        others: [
          '特になし',
        ],
      },
      'cell-biochemistry-ihara': {
        name: '細胞生物化学',
        instructor: '居原',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          'テスト出るところ結構教えてくれるから対策しやすい',
        ],
        cons: [
          '落単してる人結構いるので注意',
        ],
        others: [
          '記述以外に穴埋めが結構あったため焦った',
          '例年中間テストもあるらしい',
        ],
      },
      'molecular-biology-sato': {
        name: '分子生物学',
        instructor: '佐藤',
        evaluationCriteria: '期末テスト, 中間テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '特になし',
          '先生が優しい',
        ],
        cons: [
          '声が小さく、ぼそぼそと話す。先生自身も気にしているようでバカデカスピーカーを持ち歩いてマイクで話すため、通称シグマボーイとよばれている。かなり課金していそうなマイクをもってしても佐藤先生の声の小ささは異次元なのでほぼ聞こえません。',
          'テスト範囲が莫大で、テスト前日一夜漬けは無謀なのでやめた方がいい。',
          '過去問を入手できれば6割は取れるがかなり勉強しないとC以上を取るのは難しい。',
          '先生の声マイク使ってるけど聞き取りずらい',
        ],
        others: [
          '声が小さいのは恥ずかしいから、という噂を小耳に挟んだ。',
          'どの専門科目にも言えることですが、毎回出席取られるけど成績に関係しているのかどうか分かりません。もしかしたら危なかった時出席してたら救ってくれるのかも',
        ],
      },
      'cell-biology3-terakita': {
        name: '細胞生物学3',
        instructor: '寺北',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '毎回講義の初めに復習があるから、授業ごとに前回の講義を思い出せてよかった。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '特になし',
        ],
      },
      'calculus1a-takahashi': {
        name: '微積分1A',
        instructor: '高橋',
        evaluationCriteria: '期末テスト, 中間テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '面白い',
        ],
        cons: [
          'ない',
        ],
        others: [
          'テストが過去問とほとんど同じ内容なので、過去問が手に入れば勝ち確です。',
        ],
      },
      'molecular-biology1-sato': {
        name: '分子生物学1',
        instructor: '佐藤',
        evaluationCriteria: '期末テスト, 中間テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '先生が優しい',
          'テストが〇‪✕‬‪‪問題で記述がない',
        ],
        cons: [
          '先生の声マイク使ってるけど聞き取りずらい',
        ],
        others: [
          'どの専門科目にも言えることですが、毎回出席取られるけど成績に関係しているのかどうか分かりません。もしかしたら危なかった時出席してたら救ってくれるのかも',
        ],
      },
      'metabolic-biochemistry-mori': {
        name: '代謝生物化学',
        instructor: '森',
        evaluationCriteria: '期末テスト, 中間テスト',
        allowedMaterials: '持ち込みなし, 教科書',
        pros: [
          '前半の先生テスト持ち込み可だったため楽だった。',
          '後半の先生も練習問題Moodleに上げてくれたしボーナス問題も結構あった',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '特になし',
        ],
      },
      'differential-geometry1-ishida': {
        name: '微分幾何学1',
        instructor: '石田',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '授業でやる内容をほぼすべて書いた講義ノートがMoodleで配布される。',
          '出席点なしなので、自宅で講義ノート見て勉強するだけでも良い。',
          '試験が近くなると、「公平性を保つため」といって過去問をMoodleにアップしてもらえる。(ただし模範解答はついてこないので注意)',
        ],
        cons: [
          '全員が講義と円柱の両方を履修していたからかもしれないが、演習の単位も期末試験1発勝負だったので、0単位か4単位か。',
        ],
        others: [
          '分野的に難しすぎるので、テストは用語の定義を書くだけで合格点(またはそれに近い点数)がもらえる(多分。残りは比較的簡単な命題の証明など)',
        ],
      },
    };

    return courses[id] || courses['modern-physics-intro-omnibus'];
  };

  const courseData = getCourseData(courseId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '理学部科目一覧', href: '/courses/specialized/science' },
          { label: courseData.name },
        ]} />

        {/* 科目名・教員名 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl mb-2">{courseData.name}</h1>
          <p className="text-sm md:text-base text-gray-600">担当教員：{courseData.instructor}</p>
        </div>

        {/* 評価基準・持ち込み */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base">評価基準</h3>
              <p className="text-sm md:text-base text-gray-700">{courseData.evaluationCriteria}</p>
            </div>
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base">テスト持ち込み</h3>
              <p className="text-sm md:text-base text-gray-700">{courseData.allowedMaterials}</p>
            </div>
          </div>
        </div>

        {/* 良かったところ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            <h2 className="text-lg md:text-xl font-bold">良かったところ</h2>
          </div>
          <ul className="space-y-2">
            {courseData.pros.map((pro, index) => (
              <li key={index} className="flex gap-2 text-sm md:text-base">
                <span className="text-green-600 mt-1">•</span>
                <span className="text-gray-700 flex-1">{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 悪かったところ */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
            <h2 className="text-lg md:text-xl font-bold">悪かったところ</h2>
          </div>
          <ul className="space-y-2">
            {courseData.cons.map((con, index) => (
              <li key={index} className="flex gap-2 text-sm md:text-base">
                <span className="text-red-600 mt-1">•</span>
                <span className="text-gray-700 flex-1">{con}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* その他 */}
        {courseData.others.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
              <h2 className="text-lg md:text-xl font-bold">その他</h2>
            </div>
            <ul className="space-y-2">
              {courseData.others.map((other, index) => (
                <li key={index} className="flex gap-2 text-sm md:text-base">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700 flex-1">{other}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
