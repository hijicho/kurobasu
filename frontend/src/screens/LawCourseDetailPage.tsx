import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface LawCourseDetailPageProps {
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

export function LawCourseDetailPage({ courseId = 'law-intro-naka-moriya-kanazawa', isAuthenticated = false }: LawCourseDetailPageProps) {
  const getCourseData = (id: string): CourseData => {
    const courses: Record<string, CourseData> = {
      'law-intro-naka-moriya-kanazawa': {
        name: '法学入門',
        instructor: '仲 / 守矢 / 金澤',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '出席点がない。',
          '基本的に分かりやすい。',
          'テストが案外簡単だった。2日前に勉強を始めたがA評価を頂いた。',
          '仲先生はレジュメも授業もわかりやすい。',
          '守矢先生は、わかる人にとっては絶対面白いし興味深い。',
        ],
        cons: [
          'テストが普通に難しい。',
          'シラバスでは16週目にテストと書かれていたが、実際には15週目に行われた。',
          '守矢先生は初回から西洋の非常に難しい話をマシンガンでしてきて心がへし折られる（12, 13回目はそうでもなかった）。仲先生しか分かりやすい人がいない。',
          'テスト100%で何が出るか見当もつかず不安になる。',
        ],
        others: [
          '授業には出たほうが良いし、普通に勉強もしたほうが良い。',
          '落単者が8人しかおらず、例年に比べて易化していたと思われる。',
          '授業で出てきた事例を三段論法で説明することと、民法709条の不法行為を論証できればいける。',
        ],
      },
      'criminal-law-part1-tokunaga': {
        name: '刑法第一部（総論）',
        instructor: '徳永',
        evaluationCriteria: '期末テスト',
        allowedMaterials: 'レジュメ, 自筆ノート, 六法（全書）, スライド',
        pros: [
          'レジュメ、自筆ノートの持ち込みが可。スライドも持ち込み可能。',
          '語句説明問題がある。',
          '最高得点が100点になるよう調整してくれる（例：最高点が90点なら全員に+10点）。50点ほどあれば単位が来る。',
          '法学部の科目なので出席等の評価は一切なく、自分で勉強できる人は出席しなくても問題ない。',
          '過去問の傾向とほぼ一致した問題が出る。',
          '先生のたまに出る文句がグレーすぎて面白い。毒を吐くのが面白い。',
          '先生が作った補助教材があり、回答すると丁寧にアドバイスをくれる。',
          '事例問題を添削してくれる。',
          '授業が興味深い話もあってモチベーションが上がる。',
        ],
        cons: [
          '落単率は4割と高かった。',
          'とにかく勉強が必要。先生の求める基準に達しないと単位はもらえない。',
          '持ち込みがほぼ無限大なので、テスト中に持ち込む紙の量が多すぎて大変そう。',
          '先生の話すスピードが早い。Moodleの資料だけでは理解が難しいかも。',
          '時間内に解くことが難しい。',
          '事例問題は授業で扱わないのにテストでは出題されるため、自分で練習する必要がある。',
        ],
        others: [
          '刑法は三嶋先生と徳永先生が一年ごとに担当しているが、徳永先生の年に取ることをおすすめする。',
          'レジュメだけでなく、教科書を使いながら勉強するのがおすすめ。',
          'スライドを持ち込む際、内容を羅列するだけだと減点されるので注意が必要。',
          '先生が挑発的。',
        ],
      },
      'foreign-language-chinese-wang': {
        name: '外国語演習(中国語)',
        instructor: '王',
        evaluationCriteria: '出席点あり',
        allowedMaterials: '(記載なし)',
        pros: [
          '授業の準備が不要。',
          '教科書を買って出席するだけで法学部の専門単位が取れる信じられない講義。',
          '中間・期末テスト、レポートもなし。',
        ],
        cons: [
          'この授業で中国語が身についた人はおそらくいない。',
          '授業中スマホを触っていても注意されない。先生は自分の世界に入っていて生徒が見えていないのかもしれない。',
        ],
        others: [
          '個人的にこれを超える楽単はない。正直、公にしていいのか心配なレベル。',
        ],
      },
      'criminal-procedure-matsukura': {
        name: '刑事訴訟法',
        instructor: '松倉',
        evaluationCriteria: '期末テスト, 期末レポート, 中間レポート, 任意のレポート課題',
        allowedMaterials: '自筆ノート（A4サイズ1枚・両面可）, 六法',
        pros: [
          '先生の授業が分かりやすく、ハキハキしていて面白い。',
          '救済レポート（中間レポートや裁判傍聴など）があり、単位は取りやすい方。',
          'テストにA4用紙1枚と六法を持ち込めるため、暗記しなくても単位が取れる。',
          '授業中にテストに出る箇所や出ない箇所を分けて教えてくれる。',
        ],
        cons: [
          '範囲が非常に広い。内容が複雑。',
          '単位は取りやすいが評価（採点）は厳しめ。高いGPAを狙う人は大変。',
          '授業に出ないとついていけなくなる。レジュメがとにかく分厚い。',
        ],
        others: [
          '2025年度は単位取得者は多かったが、C評価が150名以上いた。任意のレポート（最大10点〜20点の加算）をすることが重要。',
          '期末テストが60点以下の場合にのみレポートが加点される仕組み。',
        ],
      },
      'civil-law-part3-fujii': {
        name: '民法第3部',
        instructor: '藤井',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし（一部「六法のみ」の記載あり）',
        pros: [
          '説明が比較的詳しく、疑問点は解決できる。',
          'オンデマンド授業が多く、話の区切りが良いところで早めに終わる（15分前など）。',
          '先生の声が優しそうな安心ボイス。',
          '映像が多い。民法好きには内容が面白い。',
        ],
        cons: [
          '内容もテストも非常に難しい。',
          '約半数が落単する。単位取得率は5割で右肩下がり。',
          'テスト範囲が広すぎ、問題数も多い。',
          'テストは時間内に解き終わる人の方が少ない（肌感覚）。',
        ],
        others: [
          'しっかり出席して勉強すれば取れない単位ではないが、難易度は高い。',
          '司法試験を意識している人向けの授業。',
        ],
      },
      'international-organization-law-kiriyama': {
        name: '国際組織法',
        instructor: '桐山',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          'テストが過去問とほとんど同じ内容、あるいは過去問まんまが出る。',
          '授業中に先生がテストに出る場所を教えてくれる。',
          '7〜8問の中から2問選んで解答する形式なので、特定の分野だけ勉強すればいい。',
          '30分くらい早く終わることがある。授業に出なくてもいい。',
        ],
        cons: [
          '話がよくわからない。授業が単調で眠い。',
          '興味がないとあまりおもしろくない。',
          'どんどん人が少なくなっていた。',
        ],
        others: [
          '授業中でしか言わないことがあったり、レジュメに書き込む必要がある内容もあるので油断は禁物。',
        ],
      },
      'political-process-shinada': {
        name: '政治過程論',
        instructor: '品田',
        evaluationCriteria: '期末テスト, 期末レポート',
        allowedMaterials: '持ち込みなし',
        pros: [
          '先生がかわいい。',
          '救済問題とレポートがあり、それらを出せば単位がもらえた。',
        ],
        cons: [
          '先生が冗長。',
          'テストが勉強していたところと違う範囲から出た。',
        ],
        others: [],
      },
      'intellectual-property-law-akamatsu': {
        name: '知的財産法',
        instructor: '赤松',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '六法',
        pros: [
          '説明やスライドが分かりやすく、先生の声の通りが良い。',
          '3問中1問が無解答でも単位があったので、採点はそこまで厳しくない。',
        ],
        cons: [
          '落単率が5割近く、GPA（GPC）が0.61しかない。',
        ],
        others: [],
      },
      'constitutional-law2-kitamura': {
        name: '憲法2',
        instructor: '北村',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '先生が丁寧でレジュメも分かりやすい。',
          '図を板書に書いてくれる。',
          '録音した音声をMoodleに上げてくれるので復習に役立つ。',
        ],
        cons: [
          'レジュメが少し多く、先生が早口なのでメモを取るのが大変。',
          '本当に眠かった（時間のせいもある）。',
        ],
        others: [
          '60点以上取れる人は35%程度だったが、得点調整により40点くらいの人も単位が取れていた。',
          '授業中にテストのヒントを言っているらしい。',
        ],
      },
      'criminal-policy-kanazawa': {
        name: '刑事政策',
        instructor: '金澤',
        evaluationCriteria: '期末テスト, 中間レポート, 任意のレポート',
        allowedMaterials: '持ち込みなし（一部「自筆ノート・A4用紙1枚」の記載あり）',
        pros: [
          '出席しなくて良い。レジュメを読んでいれば授業に出なくても問題ない。',
          'テストはレジュメだけで解ける。採点も努力を汲み取って大目に見てくれている体感。',
          '法学部では珍しくテスト100%ではない。',
        ],
        cons: [
          'レジュメが分かりにくい、字間やフォントに癖があって読みにくい。',
          'テストは各政策の担い手など、かなり細かく聞かれる。',
          'AAが1人もおらず、半分以上の人がC評価だった。',
        ],
        others: [
          '弁護士の講演レポートや裁判傍聴レポートを提出すれば、テスト60点以下の場合に限り最大10点加算される。',
          '教科書は買わなくて良い。',
        ],
      },
      'international-politics-nagai': {
        name: '国際政治',
        instructor: '永井',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '中間と期末で範囲が重複せず（各15回分）、テスト前の負担が軽い。',
          '内容が興味深く、ニュースの見方が変わる。',
          '世界史選択の人には後半（西洋近代政治史）がかなり楽。',
          'フィードバックに採用されるとボーナス点がある。',
          '中間テストの点数を教えてもらえる。',
        ],
        cons: [
          'レジュメが穴あきで口頭説明が多いため、出席しないと勉強が厳しい。',
          '教科書が頻繁に変わる。',
          '中間の点数公表が期末直前なので、低いと焦る。',
        ],
        others: [
          '「よくわかる国際政治」で勉強するのがおすすめ。',
          '来年から形式が変わるらしい。',
        ],
      },
      'commercial-law-part1-kitamura': {
        name: '商法第1部（総則・商行為）',
        instructor: '北村',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '六法（指定六法）',
        pros: [
          '授業の説明、レジュメ、教科書がわかりやすい。',
          '法学部の中では比較的楽単で、授業に行かなくても対策可能。',
          'ほとんどの人がB評価だった。ノー勉でも取れたという声も。',
        ],
        cons: [
          '先生の声が小さく、眠たい。',
          '講義はレジュメを読んでいるだけで、出席する意味をあまり感じない。',
        ],
        others: [
          '教科書は買うべき。レジュメは言葉が省略されているため、教科書があったほうがテスト勉強しやすい。',
        ],
      },
      'commercial-law-general-kitamura': {
        name: '商法総則',
        instructor: '北村',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '授業に出席しなくてもいいところ。',
        ],
        cons: [
          '先生の声が眠すぎる。板書に図を書かず、ずっと話しているだけ。',
        ],
        others: [
          '先生著作の教科書を勧められるが、買わなくても大丈夫そう。テスト勝負。',
        ],
      },
      'comparative-politics-hieda': {
        name: '比較政治学',
        instructor: '稗田',
        evaluationCriteria: '期末テスト, Moodle小テスト（週1回）, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '法学部では珍しくテスト100%ではない（小テストで30%分ある）。',
          '期末の前半はすべて小テストから出るため、そこをこなせばほぼ単位はある。',
        ],
        cons: [
          'たまに当てられる。レジュメがパワポのコピー。',
          '小テストの最後に感想や疑問を書かないと0点になる。',
          '期末後半の論述は授業内容や時事問題が出るため、授業を聞いていないと難しい。',
        ],
        others: [
          '政治に興味がないと理解しづらい。期末テストは過去問対策で対応可能だが、論述の対策は難しい。',
        ],
      },
      'japanese-modern-legal-history-ono': {
        name: '日本近代法制史',
        instructor: '小野',
        evaluationCriteria: '期末レポート',
        allowedMaterials: '(記載なし)',
        pros: [
          '評価基準がレポート100%。提出すればB以上はもらえる。',
          '集中講義で、日を追うごとに終わるのが早くなる。',
          '先生が優しく、話も分かりやすい。',
        ],
        cons: [
          '夏休みに5限フルで通うのがしんどい。',
          'レポートの分量が多い（4000字〜5000字）。',
          '提出期限が5日程度と短かった。',
        ],
        others: [],
      },
      'political-science-nagami': {
        name: '政治学',
        instructor: '永見',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          'テスト範囲をあらかじめ伝えてくれる。',
          '過去問とほとんど同じ問題が出たり、記述問題の範囲を絞ってくれる。',
          '選択問題形式の大問があり、解けそうな問題を選べる。',
        ],
        cons: [
          '内容が理解しにくい。倫理のような内容。',
          'レジュメが詳しくないので授業に出たほうがいい。',
          '割と書いたつもりでもC評価だった。',
        ],
        others: [
          '他の法学部科目に比べれば単位は取りやすい。',
        ],
      },
      'administrative-law2-sato': {
        name: '行政法2',
        instructor: '佐藤',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし, 指定六法',
        pros: [
          '講義が本当にわかりやすい。',
          '毎回最初の30分で前回の復習をしてくれる。',
          '成績に関係ない中間テストを実施し、添削や記述のコツを教えてくれた。',
        ],
        cons: [],
        others: [],
      },
      'legal-development-sugimoto': {
        name: '法曹発展科目',
        instructor: '杉本',
        evaluationCriteria: '期末レポート, 中間レポート',
        allowedMaterials: '(記載なし)',
        pros: [
          '法学部専門科目の中で、恐らく最も単位が取りやすい。',
          '授業はレジュメ通りなので出席不要。',
          'レポート課題の発表が早く、文字数も少ないので負担がない。',
        ],
        cons: [
          'ない。神。',
        ],
        others: [],
      },
      'quantitative-analysis-nishi': {
        name: '法学政治学計量分析',
        instructor: '西',
        evaluationCriteria: '期末レポート, 中間レポート',
        allowedMaterials: '(記載なし)',
        pros: [
          '法学・政治学の勉強は一切不要。テストもない。',
          '内容は完全にプログラミング。丁寧に教えてくれる。',
        ],
        cons: [
          '教授が院生の方で、多少授業のテンポが悪い。',
          'プログラミングに興味がないと退屈。',
        ],
        others: [],
      },
      'law-of-obligations-fujii': {
        name: '債権総論',
        instructor: '藤井',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし, 六法全書',
        pros: [
          'オンデマンド授業が多く、授業が15分ほど早く終わる。',
          '先生の声が安心ボイス。',
        ],
        cons: [
          'テストを時間内に解き終わる人は少ない。',
        ],
        others: [
          '司法試験を意識している人向けの授業。',
        ],
      },
    };

    return courses[id] || courses['law-intro-naka-moriya-kanazawa'];
  };

  const courseData = getCourseData(courseId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '法学部科目一覧', href: '/courses/specialized/law' },
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
