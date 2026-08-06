import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface EnglishInstructorDetailPageProps {
  instructorId?: string;
  isAuthenticated?: boolean;
}

export function EnglishInstructorDetailPage({ instructorId = 'pollock-timothy-wayne', isAuthenticated = false }: EnglishInstructorDetailPageProps) {
  // 教員データを instructorId に応じて切り替え
  const getInstructorData = (id: string) => {
    switch (id) {
      case 'pollock-timothy-wayne':
        return {
          name: 'ＰＯＬＬＯＣＫ　ＴＩＭＯＴＨＹ　ＷＡＹＮＥ',
          evaluationCriteria: '中間レポート、プレゼンテーション',
          pros: [
            '先生が優しくて面白い',
            '成績はほとんどがAで、3人くらいがAA',
            '半分くらいがオンデマンド',
            'オンデマンド回が多い',
            'オンデマンド時の課題はあるが難しくない',
            'プレゼンは4回あり、メモを持ったままでよい',
          ],
          cons: [
            'オンデマンドに慣れすぎて、対面で行くのが苦痛になる',
          ],
          others: [
            'プレゼンは2人組で行うことが多い',
            '出席はあまり関係なく、プレゼンの上手さで評価が決まる',
          ],
        };
      case 'ocon-auric-bertram':
        return {
          name: 'Ocon Auric Bertram',
          evaluationCriteria: '出席点あり、期末テスト、期末レポート、毎回の課題、プレゼンテーション、Speaking test',
          testPolicy: '持ち込みなし',
          pros: [
            'クラスの子と仲良くなれる。先生が怒らない。',
            'オコンクラスの中で仲間意識ができて、みんなと仲良くなれる',
            '先生が優しい',
            '質問には丁寧に答えてくれる 去年より単位取得難易度が易しくなっていそう',
            'オコンの人間性が素敵。他の学科の人や先輩ととオコントークで盛り上がれる。',
          ],
          cons: [
            '毎回の課題が多い。1時間はかかる。課題の指示に従わないと点数がない。授業内で指示をよく聞いた方が良い。授業中にランダムで当てられる。',
            '最後の3週間連続のテストが本当に精神をけずってくる',
            '毎週の課題が多すぎる上に、プレゼンテーションに全く関係のない宿題を延々とさせられる テストがうざいしだるい(うちのクラスはテスト週間を前にはみ出して3週テストだった)',
            'この授業の宿題とかテスト勉強のせいで他の授業のレポートとかテスト勉強の時間が取れなくなる',
            '英語は暗記教科じゃないとか言って暗記をめっちゃ嫌うくせに、自分のテストは結局暗記ゲー',
            'テスト週間に殺意が湧いて、自分の心が狭いのかとこっちが罪悪感を覚えさせられる',
            '先生が真面目すぎる',
            '課題がとても多く、文法は90％以上正確でなければいけない プレゼンテーションは2回だけだが、200字以上で完全暗記しなければならない UE1Bのくせに期末テストがある しかも3回期末テストをおこなう',
            '期末テストは完全暗記',
            '課題が多い',
            '文法間違いに異常に厳しい。',
          ],
          others: [
            'スピーチが2回あった。テストは3日間あった。',
            'オコンならば授業を切った方が良い',
            '生徒の欠席には厳しいくせに、自分は生徒が電車に既に乗っているであろう時間に休講連絡してくる(理由は本当かわからないけど、彼女の料理でフードポイズンって言ってた)',
            '日本語は結構喋れるので、英語で日本語で話してもいいですかとか言ったら普通にOKしてくれる ムキムキなせいでシャツがパツパツで乳首がわかるのが気まずい',
            'おそらくハム大の中で一番宿題を課してくる先生。毎回宿題を課してくる。2時間以上かかります。',
            'スピーチテストが数回あり、複数回につくsの発音や、冠詞のつけ忘れなど細かいところまで評価され、6回以上ミスすると再度受けないといけない。受かるまで逃げられない仕組みになっている。',
            '期末テストが3週連続実施されるという鬼畜ぶり。内容はそこまで難しくないものの、全て最低50%以上得点しないといけなくて、尚且つ3つトータルで60%以上得点しないと単位をくれない。仮にひとつでも50%を切ると落単する。',
            'しかし、先生がイケメンで筋肉があり、真面目で優しい人のため、憎めないのも確か。真面目すぎるが故にこういうことになっているのだろう。',
            'ちなみにうちのクラスは落単者0人という快挙であった。評価が優しくなっているのも確か。',
            'この人に当たった際には、すぐに授業を切るもしくは半期は頑張ってみるのどちらかをお勧めする。',
            '英語力が低い人は再履を考えたほうが良いです',
            '近年オコンやさしくなってます！',
            'さすがに問題があると判断したのか、一度UE1Aの時間でオコンについてのアンケートが行われた',
            '自分は初回だけ出て鼻についたので計画的再履修にすることにしたが、経済学部は課題が全然ないので、頑張りたい人は頑張ってもいいと思う',
            'ただ課題は毎週相当時間がかかるので、本当に頑張りたい人、再履修が嫌な人のみやるべき(しかし、正直再履修の方が楽なので再履修にすることをおすすめします)',
            'どうやらずっと改善していないらしい(シラバスに沿った授業をしない、教科書を使わないなど)',
            '自分は切ったからよく知らないが、少し緩くなった説が浮上している',
            '今年はまだ評価の付け方が優しく、AAも3人いた。',
            'さすがにお叱りを受けたようで、去年までより緩くなったと思われる 落単0人のクラスもあったそうだが、自分のクラスは7人落としていた',
          ],
        };
      case 'richard-farmer':
        return {
          name: 'Richard Farmer',
          evaluationCriteria: '出席点あり、期末テスト、中間テスト、毎回の課題、プレゼンテーション',
          testPolicy: '持ち込みなし',
          pros: [
            'プレゼンスキルは身に付く。',
          ],
          cons: [
            '負担が大きい。文章内容やスライド、引用の仕方に至るまで、厳格で厳しい。課題の提出方法についてもうるさい。',
            '課題の説明が聞き取れない・理解できない/突然3回くらいテストがある/プレゼン原稿は絶対暗記、スクリプトは持ち込み不可/プロジェクターの接続が悪いとイライラし始める',
            '生徒の教科書にペンで大きくバツをつけるため不快/少しでも不満があると感情垂れ流しで貧乏ゆすりをしていて不快',
            'プレゼンに関して妥協はなく、Q&Aまでやらせるため非常に厳しい',
            '普通に切って再履に回すのをお勧めする。 4が0人3が1人後は2か1か0でした。 平均は1.3とかでした。',
            'どんだけ頑張っても AA 0人 A1人 あと他はBかCか落単 教員がシンプルうざい',
          ],
          others: [
            '大変だが必修なので、何とか課題をやりきって、プレゼンテーションを乗り越える他ない。',
            '前期試験失敗して中期でこの学科に入ったキミ、履修登録だけして、後期のオンライン再履に回そう！ 真面目に受けるだけ無駄。',
          ],
        };
      case 'selzer-mark-alan':
        return {
          name: 'Selzer Mark Alan',
          evaluationCriteria: 'プレゼンテーション',
          testPolicy: '記載なし',
          pros: [
            '３回に１回休みです',
          ],
          cons: [],
          others: [],
        };
      case 'jones-barbara-ann':
        return {
          name: 'Jones Barbara Ann',
          evaluationCriteria: 'プレゼンテーション、出席点あり、毎回の課題、期末テスト',
          testPolicy: '持ち込みなし',
          pros: [
            '正直話してる内容はあまりわからなかったが、よく冗談っぽいことを言うおもしろい先生だと思う。',
            '１つの8分くらいのプレゼンを2人で半期をかけてゆっくり作るだけだったので、作業量はかなり少ない',
            '頑張ればちゃんと評価してもらえる。',
            'プレゼンの仕方は割と身につくかも',
            'スライドとかノート(発表用に机に置ける、そのプレゼンのまとめプリントみたいなもの)を頑張れば点くれる。',
            'プレゼンの評価は厳しいけど普通にいいおばあちゃん。分からんくて聞き返しても教えてくれる。',
          ],
          cons: [
            '評価が厳しい。決められた時間よりも短いプレゼンだと大幅に減点された。',
            '内容を暗記していることや、プレゼンの技法、内容も評価に入るので、適当なプレゼンをすると、落単はしないにしろ低評価になる、私はなった',
            'プレゼンのアイコンタクトやジェスチャーの評価が厳しい。人前で話すのが苦手な人は単位を取りにくいかもしれない。プレゼンが普通にしんどい。',
            'プレゼンの点数の付け方が厳しい時がある、発表時間に30秒ほど足りなかったら結構点数引かれる、原稿見ることができない',
            'プレゼンの評価が厳しい。5段階評価(5が最高)で、アイコンタクトしてたのにずっと1か2だった。',
            '原稿持ち込み不可。',
            'ネイティブすぎて何言ってるか分からん。',
            '授業中急に当てられる。',
          ],
          others: [
            'プレゼン嫌すぎるからかクラス半分以上が集団欠席したときに欠席せずにスピーチしたら評価９割もらえてアツかった。',
            'ジェスチャーやアイコンタクトなどをオーバーめにやってちょっと発表時間長めに喋ったら評価良くなった',
            '友達情報ですが、アイコンタクトはずっとバーバラ先生を見ておけば高得点くれるらしいです。',
          ],
        };
      case 'kanaras-ioanis':
        return {
          name: 'Kanaras Ioanis',
          evaluationCriteria: '出席点あり、プレゼンテーション',
          testPolicy: '記載なし',
          pros: [
            '先生がとにかく優しいところ。',
            'テストが無い 提出物もない 先生優しい面白い プレゼンの準備時間めっちゃくれる 内職してても怒らない プレゼンの評価やさしい',
            '先生がとにかく優しい きちんと出席してプレゼンさえしておけば単位はもらえる',
          ],
          cons: [
            '英語での発表は苦手だったので、少し大変だったこと。',
            'プレゼンが基本の評価対象 スライドも作る',
          ],
          others: [
            '全員がAかAAだった',
          ],
        };
      case 'joseph-mark-mcavoy':
        return {
          name: 'Joseph Mark McAvoy',
          evaluationCriteria: '出席点あり、プレゼンテーション、TOEIC対策のリーディング、リスニング、期末テスト、たまに出る課題',
          testPolicy: 'オンライン',
          pros: [
            '先生が神すぎる。プレゼンは2回しかないし、しかも2人1組でプレゼンできる。プレゼン以外の授業も聞いてるだけでオッケー。',
            '先生がとても優しい、オンラインの期末テストの提出が遅れたのに採点してくれた',
            '先生がすごく優しい。宿題が出ても軽め。',
            'とにかく先生がめっっっちゃ優しい！かっこいい！たまにBritishジョークを言うのが面白い。',
            'プレゼンが2回しかない。他の英語クラスと比べて圧倒的に楽。たまにリスニングと簡単な単語問題の課題がGoogleformででるだけ',
            'プレゼン2回すればいい。1回あたり1人5分。ほとんどみんな成績Aだった。AAはいなかった。',
          ],
          cons: [
            'プレゼンが2回しかないので、1回の配点が大きいかも。 たまに出されるTOEIC対策の課題がちょっと面倒くさい。',
            'プレゼンテーションが重い',
            'たまにリスニングの課題を課されるのがちょっとめんどくさい',
          ],
          others: [
            'イングランド出身の先生なので、アメリカ英語を嫌う。',
          ],
        };
      case 'hudgens-donald-james':
        return {
          name: 'Hudgens Donald James',
          evaluationCriteria: '出席点あり、プレゼンテーション、たまに簡単な課題',
          testPolicy: '自筆ノート',
          pros: [
            '先生が本当にやさしい 4回に１回くらいはオンデマンドだった 授業をほぼせずに話しながらパワポ作ってそれを発表しての繰り返し',
            'この先生は神。みんなだいすき 発表は暗記いらず、まったく怒らない、陽気で楽しい、落単はまずない。',
            '４，５人のグループをつくって三週間ほどかけて1人１～２分程度で分担して作ったパワポを使ったフル英語のプレゼンをする。',
            '先生がいい人だから必然的にクラスの雰囲気が良くなる。 この授業は心配いらずです。おめでとう。',
            'プレゼンはペアでやるが、個人で評価してくれる',
            '分かりやすく、面白い',
          ],
          cons: [],
          others: [
            '真面目にやれば、その点を大変評価してくれる',
          ],
        };
      case 'gabriel-toma':
        return {
          name: 'Gabriel Toma',
          evaluationCriteria: '出席点あり、プレゼンテーション、中間レポート、毎回の課題',
          testPolicy: '記載なし',
          pros: [
            '先生がとにかく優しい。 日本語で全て説明してくれる。 授業は友達と話してるだけで終わる。 欠席は5回したらダメだが、5回しても許されてた。',
            '一回のプレゼン発表のための準備を前期通して行うので、１度レポートを出したり１度プレゼン発表したら終わり。課題提示された翌週は休みになる。',
            'わからなさそうにしていたら日本語で説明してくれる。',
            '英語でレポートを書く方法、プレゼンのコツを学ぶことができる。',
            'めっちゃ優しい こっちが理解できてなさそうやったら日本語で教えてくれる',
          ],
          cons: [
            '先生の英語の発音がアラブ系？で聞き取りづらい。日本語で説明はしてくれるため、授業に支障はないものの、英語力が伸びるかと言われると、それほどではない。',
            'また、プレゼンを最後の方にすると、訳のわからない部分で質問責めにされる。',
            'プレゼン中に質問攻め(多分悪気はない)にあうときがある。',
          ],
          others: [
            'プレゼン発表は出来るだけ早くにした方が良い。',
            '冒頭5分ほど話して、あとは個人で作業という回が多く、対面である必要性をあまり感じなかった。',
            '珍しく本当にシラバス通りの評価方法のため注意。',
            '英語力に自信がなくても全然いける 先生のキャラがかわいい癒し 先生と仲良くなったら喋りかけてくれる',
          ],
        };
      case 'matt-banham':
        return {
          name: 'Matt Banham',
          evaluationCriteria: '出席点あり、毎回の課題、プレゼンテーション',
          testPolicy: '記載なし',
          pros: [
            '英語が聞き取りやすい。手を挙げて答えると加点してくれる。',
            'テストがない 先生が気さく プレゼンテーションの授業だが、その見本を動画や先生自身が解説してくれる',
            '授業中に手を挙げて発言すればボーナス点をくれる',
          ],
          cons: [
            '評価が厳しい。',
            '日本語はほとんど喋れないので、英語を聞き取れなければ何を言ってるかわからない',
            '気さくで優しそうな感じだが、想像以上にプレゼンの評価が厳しいため、日本語が通じないのも相まって何を考えているのか本当にわからない',
            'プレゼン後に行うクイズ大会でボーナス点をくれるが、特に逆転要素もないため、最初に躓くと指をくわえて見るか、他の生徒にダイレクトアタックして解答権を無くすかの二択を迫られる',
          ],
          others: [
            'いつも早く帰りたそうにしている。 生成AIをすごく嫌ってる。',
          ],
        };
      case 'thorson-marcus-isaac':
        return {
          name: 'Thorson Marcus Isaac',
          evaluationCriteria: '出席点あり、中間テスト、毎回の課題、プレゼンテーション、期末レポート、たまに行われる班でのプレゼン',
          testPolicy: '持ち込みなし',
          pros: [
            'ほかのクラスはみんなの前で発表とかを毎回やっていたけど、この先生のクラスでは授業は英語のドラマをみるだけ。しかも結構おもしろい。発表もあるけど、3.4人のグループでするだけだし、先生も全然見ていないので正直余裕。',
            'ドラマを見るだけの授業。ロズウェルというアメリカのドラマを英語音声、日本語字幕で見るため普通に楽しめる。課題もとても軽く、先生も優しい。',
            'プレゼンは台本を見ても大丈夫だし、毎回の課題も日本語字幕付きのSF映画を観てそれの要約をしてくるだけ。自分的には映画の内容もそこそこ面白かった。',
            '課題出しとけば大丈夫。中間テストはいきなり行われるが、点数は多分成績にあまり関係なさそう。',
            '毎回の授業で、恋愛ドラマを1話ずつ見ていく。ドラマ見るだけで単位貰える楽単。ドラマめっちゃ面白くて続き気になるから毎回出席してた。',
            'だいたい1時間くらいで、教授が昼ごはん食べに教室出ていくので、毎回早く授業終わってた。',
            'ドラマを見るだけの最高な授業。洋画ではあるが日本語字幕なため余裕。要約を書かなければいけないがそこまで苦ではない。',
            '本来プレゼンの授業のはずではあるが、3人くらいで適当にやるだけ。マジでカモ。最後だけ先生の前で1人ずつプレゼンをするが余裕',
          ],
          cons: [
            '英語での説明が何言ってるか分からない時が多々あった。',
            '毎回のドラマの要約、問題への回答が少し大変。',
            '字が汚く、日本語も一切話さないため、どんな課題を出されているのか把握するのが難しい。',
          ],
          others: [],
        };
      case 'smith-chloe-abigail':
        return {
          name: 'Smith Chloe Abigail',
          evaluationCriteria: '出席点あり、プレゼンテーション',
          testPolicy: '記載なし',
          pros: [
            '先生優しい',
          ],
          cons: [],
          others: [
            'AAがいない',
          ],
        };
      case 'smith-andrew-william':
        return {
          name: 'Smith Andrew William',
          evaluationCriteria: '出席点あり、プレゼンテーション',
          testPolicy: '記載なし',
          pros: [
            '先生が賑やか。',
          ],
          cons: [
            'プレゼンの資料準備は自費。準備に時間がかなり取られる。',
          ],
          others: [
            'ペア、グループワーク多め。',
          ],
        };
      case 'paraskevi-christidis':
        return {
          name: 'Paraskevi Christidis',
          evaluationCriteria: '毎回の課題',
          testPolicy: '記載なし',
          pros: [
            '拙い英語でも頑張ればしっかり評価してくれる。',
          ],
          cons: [],
          others: [],
        };
      case 'walsh-brian-p':
        return {
          name: 'Walsh Brian P',
          evaluationCriteria: '中間レポート、毎回の課題、プレゼンテーション、出席点あり',
          testPolicy: '記載なし',
          pros: [
            '雰囲気がよい。先生の声掛けに合わせて盛り上がっておくのが大事。プレゼンやレポート課題の直前になるとオンデマンド授業になることがある。',
            'ミニプレゼンが２回あったが、どちらもネタ的な楽しい発表をすればいいので取り組みやすい。',
            'プレゼンが全体で4回程度とその前準備の課題が毎週に0〜1個出されるが全く重たくなく、授業中にやらせてくれる時もある。',
            'プレゼンも毎回見本の文量が少ないのでプレゼン自作も簡単にできる。雰囲気がとても穏やかだしユーモアを持たれてて面白い。かなり辺りだと思う',
            'めっちゃくちゃ楽 最高の授業',
            '先生のノリが良くて面白い。プレゼンは3回あって、プレゼンの準備期間は授業がオンデマンドになったりする。',
          ],
          cons: [
            'やや課題が多い。レポートと課題が自分の専門分野に関わる内容を、引用なども厳密に行って書かなければいけないので難しい。',
            'プレゼンの暗唱、アイコンタクトや身振り手振りなどが結構重要視されてるので苦手な人はちゃんと練習して臨んだ方がいい。',
            'プレゼンは基本1人。みんなの前でするのでかなり緊張する。',
          ],
          others: [
            'UE1B、夏休み付近は2回程度オンデマンドにしてくれた',
            'ブライアンに当たった人はおめでとう',
            '授業では基本英語しか話していませんが、先生は日本語ペラペラですよ。かなり当たりの先生と思っていいはず！！',
          ],
        };
      case 'southorn-dean':
        return {
          name: 'Southorn dean',
          evaluationCriteria: '出席点あり、プレゼンテーション',
          testPolicy: '記載なし',
          pros: [],
          cons: [],
          others: [
            'A、AA はいなかったです。毎回出席して真面目に取り組んでたのに！！ Cでした！！',
          ],
        };
      case 'quinn-ciaran-luke':
        return {
          name: 'Quinn Ciaran Luke',
          evaluationCriteria: '出席点あり、プレゼンテーション',
          testPolicy: '記載なし',
          pros: [
            '先生が優しい。遅刻していた人も叱られていなかった。ゆっくりはっきり話してくれるので聞き取りやすい。プレゼンのあとは褒めてくれる。',
            '出席するだけでいい 先生が割とおもしろい 授業中に内職をしても何も言われない',
          ],
          cons: [
            'たまに何を言ってるのか分からない 1番最後の授業などはとても無駄な時間を過ごすことになる',
          ],
          others: [],
        };
      case 'deepti-mishiro':
        return {
          name: 'DEEPTI 三代',
          evaluationCriteria: 'プレゼンテーション、授業での貢献度、出席点あり',
          testPolicy: '記載なし',
          pros: [
            'にこにこしていれば先生からの印象が良くなる',
            'プレゼンのフィードバックを一人一人���に書いてもらえる。',
            '頑張ればしっかり評価してくれる。課題が少ない。',
          ],
          cons: [
            'プレゼンテーション中に原稿をチラ見した場合、おそらく少し点数が引かれている',
            '先生が意外に点数には厳しい。',
          ],
          others: [
            'プレゼンの準備はしっかりすること。先生は準備をどれだけしてるかで点数をつけています。',
          ],
        };
      case 'iles-lowell-amory-aylmer':
        return {
          name: 'Iles Lowell Amory Aylmer',
          evaluationCriteria: '期末テスト、中間テスト、中間レポート、毎回の課題、プレゼンテーション',
          testPolicy: '持ち込みなし',
          pros: [
            'プレゼンは家で映像を撮って提出することもできるので生徒の前で発表しなくてもいい、教授の性格は良さそう',
          ],
          cons: [
            '後半のレポートが少し重い',
          ],
          others: [],
        };
      case 'valentino-milton':
        return {
          name: 'Valentino Milton Junior Gumbilai',
          evaluationCriteria: '出席点あり、毎回の課題、プレゼンテーション',
          testPolicy: '持ち込みなし',
          pros: [
            'ひたすらグループでプレゼンさせられる 最初ハズレに感じていたが、割と良さそう',
            'メモ見ながらプレゼンできる(見すぎはダメ) 聞いたらきちんと丁寧に教えてくれる',
          ],
          cons: [
            '提出用のプリントを忘れると評価下げられる',
            '成績が相対評価だなら70%はB以下 寝てたら怒られる',
          ],
          others: [
            '電物から数名来ていた（電物で開講予定だったクラスが開講されなかったぽい）',
          ],
        };
      case 'strong-warren':
        return {
          name: 'Strong Warren',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題、プレゼンテーション',
          testPolicy: '持ち込みなし',
          pros: [
            '寝ていても怒られはしない 先生はかなり気さくな方 発音とかはわりと適当でも許される',
            'ブリティッシュな英語を聞かせてくれる。全4回のプレゼンがあり、2人組で後半2回は2人組でプレゼンするので、英語を話す練習には確実になります。',
          ],
          cons: [
            'イギリス英語で聞き取れない',
            '単純にプレゼンがだるい 評価基準がよく分からない',
            '文法とか、単語とかの授業ではなく、プレゼンをするための授業なので、英語云々の前にプレゼンが苦手な人は大変かもしれない。',
          ],
          others: [
            'パソコンやスマホを見ていると注意される',
            'プレゼンの前にPDF配布のcriteriaをよく読んでおいたほうがいい',
            'テストはあったが、簡単だった。プレゼンに力を入れるべき。 先生は別に怖い人ではないです。',
          ],
        };
      case 'mcmahon-jeremy-charles':
        return {
          name: 'Mcmahon Jeremy Charles',
          evaluationCriteria: '出席点あり、プレゼンテーション',
          testPolicy: '記載なし',
          pros: [
            'プレゼンや出席の点数をMoodleに書いてくれるので、自分が今何点取っているか明確。',
          ],
          cons: [],
          others: [],
        };
      case 'scott-brown':
        return {
          name: 'Scott Brown',
          evaluationCriteria: 'プレゼンテーション、出席点あり',
          testPolicy: '記載なし',
          pros: [
            '舐めた態度で授業を受けていなければ大丈夫。成績は皆がAAかAを貰えている気がする。',
            '先生が優しい テストがない 課題がほぼない',
          ],
          cons: [],
          others: [
            '小テストをすると予告されたが、当日に先生から「君達のプレゼンは素晴らしかったから小テストを実施するまでもないよ」と英語で言われ、小テストはないこととなった。',
          ],
        };
      case 'lau-betty':
        return {
          name: 'Lau Betty',
          evaluationCriteria: 'プレゼンテーション、出席点あり',
          testPolicy: '記載なし',
          pros: [
            'プレゼンをするときのポイントについてはかなり細かく教えてもらえる。',
            '人前に出て発表する際に緊張することはなくなる プレゼンは台本読みながらでもOK 先生がかなり日本語を喋ってくれる 質問も日本語での対応OK',
            '"チャレンジ精神"的な部分が評価されるよう',
          ],
          cons: [
            'かなり評価が厳しい。',
            'プレゼンの資料をスケッチブックに手書きで用意しなければならず、かなり負担（ほとんどのクラスはPowerPointで資料を用意しているのに）。',
            'また、グループで発表するクラスが多い中、個人発表のため、一人ですべてを用意になければいけないため、やや面倒くさい。',
            '１人４回のプレゼン、しかも何故かスケッチブックを使わないといけない。Powerpointはダメ。 スケッチブックがプレゼンの原点だかららしい。私にはよく分からない。',
            '教科書の内容以上にジェスチャーや声の抑揚などを求めてくる。 毎回の課題は出ないが、授業を受けるだけで神経すり減る。',
            'プレゼン指導に限れば大学で一番熱心(厳しい)と思う。',
          ],
          others: [
            '最後のプレゼンを欠席すると、単位をとることはほぼ無理。',
            '試験前に一度休講を挟んでくれた。 ちゃんと学生のことを考えてくれているのは確か。',
          ],
        };
      case 'maxton-anupama-esther':
        return {
          name: 'Maxton Anupama Esther',
          evaluationCriteria: '出席点あり、プレゼンテーション',
          testPolicy: '記載なし',
          pros: [
            '特に課題は無い、初めの方のプレゼンでは、カンペを結構読んでもある程度点数が貰える',
            '最後のオンデマンドの際に出るクイズ(簡単)を真面目にやればプレゼンの評価が悪くても単位が貰える',
            'ゆっくり英語喋ってくれる。',
          ],
          cons: [
            '最後の方のプレゼンでカンペを読むと怒られる、遅刻・欠席に厳しい',
            'プレゼンのルールや採点基準も厳しい。機嫌によって怖い。',
          ],
          others: [],
        };
      case 'thornton-matthew-aaron':
        return {
          name: 'Thronton Matthew Aaron',
          evaluationCriteria: '出席点あり、毎回の課題、プレゼンテーション',
          testPolicy: '記載なし',
          pros: [
            'スピーチ原稿の作り方や発表の仕方を学べる。発表は最後の1度だけ。',
          ],
          cons: [
            '出席がシビア',
          ],
          others: [
            'AIを使うと落単だと脅される。しかしAIを駆使してBを頂いたので下手な使い方をしなければ大丈夫。',
          ],
        };
      case 'swnson-tamara-ann':
        return {
          name: 'Swenson Tamara Ann',
          evaluationCriteria: '出席点あり、期末テスト、プレゼンテーション',
          testPolicy: '教科書',
          pros: [
            '先生が優しく面白い',
            '全4回の発表さえすれば単位はくれる',
          ],
          cons: [
            '全て英語で指示されるため友人と情報確認をする必要がありそう',
            '発表準備を少し面倒くさい',
          ],
          others: [
            '休日はメールをチェックしないらしい',
          ],
        };
      case 'ruder-trevor-lane':
        return {
          name: 'Ruder Trevor Lane',
          evaluationCriteria: '出席点あり、期末テスト、毎回の課題',
          testPolicy: '持ち込みなし',
          pros: [
            '最後4回ぐらい先生が病気でレポート課題になった。',
          ],
          cons: [
            '宿題忘れ、居眠りとかで減点される。日本語使わず英語を使うように指示される。',
            '授業内で文章を書く課題があるがスマホは使用できない。先生が用意した紙の辞書1冊はあるが他の人が使っていると使えないので、電子辞書を持ってる人は持って行った方がいい。',
          ],
          others: [
            '先生の病気のため期末テストは遠隔になったが簡単。成績は半分ぐらいの人がAAだった。',
          ],
        };
      case 'euan-macdougall':
        return {
          name: 'Euan Macdougall',
          evaluationCriteria: '出席点あり、毎回の課題、プレゼンテーション、期末テスト',
          testPolicy: 'パソコン上で簡単な問題の解答',
          pros: [
            '急に切れてくる理不尽を学べる。',
            'プレゼンはしっかり喋ったら大丈夫だった',
            'プレゼンさえ出来れば基本何とかなる',
          ],
          cons: [
            'すぐ切れるが、英語なのでよくわからない。当日の朝9時に休講メールを送ってきたことがあった。',
            '合計で7回も休講になった。最後のプレゼン2回を含めると、6回しか授業がない',
            '席は前につめてないと怒られる',
            '雰囲気が怖いかも',
            '出席と宿題やってるかのチェックはしっかりしてくる',
            '1限なので眠くて先生の指示に遅れることが多いとたまにキレる',
          ],
          others: [],
        };
      case 'felnandes-elizabeth':
        return {
          name: 'Fernandes Elisabeth Marieantao',
          evaluationCriteria: '出席点あり、毎回の課題、プレゼンテーション',
          testPolicy: '持ち込みなし',
          pros: [],
          cons: [
            '先生すぐキレる、こわい、理不尽 課題だるい プレゼンテーションをやる順番が遅くなるほど評価が辛くなる',
          ],
          others: [
            '喋り方うっとおしい',
          ],
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
          { label: '外国語科目(英語必修)-英語教師一覧', href: '/instructors/english-native' },
          { label: `${instructor.name}先生` },
        ]} />

        <div className="space-y-4 md:space-y-6">
          {/* 教員名 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-8">
            <h1 className="mb-2 text-xl md:text-3xl">{instructor.name}先生</h1>
            <p className="text-gray-600 text-sm md:text-base">外国語科目(英語必修)</p>
          </div>

          {/* 評価基準とテスト持ち込み */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
              <h3 className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3">評価基準</h3>
              <p className="text-gray-700 text-sm md:text-base">{instructor.evaluationCriteria}</p>
            </div>

            {instructor.testPolicy && (
              <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6">
                <h3 className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3">テスト持ち込み</h3>
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