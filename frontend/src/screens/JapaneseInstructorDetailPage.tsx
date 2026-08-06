import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface JapaneseInstructorDetailPageProps {
  instructorId?: string;
  isAuthenticated?: boolean;
}

export function JapaneseInstructorDetailPage({ instructorId = 'ikari-yukio', isAuthenticated = false }: JapaneseInstructorDetailPageProps) {
  // 教員データを instructorId に応じて切り替え
  const getInstructorData = (id: string) => {
    switch (id) {
      case 'ikari-yukio':
        return {
          name: '井狩幸男',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題',
          testPolicy: '自筆ノート、教科書、パソコン、スマホなどなんでもOK',
          pros: [
            '期末テストの内容が事前に知らされるから先に考えて行って当日書き写すだけでいい',
          ],
          cons: [
            '毎回の課題がだるい。課題の提出が遅れるとメール来たり怒られる。先生の話がわかりにくい',
          ],
          others: [],
        };
      case 'inagaki-suchin':
        return {
          name: '稲垣 スーチン',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題、プレゼンテーション、中間テスト、期末レポート',
          testPolicy: '持ち込みなし',
          pros: [
            '授業に出席して課題さえやれば単位はもらえる。テストが簡単',
            '雰囲気良い。教科書をあまり使わないから予習は楽。期末の配点が低いから毎回ちゃんと出席して取り組めば期末の時期は楽だし成績ももらえる。',
            '遅刻に対しては文句は言うが厳しくはない。提出物や授業内の課題が良かったら加点がある(成績に反映される)から多少の不出来はここで取り返せる',
            '実践力がつきそうな内容。すぐ加点してくれる。先生のことがだんだんマスコットみたいに思えてくる。ラブレターが届くので、それを見れば課題が分かる。テストに出るところを教えてくれる。',
            'ボーナス点が多く、努力した分をきっちり点数に反映してくれる。期末テストは実力問題が多く、期末テスト自体の配点も低いので対策がほぼ不要',
          ],
          cons: [
            '毎回課題がある',
            '毎回の課題が多い。欠席の減点がデカイ(3回休むと単位なし)。最初の課題がデカすぎて面食らう',
            '毎回英語の本を読んで要約する課題が出る。いつもいろんな課題がある。慣れるまで時間がかかる。',
            'とにかく課題が多い。まだ開講してないのに英語の本を4冊読んで要約と感想を書くように求めてきた。その後も基本毎週1冊は同様の課題が出される。',
            '多く読んだ分はボーナス点をくれるが、それでも正気の沙汰ではない。出席条件が厳しく、3回までしか欠席できない',
          ],
          others: [],
        };
      case 'taji-toshihiko':
        return {
          name: '田路 敏彦',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、中間レポート、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '英文の構成が少し分かるようになる、授業で当てられることがない',
            '先生の思想が強すぎてもはや面白い。先生の思想語りで授業が30分ほど短くなる。たまにでる作文課題はちゃっぴーに書かせればAもらえる。',
            '教科書を勉強する回は何も聞かなくていい',
          ],
          cons: [
            'やたらと海外の大学ランキングの話などして見下してくる感じがする、脱線の話が長い、レポートの書き方をしっかり守らないと最悪の場合評価貰えない',
            'テストはテストの前の授業などで英文が配られ覚えれば解けるが、量が多いと思う',
            '教科書を忘ると欠席扱いになる。テストがむずい。先生が京大卒ゆえに学歴厨で公立大のことを見下している。作文のテンプレートを1つ間違えるだけで評定1個落としてくる。',
            '教授が露骨な公立大下げをしてくる、思想が強め、とにかく言うこと全てが鬱陶しい',
          ],
          others: [
            '一応寝てても大丈夫、テストで出てくる英文の要約の点数の割合が低くコスパが悪い',
            '授業中にスマホの電源を切れと指示される(隠して触ったら何も言われなかった)',
          ],
        };
      case 'fujii-yoshiko':
        return {
          name: '藤井 佳子',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、課ごとのライティング(1パラグラフ)、中間レポート、プレゼンテーション',
          testPolicy: '持ち込みなし',
          pros: [
            'テストに出る問題全て教えてくれる。しかも、本文からは一切出さない。言われたところ暗記すれば大丈夫。',
            'テストに出る範囲を細かく教えてくれた',
            '学生にテキストの長文を日本語訳させ、その後解説してくれる。細かく説明があって良いと思う。期末テストに出るページをはっきり言ってくれるのでテスト勉強が楽。',
            'テストを事前に伝えてくれたページそのまま出してくれたところ。そのページの歴史の流れ把握して、難しめの文章訳せたら単位取れる。',
            '遅刻は3回で1欠席カウント',
          ],
          cons: [
            '全部直訳しか言わないから、何の役にも立たない。',
            'テストは丸々暗記穴埋め 絶対当てられるし、訳を言って先生も訳を言うの繰り返しで自分が当てられてないところはばちくそ眠い',
            '期末テストは範囲を全て言ってくれるが、その部分を丸暗記しなければならない。本文を読んで答えるスタイルではない。英語力より暗記力を聞いている。本文を読んで勉強しても役に立たなかった。',
            '授業ごとに、毎回全員強制で発表させて、全員回ったらその後は挙手制。1回当たるごとに加点があるので、予習をしっかりして発表できるようにしなければならない。',
            'ひたすら訳すだけの単調な授業で、行く意義を感じない。世界史要素が強すぎる。',
            '授業で扱うテキスト？がめっちゃムズい専門的なアリストテレスの資料みたいなやつだった。',
            '授業ではその資料の英語をひたすら翻訳していくだけで、何が身についてるのか全く分からなかった。',
            '途中から一人1回プレゼンテーションを行う(内容はアリストテレスや関連する思想などについての、先生が決めたいくつかのテーマの中から1人1個選ぶ感じ)',
            '英語の授業やから英語でプレゼンかと思いきや普通に日本語でプレゼンさせられる',
          ],
          others: [
            '普段の授業は、学籍番号順に指名し、一巡したら挙手制。挙手すればするほど加点になるらしい。',
            'プレゼンあるけどなんやかんや耐える。',
          ],
        };
      case 'yabui-emiko':
        return {
          name: '薮井恵美子',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題、小テスト(単語3回、要約1回)、何回かに1回writing課題',
          testPolicy: '持ち込みなし',
          pros: [
            '宿題の量は普通で、頑張れば授業中に終わる',
            '課題はあるが事前にどの問題に誰が当たるか教えてくれるし、分からなくても点は引かれない、テストは教科書の単語と熟語を覚えればなんとかなる',
          ],
          cons: [
            '単語テストの量が多い。ほぼ毎回なんらかの課題が宿題に出される。',
            '教科書とは別に単語のプリントが配られ、範囲は少ないが単語テストが実施される。出席カードを書かなければいけない',
          ],
          others: [
            'ライティング課題はChatGPTに任せればすぐに書ける。',
          ],
        };
      case 'takaya-hana':
        return {
          name: '高谷 華',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題、中間レポート',
          testPolicy: '持ち込みなし',
          pros: [
            '課題が少ない スキミングができるようになる',
            '期末テスト前の3回ぐらいはオンライン授業だった。',
          ],
          cons: [
            '授業内のWritingのテスト時に、考えてきた原稿を見れない',
          ],
          others: [
            'moodleではなくGoogle classroomを使う。期末テストは教科書の文覚えれば耐える',
          ],
        };
      case 'kumadaki-yuki':
        return {
          name: '熊懐 祐樹',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、期末レポート',
          testPolicy: '持ち込みなし',
          pros: [
            '声が渋くて良い声。パソコンとスマホさえ開かなければ楽。結構優しい。ちょっとしたゲームを毎回する。そこでクラスの人と話すことになるので仲良くなりやすい。',
            '予習しなくてもいい。わからんくても最終的に言ってくれる。「(Oconが厳しい分、)こっちは緩くしとくから、テスト出るところ全部言うから」と言っていた。',
            '「日本人の英語で一番簡単なのが僕の授業で、ネイティブの英語で一番難しいのがOcon先生だから、まあある意味バランスは取れているのかもね」と言っていた。',
            'テスト範囲が激狭なのが唯一の良いところ。テストがクソ簡単だった。記号20問と和訳2問だけ。範囲のところ読み込んどけば満点取れる',
            '課題がない。二回ほど50~100字程度の作文をした。期末試験の範囲がかなり狭く、しかもほとんどが穴埋め。授業が60分で終わる',
            '予習が必要ない。宿題無し。クイズでサービス点が入るところ。',
            '期末テストがめっちゃ優しい。教授が少し面白い。授業の後半30分は毎回ゲームをする',
            '自分のクラスは誰も落単しませんでした 楽単です',
            '課題がない。もう1個の英語がオコンの人が多く、楽にしてくれている。',
          ],
          cons: [
            'パソコンとスマホを開いてたらキレて減点される。若干圧迫面接感がある。話がおもんない。',
            '話を知ってる体で話してくるけど、誰も知らんから気まずい空気がただ流れるだけになる。つまらん。楽なのはいいけど本当につまらん。',
            'ゲームで出てくる都道府県や名物などといった事物をバカにするので凄く気分が悪い。なんか腹立ってくる。',
            '思い返すと本当に色んなものをバカにしていたので終始不快だった。つまんねえからさっさと終わってほしいのに、時間いっぱいまでやろうとする',
            'スマホやパソコンに厳しい。出してるだけで-10点される',
            'スマホやタブレットに厳しい。和訳できなかったら詰めてくる。居眠りにも厳しい',
            '授業中に訳させられる。訳が不安なら予習をした方が良い。',
          ],
          others: [
            '単位取りやすいけどオコンもこいつも大外れです',
            '再履のほうが大変だと思うので、絶対に出席したほうがいい。最初の印象は怖いが、慣れれば優しい先生。本人がUE1Aの先生の中で一番優しい先生と自称している',
            'とにかく楽。ノー勉でも4の評価が得られる。Mr.Oconとセットになっている先生で、そっちの事情を加味してくれているため、本当に楽チン。落単者は0人。',
            'Mr.Oconとセットになっているため、当たりかと言われると微妙。',
            '辞書や電子辞書は大丈夫なので絶対持っておくべき',
            '辞書か電子辞書を持っていった方がいい。',
          ],
        };
      case 'kuragaki-sumiko':
        return {
          name: '倉垣 澄子',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題、プレゼンテーション',
          testPolicy: '持ち込みなし',
          pros: [
            '先生が優しめ。',
            '出席してればとりあえずなんとかはなる',
          ],
          cons: [
            '授業内で挙手して発言しないといけない。そのため毎回予習必須。サマリーライティングと要約がある。テストが難しい。',
            '基本毎回の授業中1回は発表させられる。予習はしておくべき。',
          ],
          others: [
            '授業内で配られる英文のプリントはテストの時に使うので持っておいた方がいい。',
            '出席点高め、授業の進め方は高校英語のような感じ',
          ],
        };
      case 'kawabata-junji':
        return {
          name: '川端 淳司',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            'writing の課題があるからテストにでない',
            '初見は怖い雰囲気を感じるが優しい。怒ることはない。よく当てるが答えられなくてもOK。少し課題(要約など)がだるいが出しさえすれば評価してくれる。期末テストは簡単。課題を出しましょう。',
          ],
          cons: [
            'たまーーに当ててくる',
          ],
          others: [
            '優しいと思う。writing の課題が出るけど期限の一ヶ月前くらいから言ってくれるし、グループで作るのもあるからそこまで負担にはならない。',
            'たまに予習する（宿題がある）回がある。英語力に自信があったらしなくてもいいレベル。英語力に自信がなくてもちょっと予習してたら授業中はそんなに心配しなくてもいい',
          ],
        };
      case 'tsutsui-kayoko':
        return {
          name: '筒井 香代子',
          evaluationCriteria: '出席点あり、期末テスト、ライティング課題',
          testPolicy: '持ち込みなし',
          pros: [
            '先生は優しい。あてられて間違えた答えを言っても正解に辿り着くために助けてくださる。',
            '先生がめっちゃ優しい。スライドの写真を撮るだけで授業が終わる。課題は予習のみ。期末テストも割と簡単',
          ],
          cons: [],
          others: [
            'テストは教科書を読んでおけばいける。',
          ],
        };
      case 'ikehata-chikako':
        return {
          name: '池端 千賀子',
          evaluationCriteria: '出席点あり、期末テスト',
          testPolicy: '持ち込みなし',
          pros: [
            '先生がよく喋る、楽しい人。話し上手。優しい。質問歓迎してくれる。毎授業のはじめに洋楽を聞き取るコーナーを設けてくれていたのも楽しかった。',
            '予習やテストの量・難度もほどよく進んでいった。',
            '先生が優しく楽単。テストも超簡単。英作文の採点も緩い。発音や人生観など普通にためになる話が多い',
          ],
          cons: [
            'ほぼ毎回教科書の単語や内容に関する10点満点の小テストがある',
          ],
          others: [
            '本当にいい先生でした',
            '当たりです',
          ],
        };
      case 'honma-yuko':
        return {
          name: '本間 祐子',
          evaluationCriteria: '出席点あり、期末テスト、論理展開パターン別のライティングと要約作成の小テスト、授業内活動への積極的な参加度、writing課題、中間レポート、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '授業の内容をきちんと復習さえすればテストは大体取れる',
            '先生は厳しいがいい人ではある。予習をしっかりやれば力はつく。',
            '友達と確認する場面が多い',
            '先生が真面目。writingもフィードバックを行いながら丁寧に解説してくれる。個人的には先生のノリの軽さが好きだが、人によっては詰められていると感じるかも。',
          ],
          cons: [
            '予習必須、寝ると少し成績を下げられる、時々イギリス行ってた自慢がある、writing課題の評価基準が厳しい',
            '先生がかなり厳しい。誰か1人でも遅刻すると先生の機嫌がかなり悪くなるので遅刻しないようにしましょう。予習がかなり大変。非常にストレスの溜まる授業です。',
            '居眠り禁止。授業の予習で音源を聴いてこないといけない。たまに言い方がきつい',
            '期末テストはちゃんと対策したほうがいい。',
          ],
          others: [
            'テストは本文の和訳が多い。本文中の単語はしっかり覚えると良い。テスト自体はそこまで難しいものではない。',
            '遅刻の判定が厳しめ',
          ],
        };
      case 'iwata-masahiko':
        return {
          name: '岩田 雅彦',
          evaluationCriteria: '期末テスト',
          testPolicy: '持ち込みなし',
          pros: [
            '単位は確約されてる。出席しなくても良い。自分で大学1楽な教授って言ってた。授業も面白かった。',
          ],
          cons: [],
          others: [],
        };
      case 'kikuchi-yuki':
        return {
          name: '菊池 由記',
          evaluationCriteria: '出席点あり、期末テスト、授業参加度、小テスト(4回)、ライティング課題(3回)、中間レポート',
          testPolicy: '持ち込みなし',
          pros: [
            '成績評価は決して甘くないが、成績の評価基準が明確で順当に評価される。',
          ],
          cons: [
            '予習で単語の意味調べること、単語の穴埋め解くこと、文章の各段落の要約すること、内容理解の選択問題解くこと、ライティングの下書き書くことがあるので、面倒。',
            '高校の英語の授業を受けているみたいな感じがして、UEらしさが一切なかった。',
            '予習はそれなりにしていく必要がある。授業中に指名される頻度がかなりバラバラ。',
          ],
          others: [
            '小テストは文章の太字の単語中心に、単語の日→英、短文の穴埋め、並び替えが出題される。',
            '期末試験は高校の定期試験の延長線上のようなもの。授業の最初に出席確認を行うので、出席確認が終わってから授業開始後30分以内までは遅刻になる。',
            '毎回ではないが小テストがある。3回程度、Unitの要約+意見文を課題として課される。毎回出席して普通にやれば単位は取れる。',
          ],
        };
      case 'takai-kinuko':
        return {
          name: '髙井絹子/千田まや',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、毎回の課題',
          testPolicy: '辞書',
          pros: [
            '先生がとても優しい。一つ一つ丁寧に教えてくれる。',
          ],
          cons: [],
          others: [],
        };
      case 'uemura-junko':
        return {
          name: '上村 淳子',
          evaluationCriteria: '出席点あり、期末テスト、中間レポート',
          testPolicy: '持ち込みなし',
          pros: [
            'テストがばり簡単。記述系がないから教科書で出てくる単語の意味わかってたらとれる。英語の小ネタも挟むから、英語好きな人も退屈しない。',
          ],
          cons: [],
          others: [],
        };
      case 'yoshida-yuri':
        return {
          name: '吉田優里',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題',
          testPolicy: 'なし',
          pros: [
            '普通の授業。とりあえず出席して課題しとけば大丈夫。課題の答えを発表する前に、周りと話し合いを毎回させてくれるので、間違えた答えを発表することは無い。',
            'そのおかげで周りの人と仲良くなれる。友達できる。',
            'テストがどんな感じかは、授業で教えてくれなかったけど、自分でどんな勉強すればいいかとか、どんな感じのテストか聞きに行けば、結構詳しく教えてくれた。普通に優しい。',
          ],
          cons: [
            '1章終わる度にファイナルライティングという、何も見ずに英文を書かされるのが難しかった。',
            'マイクが順番に回されて、課題の答えを発表しないといけない。期末テストは時間が足りない。',
          ],
          others: [],
        };
      case 'kosaka-miho':
        return {
          name: '小阪 美帆',
          evaluationCriteria: '出席点あり、期末テスト',
          testPolicy: '持ち込みなし',
          pros: [
            'そんなに課題も出ないし期末テストもそんなに難しくない',
          ],
          cons: [],
          others: [
            'ニックネームをつけさせられる、欠席するなら序盤のほうがいい',
          ],
        };
      case 'fujioka-mayumi':
        return {
          name: '藤岡 真由美',
          evaluationCriteria: '出席点あり、期末テスト、発表、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '全員当てるので1回当たったらすることない。課題が全訳なのでチャッピーとかに投げやすい。単語テストが毎回あるが簡単',
          ],
          cons: [
            '授業中ランダムで当ててくる、段落ごとの発表が1人1回ある',
            '英語のエッセイがだるい。というか評価基準が謎。チャッピー使った友達が毎回満点取ってたのでそれがいいかも。',
            '授業中のスマホは言われないけど、小テストの解説の時にスマホ触ってるのは注意してた。毎回課題はある',
          ],
          others: [
            '1回の授業につき1unit進むので授業進度は爆速。でもテスト範囲はその中から3つほどで、テスト2週間前に言われる。',
            'テストの前の週の授業は休講でした。テスト問題は高校の定期試験って感じの内容。教科書の長文と初見の問題が出ます。',
            '小テストは3パート構成。大問1は選択肢から選ぶ形。大問2は対義語選択。大問3は正しい活用選択。',
            '小テストの大問2の内容がそのまま定期試験に出るので、ここ毎回ちゃんとやってると後々楽です。',
          ],
        };
      case 'hanasaki-tomoko':
        return {
          name: '花崎 知子',
          evaluationCriteria: '期末テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '男女二人で毎週固定のペアを組んで授業内課題に取り組むのだが、まあまあ当てられる。良いところといえば、わからないと言えばとばしてくれることぐらいかもしれない。',
            'あとテストはそんなにむずかしくない。普段の小テストと同じ問題がわりと出ていた。',
            '一週間前にまとめて配信された今までの小テスト集をなんとなく覚えていったら単位はとれた。',
            'クラス成績をみても出席日数さえ足りていれば単位はもらえているようだ。',
          ],
          cons: [
            '課題がめんどくさい。とんちんかんな間違いをしたらにやにやしてくる。',
          ],
          others: [],
        };
      case 'hamamoto-hideki':
        return {
          name: '濱本 秀樹',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、中間レポート、英作3回と数回に1回小テスト',
          testPolicy: '持ち込みなし',
          pros: [
            '毎授業ごとに単語の小テストがある。そこから期末テストが出るので対策はしやすかった。期末テスト範囲は単語＋80語程度の作文。',
            '期末テストがほとんど小テストからの抜粋だから真面目に勉強してたらAA取れる',
          ],
          cons: [
            '名簿順に当ててくるに加え、答えられないと飛ばされて別の質問をされるので、授業は聞いておく必要がある。',
          ],
          others: [],
        };
      case 'takahashi-minako':
        return {
          name: '高橋 美奈子',
          evaluationCriteria: '出席点あり、期末テスト、中間レポート、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [],
          cons: [
            'えこひいきがかなりある先生。プライドが高く、自分の解釈以外は受け付けない',
          ],
          others: [],
        };
      case 'yamaguchi-norikazu':
        return {
          name: '山口 徳一',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、毎授業の単語テスト、たまにあるテキストテスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '課題がない',
            '生徒を当てない。淡々と授業を進める',
            'norikaz.comのペットの写真が可愛い。期末テストは簡単',
          ],
          cons: [
            '毎回単語テストがある。単語テストのだす形式が少し捻ってあって正確な答えを選ぶのが難しい。',
            '授業中に出す問題や単語テストを解く時間が短い。期末や中間の単語テストの単語数が多い。',
            '相対評価だから絶対に落単が出る。毎回の小テスト（単語）の点数が出席点になる。単語中間テストは基準点を切ると追試がある',
          ],
          others: [
            '毎回単語小テストあり',
          ],
        };
      case 'sato-makiko':
        return {
          name: '佐藤 牧子',
          evaluationCriteria: '出席点あり、期末テスト、中間レポート、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '先生が優しい。提出遅れや遅刻は基本許される。期末試験は割と簡単で、授業で使ったプリントから多く出題される。',
          ],
          cons: [
            'writingの課題(意見・要約など)がそこそこめんどくさい。先生の時間配分がちょっと下手。',
          ],
          others: [],
        };
      case 'lee-hyunsook':
        return {
          name: '李 鉉淑',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '会話する機会が多いので仲良くなれる',
          ],
          cons: [
            'ひたすら動画を撮らせてくる。恥ずかしい。出席も授業中に動画や写真を撮って確認するスタイルな上、休むと過剰に心配される。',
          ],
          others: [
            'テストは鬼簡単',
          ],
        };
      case 'yamazaki-masato':
        return {
          name: '山崎 雅人',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '先生から問題がランダムで振られるが、わからなくて詰まっているとヒントをたくさん出して助けてくれる。',
          ],
          cons: [
            '毎回の課題が本当に本当に面倒くさい。指定範囲の予習、授業中の問題への回答、授業内容の振り返り(英語)をしなければいけなく、かなりの負担であった。',
            '授業中も先生がずっと喋っているため集中して英文を読むことができない。',
            'テストがとても難しく、中間テストでも1時間半時間が取られ、期末テストも難しく、基準がとても厳しい。',
            'また、成績分布にAAを取った人がいない。かなり厳しい。',
          ],
          others: [],
        };
      case 'ishii-takayuki':
        return {
          name: '石井 隆之',
          evaluationCriteria: '出席点あり、期末レポート',
          testPolicy: 'なし',
          pros: [
            '超優しく、大当たり。授業に出て、短い感想を書きさえすればよい。期末試験もなく、word2枚程度のレポートのみ課せられる。',
          ],
          cons: [
            '授業は眠たいかも。',
          ],
          others: [],
        };
      case 'esther-maxton':
        return {
          name: 'エスター',
          evaluationCriteria: '出席点あり、毎回の課題、プレゼンテーション',
          testPolicy: 'なし',
          pros: [],
          cons: [
            'AAは誰もつかない。ネイティブレベルの人もA止まり。ちゃんと出席していても普通にCがつく。',
          ],
          others: [],
        };
      case 'saito-tomoko':
        return {
          name: '齋藤 倫子',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '先生が優しい。毎回音楽かけてくれる',
            'ほぼ毎回課題が出るが全部20分〜1時間で終わる。小テストも教科書で太字の単語や文法をちゃんと覚えれば余裕。先生が穏やかで優しい。',
          ],
          cons: [
            '毎回の課題、レポートがだるい',
            '期末で本文を要約するテストと本文や初出の文章の問題を解くテストが1週ずつ別であり、問題を解く方はとても簡単だったが要約テストは時間足りない。',
            '前々から練習しといた方がいい。Wordを印刷する課題は様式を完璧に守らないと減点されるので要注意',
          ],
          others: [
            'UE1A',
          ],
        };
      case 'noda-miki':
        return {
          name: '野田 三貴',
          evaluationCriteria: '出席点あり、期末テスト、単元ごとの小テスト',
          testPolicy: '持ち込みなし',
          pros: [
            '先生が優しくて美人。遅刻3回で1欠席だったはずなので結構ゆるい。予習完璧にすれば発表点を稼ぐことができる。',
            'テストはどこが出るかを前の週に結構教えてくれるので対策がしやすかった',
          ],
          cons: [
            '予習の量が結構多いし予習やってるかどうかチェックされる',
          ],
          others: [
            '班を作って授業中に発表すれば個人点と班の点数が成績に入る',
          ],
        };
      case 'toda-yoko':
        return {
          name: '遠田 陽子',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題',
          testPolicy: '持ち込みなし、自筆ノート',
          pros: [],
          cons: [],
          others: [
            '小テストがある',
          ],
        };
      case 'hon-myongchol':
        return {
          name: 'ほんみょんちょる',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '毎回グループワークなので人と関わりやすい、資料をまとめてテスト前に送ってくれる',
          ],
          cons: [
            'グループの相性次第ではよくないときもあるかも、基本そんなになし',
          ],
          others: [
            '専用のオープンチャットあり、質問がしやすい',
          ],
        };
      case 'takahashi-akio':
        return {
          name: '高橋 章夫',
          evaluationCriteria: '出席点あり、期末テスト、中間レポート',
          testPolicy: '持ち込みなし',
          pros: [
            'テストの内容をざっくり教えてくれるところ。またテストの範囲も狭かったところ。',
          ],
          cons: [
            '毎回の授業でほぼ必ず当てられるので、毎回予習をしなければならないのが大変だった。',
            'また、答えられないと予習不足としてチェックがつくこともあった。',
          ],
          others: [],
        };
      case 'araki-yasuhiro':
        return {
          name: '荒木 康裕',
          evaluationCriteria: '出席点あり、期末テスト、中間レポート',
          testPolicy: '持ち込みなし',
          pros: [
            '先生が超優しい、めちゃめちゃ良い人。要約、ライティング課題が最初の方は日本語でも良いので楽',
          ],
          cons: [
            'テスト範囲がまあまあ重い',
          ],
          others: [
            '授業は1文ずつ当てられて日本語訳を答えればいいだけ、1回の授業で必ず1回は当たるので、当たる文章だけきちんと訳せたらOK',
          ],
        };
      case 'shimizu-kanae':
        return {
          name: '清水 佳苗',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題、小テスト、writing',
          testPolicy: '持ち込みなし',
          pros: [
            '教え方・話し方が丁寧。小テストは授業中に出るところをほのめかしてくれるので簡単。',
            '課題で教科書の問題を解く以外に配布プリントの穴埋めが出されるが、授業中に終わる。',
            '1限だが授業1回に3回くらい当てられるので眠くなりにくい。',
          ],
          cons: [
            '緊張しているのか授業になれないのか、教室がぎこちない空気がすることがある。話し方がやたら丁寧なのもそのせいかも。',
          ],
          others: [],
        };
      case 'ogami-yuichiro':
        return {
          name: '大神 雄一郎',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            'ひたすら生徒目線から話してくれるいい距離感',
            '課題も軽め、テスト簡単、先生優しい',
            '物腰柔らかい良い先生。このクラスだったらアタリ',
            '先生がすごく優しい。',
          ],
          cons: [
            'テスト中に高頻度で話す',
            '眠たい',
          ],
          others: [],
        };
      case 'tsutada-kazumi':
        return {
          name: '蔦田 和美',
          evaluationCriteria: '期末テスト、プレゼンテーション、英作が4回',
          testPolicy: '持ち込みなし',
          pros: [
            'ためになる授業、真面目に受ければテスト微妙でもAA',
          ],
          cons: [],
          others: [],
        };
      case 'dake-mami':
        return {
          name: '嶽 麻美',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [],
          cons: [
            '毎回だるめの課題がある。詰められるというより大した理由もなく突っかかってくるタイプ',
          ],
          others: [
            'ハズレ枠',
          ],
        };
      case 'matsumura-yuko':
        return {
          name: '松村 優子',
          evaluationCriteria: '出席点あり、期末テスト、要約などの小テスト',
          testPolicy: '持ち込みなし',
          pros: [
            'テストは難しくないです。普通に高校みたいな感じ',
          ],
          cons: [
            '順番に当たります。',
          ],
          others: [
            '教授がたまに何言ってるかわかりません',
          ],
        };
      case 'hasegawa-kenichi':
        return {
          name: '長谷川 健一',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '先生がとても優しい。ドイツが好きなのがよく伝わってきて、文法などもとても丁寧に楽しく教えてくれる。',
            '発音課題が出されるが、それにも一人ひとりへのフィードバックが送られてくる。',
          ],
          cons: [],
          others: [],
        };
      default:
        return {
          name: '教員情報',
          evaluationCriteria: '詳細は準備中です。',
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
          { label: '日本語教師一覧', href: '/instructors/english-japanese' },
          { label: `${instructor.name}先生` },
        ]} />

        <div className="space-y-4 md:space-y-6">
          {/* 教員名 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
            <h1 className="mb-2 text-xl md:text-3xl">{instructor.name}先生</h1>
            <p className="text-gray-600 text-sm md:text-base">外国語科目(英語必修)-日本語教師</p>
          </div>

          {/* 評価基準とテスト持ち込み */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
              <h2 className="mb-3 md:mb-4 text-base md:text-xl">評価基準</h2>
              <p className="text-gray-700 text-sm md:text-base">{instructor.evaluationCriteria}</p>
            </div>

            {instructor.testPolicy && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
                <h2 className="mb-3 md:mb-4 text-base md:text-xl">テスト持ち込み</h2>
                <p className="text-gray-700 text-sm md:text-base">{instructor.testPolicy}</p>
              </div>
            )}
          </div>

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