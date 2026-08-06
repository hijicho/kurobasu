import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface InstructorDetailPageProps {
  instructorId?: string;
  isAuthenticated?: boolean;
}

export function InstructorDetailPage({ instructorId = 'hayashi-yuki', isAuthenticated = false }: InstructorDetailPageProps) {
  // 教員データを instructorId に応じて切り替え
  const getInstructorData = (id: string) => {
    switch (id) {
      case 'hayashi-yuki':
        return {
          name: '林 祐樹',
          evaluationCriteria: '小テスト6回、Word、Excel、PowerPoint課題',
          testPolicy: '持ち込みなし',
          pros: [
            '教え方が丁寧',
            '聞かなくても大丈夫',
            'Word演習ちょろい',
            '内職できる',
            '課題が少ない',
            '授業は聞かなくてもAAが取れる',
            'テストはノー勉でもできるが、一度だけ難しい範囲がある。ただしその回は平均点が低いため補正してくれる',
          ],
          cons: [
            '時間内に終わらず最後のほうが雑い',
            '授業が早く終わっても退出はさせてくれない',
            '小テストが地味にだるい',
            'Excelなどが苦手だとしんどい',
            'テストが6回あるので、勉強する人は大変',
            '話が分かりづらいので、授業をきちんと聞きたい人には外れかもしれない',
          ],
          others: [
            'カンニングや教室外からの受験などがバレた人は、後で呼び出しを受けていた',
          ],
        };
      case 'masuda-seiko':
        return {
          name: '桝田聖子',
          evaluationCriteria: '中間テスト、毎回の課題、期末テスト、出席点あり、確認テスト',
          testPolicy: '持ち込みなし',
          pros: [
            'オンデマンドで好きなときに見れる。',
            '今年からほとんど遠隔になったのでそもそもどの先生も緩いと思う。',
            'ちゃんとやっていればほとんどAAが取れる楽単。',
          ],
          cons: [
            '対面でテストが2回ある。',
            'テストの時だけ対面だったので1限がきつかった。',
            'オンデマンドが故に課題を忘れそうになる。',
            '最後の方のWord、Excel、PowerPointの課題は普通にダルいけど、どこのクラスも同じだと思う。',
          ],
          others: [
            '普通にやってれば単位落とすことはない。',
            '動画は見なくてもいいけど、一応リンクを開いてはおくべき。',
            '確認テストの内容は高校の情報とちょっとした常識を問われている感じだからテスト勉強も大してしなくていい。',
            '確認テストはめちゃくちゃ不正対策をしてくるが、1回目は簡単だった一方で2回目は範囲が少ないがちょっと勉強しないと難しいと思った。',
            '確認テストは出席しないと受けられないように対策されているので必ず出席すること。',
            '確認テストは一回でも出なければ落単確定。',
          ],
        };
      case 'fujita-akito':
        return {
          name: '藤田昭人',
          evaluationCriteria: '中間テスト、毎回の課題、期末テスト',
          testPolicy: '持ち込みなし',
          pros: [
            '簡単。',
            '中間テストは6割取れてたら満点扱い（自称）。',
            '初回と中間期末のテスト以外出席しなくていい。',
            '動画の視聴も履歴は見られないっぽい。',
            '授業動画を見なくても出せる課題が多いのですぐ終わる。',
          ],
          cons: [
            '成績評価低い。',
            'BかCか落単しかなかった。',
            '毎回課題があってめんどくさい。',
            '課題をやるのを忘れる、テストを忘れる。',
            '最高評価がGPA2で、GPA3や4の人がいなかった。',
          ],
          others: [
            '課題出してれば単位は取れる。',
          ],
        };
      case 'noguchi-norimasa':
        return {
          name: '野口 典正',
          evaluationCriteria: '期末テスト、中間テスト、毎回の課題、出席点あり、プレゼン課題・ワード課題・エクセル課題、中間レポート',
          testPolicy: '持ち込みなし',
          pros: [
            'オンデマンド形式でテストも簡単。',
            'ExcelやWordの使い方について学べる。',
            '完全オンデマンド。',
            '最初10回の課題はとても楽。',
            'オンラインのため学校のマイクロソフトアカウントでログインした状態で倍速で流していればOKで、注意して聞く必要はないしテストも勉強の必要はない。',
            '初回と中間テストの日以外は出席しなくていい。',
            'PCを触るのが好きとか慣れているとかの場合は特に簡単。',
            '授業時間が短く、毎回課題が出るがそれほど難しくなくすぐにできる。',
            '授業時間から1週間以内なら好きな時間に動画を見て課題を済ませられる。',
            '単位落とす人あんまりいない。',
          ],
          cons: [
            '1回目のテストは簡単なのに二回目のテストが難しい。',
            'オンデマンドの動画は全くみる意味がなく音声がいらない。',
            'その後の課題がエクセルやパワーポイントなど時間をかけなければいけないものが多くてめんどくさい。',
            '資料の解放が遅く、授業時間になってもアップロードされていないことが多いので真面目にやりたい人からするとイライラすると思う。',
            'プレゼン課題がだるい。',
            '2回目の中間テストはちゃんと勉強しないと絶対わからない。',
            '最後の方の課題がめんどくさい。',
            'ムードル実施のため課題提出期限を忘れがち。',
            '2回目のテストが難しい。',
            '動画を見てその後に問題を解かなければならないのが少し面倒。',
            '2回の対面テスト（PCで受験）があり、勉強しないと取れない。',
            '最後の5回くらいはパワポやExcel、Wordを使った課題で結構めんどくさかった。',
          ],
          others: [
            'あまり情報系の科目に自信がないなら目を通す程度はしておいたほうがいい。',
            '必修だから素直に取っておけという感じ。',
          ],
        };
      case 'tode-hideki':
        return {
          name: '戸出英樹、北條仁志',
          evaluationCriteria: '中間テスト、毎回の課題、2回出席のテスト有り、期末テスト',
          testPolicy: '持ち込みなし',
          pros: [
            '基本オンラインなところ。',
            'テストの日は出席必須だが課題はだいたい簡単。',
            '最初の授業と2回のテストの場合だけ出席すれば良い。',
            '初回とテスト回以外はオンデマンドオンライン。',
            '前半のeラーニングという課題は問題に正解しなくてもいいしすぐ終わるため、ログインボーナス感覚で完了できる。',
            '試験は舐められた常識問題もあり、一定の点数を越せばそれ以上は評価が上がらないため、ほぼ誰でも満点評価を狙える。',
            '毎授業見るように指定される動画を見なくても課題を完了できる。',
          ],
          cons: [
            'Wordとパワポの課題はだるい。',
            '出し忘れると欠席扱いになるため、パワポ・ワード・エクセル課題は出し忘れないに越したことはない。',
            '動画を見たか、倍速したかどうかがバレるらしいが、白黒はっきりしてほしい。',
            'テストは対面かつパソコンで行い、複数タブは開けない。',
            'テスト数十分前に今までの授業範囲を見れなくするという嫌がらせを行ってくる。',
            'テストを開始するためのパスワードに$記号が入っており、パソコン初心者を潰しにかかっている。',
            '後半のパワポを出す課題の一回あたりにかかる時間が、前半の課題にかかる合計時間より遥かに長い。',
            '最後の対面でのテスト後にこれがあるため、テストが終わってからが本番という意味不明な状況。',
            'パワポ課題は見せる相手が教授のおっさん達であり、発表しないのに発表原稿まで作らされる。',
          ],
          others: [
            '動画教材は生徒役のキャストたちが問題を起こして情報リテラシーを学んでいく内容だが、シュールすぎて完全にギャグである。',
            '対面は第1、6、10回。',
          ],
        };
      case 'nagata-yoshikatsu':
        return {
          name: '永田 好克',
          evaluationCriteria: '期末テスト、中間テスト、毎回の課題、中間期末のみ出席必須',
          testPolicy: '持ち込みなし',
          pros: [
            '2回あるテスト以外オンデマンド。',
            '毎週動画を見て簡単な課題を少しやるだけで終わる。',
            'テストに出る単語まとめPDFを丸暗記すれば満点取れる。',
            '基本オンデマンドなところ。',
          ],
          cons: [
            '中間テストは常識問題だったが期末テストはそこそこ詳しく聞かれた。',
            '毎週の課題は忘れがち。',
            '後半の課題がめんどくさい。',
            '2回目のテストが難しい。',
          ],
          others: [
            '動画は最後まで見てるかチェックされてる疑惑があるのでちゃんと再生したほうがよい。',
            'テストの際はパソコン必須でiPadやスマホ受験は認められないのでちゃんと用意すること。',
          ],
        };
      case 'fujimoto-manato':
        return {
          name: '藤本まなと',
          evaluationCriteria: '中間テスト、毎回の課題、期末テスト、確認テスト',
          testPolicy: '持ち込みなし',
          pros: [
            'テスト以外オンラインで課題が簡単。',
            '第1回のガイダンス、第6回・第10回のほぼ中間期末テストといえる確認テスト以外はオンデマンド。',
            '落単はほぼおらず3人だけ。',
            'けっこうタメになることを遠隔で見るスタイル。',
            '先生が優しくて課題のリマインドを直近でしてくれる。',
            'テストもそこそこ解ける。',
            '今年から遠隔になって3回しか対面がないから楽。',
            'テスト簡単やのに制限時間40分とかでめっちゃ暇。',
          ],
          cons: [
            '初回の授業とテスト3回は教室に行かなければならない。',
            '毎回出されるドリルみたいな小テストや課題の期限が一週間なので忘れそうになる。',
            'テストがところどころ覚えていないものもあったので主記憶装置あたりはしっかり復習しておくことをおすすめする。',
            '後半はパソコンがないとできない課題だったので何度リマインドしてもらっても課題を何度か忘れた。',
          ],
          others: [
            'オンデマンドの授業は見ておかないと成績にかかわってくるとうわさで聞いたため流しておいたほうがよい（共テレベルなので聞かなくてもよい）。',
            '毎回ある小テストは一回忘れたらアウトではないがだんだん減点される。',
            '確認テストは50問くらいの選択式の小問で難しくなかった。',
            'eラーニングさえやっておけば大丈夫。',
          ],
        };
      case 'iwata-motoi':
        return {
          name: '岩田基',
          evaluationCriteria: '期末テスト、中間テスト、毎回の課題、対面の確認テストが2回ある',
          testPolicy: '持ち込みなし',
          pros: [
            '楽。',
            '出席はテストのときだけ。',
            'テストが簡単。',
          ],
          cons: [
            '毎回の課題がそれなりに重い。',
            '必修だし逃げれない。',
          ],
          others: [
            '1回目のテストは6割以上正解していたら満点扱いだったが、2回目は満点扱いの条件が厳しく、それなりに勉強は必要。',
          ],
        };
      case 'masuyama-naoki':
        return {
          name: '増山直輝、能島裕介',
          evaluationCriteria: '毎回の課題、期末テスト、中間テスト、確認テスト（3回）',
          testPolicy: '持ち込みなし',
          pros: [
            '15回のうち13回の授業が遠隔で楽。',
            '対面の2回は中間テスト的な感じで7割くらいの正答率で満点扱いしてくれる。',
            'テストの日以外は非同期オンラインなのでいつ取り組んでもよい。',
            '15回授業があるうちの3回しか対面の授業がない。',
          ],
          cons: [
            '最後の方のプレゼンテーション作成の課題が面倒くさかった。',
            '共通テストでやった範囲とモロ被りでつまらない。',
            '高校まででやってきているであろうことと被っていて授業の価値が低い。',
            '毎回課題をこなす必要がある。',
            '最後あたりに出されるWordやPowerPoint、Excelの課題が少しだるい。',
          ],
          others: [
            '先生がしみけんに似てる。',
            '映像の視聴はおそらく点数に反映されないので見なくても大丈夫だと思われる。',
            '基本オンラインだがテストの日は出席が必要で、テストを受けないとだいぶ単位取得がキツくなる。',
            '毎回の課題を忘れずにこなしてテストに出席さえすれば単位は取れる。',
          ],
        };
      case 'kitani-yuki':
        return {
          name: '木谷裕紀',
          evaluationCriteria: '中間テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '出席しなくてもいい',
          ],
          cons: [
            '後半のワード、パワポ演習がめんどくさい',
          ],
          others: [],
        };
      case 'nishimura-yuichiro':
        return {
          name: '西村雄一郎',
          evaluationCriteria: '出席点あり、毎回の課題',
          testPolicy: '記載なし',
          pros: [],
          cons: [],
          others: [
            '宿題をきちんと出す、テストを受ける、この二��を守れば絶対に単位は取れる。',
            'テスト内容も全然難しくない。',
          ],
        };
      case 'yoshida-daisuke':
        return {
          name: '吉田 大介',
          evaluationCriteria: '期末テスト、中間レポート、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            'パソコンに強い人なら余裕で単位が取れる。',
            '数回の対面のテスト以外はオンラインで課題を提出するのみで対面のテストも簡単な楽単。',
          ],
          cons: [
            'いままでパワーポイントやエクセルを触ったことがない人は大変かもしれない。',
          ],
          others: [],
        };
      case 'tran-thi-hong':
        return {
          name: 'TRAN THI HONG',
          evaluationCriteria: '中間テスト、毎回の課題、出席点あり',
          testPolicy: '持ち込みなし',
          pros: [
            'オンデマンドだから楽。',
            '毎回の課題をしっかりと提出して中間テストで6割、その後の課題も出し続ければ単位はもらえる。',
            '課題さえやってれば成績はくれる。',
          ],
          cons: [
            '課題の提出忘れがち。',
            '中間テストは2回ともまあまあ難しかった。',
            '普段はオンデマンドだけど中間テストだけは対面なので出席忘れがち。',
            'AAは誰もいなかった。',
          ],
          others: [],
        };
      case 'onishi-katsumi':
        return {
          name: '大西 克実',
          evaluationCriteria: '期末テスト、中間テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            'テスト以外はオンデマンドで、動画見なくても課題を出せばオッケー。',
          ],
          cons: [],
          others: [],
        };
      default:
        return {
          name: '教員情報',
          evaluationCriteria: '詳細は準備中です。',
          testPolicy: '記載なし',
          pros: [],
          cons: [],
          others: [],
        };
    }
  };

  const instructor = getInstructorData(instructorId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />
      
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '情報リテラシー科目 教員一覧', href: '/instructors/information-literacy' },
          { label: `${instructor.name}先生` },
        ]} />

        <div className="space-y-4 md:space-y-6">
          {/* 教員名 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
            <h1 className="mb-2 text-xl md:text-3xl">{instructor.name}先生</h1>
            <p className="text-gray-600 text-sm md:text-base">情報リテラシー科目</p>
          </div>

          {/* 評価基準 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
            <h2 className="mb-3 md:mb-4 text-base md:text-xl">評価基準</h2>
            <p className="text-gray-700 text-sm md:text-base">{instructor.evaluationCriteria}</p>
          </div>

          {/* テスト持ち込み */}
          {instructor.testPolicy && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
              <h2 className="mb-3 md:mb-4 text-base md:text-xl">テスト持ち込み</h2>
              <p className="text-gray-700 text-sm md:text-base">{instructor.testPolicy}</p>
            </div>
          )}

          {/* 良かった点 */}
          {instructor.pros.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-base md:text-xl">良かった点</h2>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {instructor.pros.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-gray-700 flex-1 text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 悪かった点 */}
          {instructor.cons.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <XCircle className="w-5 h-5 text-red-600" />
                <h2 className="text-base md:text-xl">悪かった点</h2>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {instructor.cons.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-600 mt-1">•</span>
                    <span className="text-gray-700 flex-1 text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* その他 */}
          {instructor.others.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
              <div className="flex items-center gap-3 mb-3 md:mb-4">
                <Info className="w-5 h-5 text-blue-600" />
                <h2 className="text-base md:text-xl">その他</h2>
              </div>
              <ul className="space-y-2 md:space-y-3">
                {instructor.others.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700 flex-1 text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}