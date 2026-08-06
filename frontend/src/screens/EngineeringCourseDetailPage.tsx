import { CheckCircle, XCircle, Info } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Breadcrumb } from '../components/Breadcrumb';

interface EngineeringCourseDetailPageProps {
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

export function EngineeringCourseDetailPage({ courseId = 'communication-systems-yamada', isAuthenticated = false }: EngineeringCourseDetailPageProps) {
  const getCourseData = (id: string): CourseData => {
    const courses: Record<string, CourseData> = {
      'communication-systems-yamada': {
        name: '通信システム',
        instructor: '山田',
        evaluationCriteria: '出席点あり, 期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '特になし',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '内容は難しいが、過去問とほぼ同じそろそろ先生が退職するので変わるかもしれない',
        ],
      },
      'mechanical-dynamics1-kawai': {
        name: '機械力学1',
        instructor: '川合',
        evaluationCriteria: '期末テスト, 中間レポート, プレゼンテーション',
        allowedMaterials: '持ち込みなし',
        pros: [
          'テストの問題は課題からしか出ない。課題は難しいのでちゃんと解いた方がいい',
        ],
        cons: [
          '今年は40人落単した',
        ],
        others: [
          '特になし',
        ],
      },
      'polymer-chemistry2-harada': {
        name: '高分子化学2',
        instructor: '原田',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '全体的に説明がわかりやすい。',
          '「高分子化学1」ができなくても一応内容がわかるようになっている。',
        ],
        cons: [
          'なぜか終盤になるにつれて課題が難しくなる。',
          '定期試験がやや難しめ。',
        ],
        others: [
          '特になし',
        ],
      },
      'urban-planning1-kana': {
        name: '都市計画1',
        instructor: '嘉名',
        evaluationCriteria: '期末レポート, 中間レポート, 毎回の課題, 出席点あり',
        allowedMaterials: '持ち込みなし',
        pros: [
          'レポートのみの講義。',
          '毎回の課題をやってレポートを出せば単位は取れる。授業はあまり聞いてなくて大丈夫です。',
        ],
        cons: [
          '遅刻とか欠席とかがめんどくさい。毎回のレポートがめっちゃ分量あるし、なぜか水曜日締め切りでややこしい。ピしないといけない。',
          'レジュメがあまりしっかりしていない',
        ],
        others: [
          '1回だけ、今回の講義の内容をまとめなさいという課題があったので、授業前にmoodleでその日の課題を確認する習慣はつけておいた方がいいかも',
        ],
      },
      'control-engineering1-hara': {
        name: '制御工学1',
        instructor: '原',
        evaluationCriteria: '出席点あり, 期末テスト, 中間レポート',
        allowedMaterials: '持ち込みなし',
        pros: [
          'スライドは要点が整理されていてわかりやすい',
        ],
        cons: [
          '特になし',
        ],
        others: [
          'テスト勉強が大変',
        ],
      },
      'physical-chemistry1a-inoue-higuchi': {
        name: '物理化学ⅠA',
        instructor: '井上 / 樋口',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '小テストを3回してくれるので、期末試験の範囲が狭い普通に授業はわかりやすい問題演習も多くてよい',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '過去問は通用しないが、復習プリントと問題プリントをやっていれば試験は解ける授業スライドの写真をとると点数が引かれる(当たり前ではある),',
        ],
      },
      'urban-environmental-studies-komaki-mizutani-endo': {
        name: '都市環境学',
        instructor: '小牧 / 水谷 / 遠藤',
        evaluationCriteria: '出席点あり, 期末テスト, 課題レポート, 中間レポート, 期末レポート',
        allowedMaterials: '持ち込みなし',
        pros: [
          'おもしろい。外部から講師が来られる授業が2回ある。',
          '講義聞いて感想聞くレポート40%あるのでそこさえ出席して提出すればいける。',
          'レポート40%なのでテストを最低限勉強すれば単位は取れる',
        ],
        cons: [
          'テストの範囲が教科書まるまる一冊。毎回手書きで講義のメモを書かされ，その提出で出席代わりにされるがどの程度評価に入っているかは不明。',
          '1つレポートが外部の人の講義の感想を書くものだったので、その日休んでしまうと20点消えます。(初回で告知あり)',
        ],
        others: [
          'レポート出すの遅れたらメールしてないと怒られる。エアコン切ってなかったらキレられる。教科書よりレジュメ見た方がいい！！！',
        ],
      },
      'electrical-system-experiment1-sugitani': {
        name: '電気電子システム工学実験1',
        instructor: '杉谷',
        evaluationCriteria: '出席点あり, 毎回の課題',
        allowedMaterials: '(記載なし)',
        pros: [
          '2年の実験ほど遅くならない',
        ],
        cons: [
          '毎週レポートと予習が必要',
        ],
        others: [
          '特になし',
        ],
      },
      'urban-studies-intro-endo-yonezawa': {
        name: '都市学入門',
        instructor: '遠藤 / 米澤',
        evaluationCriteria: '出席点あり, プレゼンテーション',
        allowedMaterials: '(記載なし)',
        pros: [
          '座っているだけで単位が取れる',
        ],
        cons: [
          '特になし',
        ],
        others: [
          'プレゼンは3分程度',
        ],
      },
      'aerospace-experiment-mori': {
        name: '航空宇宙工学実験',
        instructor: '森',
        evaluationCriteria: '毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '沢山レポート課題があること',
        ],
        cons: [
          '毎年、過年度生が1割発生する',
        ],
        others: [
          '過年度生だらけ',
        ],
      },
      'bio-organic-chemistry-higashi': {
        name: '生物有機化学',
        instructor: '東',
        evaluationCriteria: '出席点あり, 期末テスト, 中間テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          'フォームで出席提出のため、代行可能、優しい',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '2年前の過去問を出していた。テストの一週間前の授業は1年前の問題を配られる。内容は難しいが、過去問ゲーでした。',
        ],
      },
      'engineering-ethics-nomura': {
        name: '工学倫理',
        instructor: '野村',
        evaluationCriteria: '出席点あり, 毎回の課題',
        allowedMaterials: '(記載なし)',
        pros: [
          '全部オンライン。動画を見て課題を出すだけ。',
        ],
        cons: [
          'なぜか終盤になるにつれて課題が難しくなる。',
          '視聴記録がとられるので動画はちゃんと再生しないといけない。',
        ],
        others: [
          '特になし',
        ],
      },
      'engineering-ethics-omnibus-nomura': {
        name: '工学倫理',
        instructor: 'オムニバス / 野村',
        evaluationCriteria: '出席点あり, 毎回の課題, 中間レポート',
        allowedMaterials: '(記載なし)',
        pros: [
          '全部オンデマンド',
          '単位が取りやすい',
        ],
        cons: [
          '2000字のレポートを1週間で仕上げないといけない回があった。',
        ],
        others: [
          '金曜5限とは書かれているが、オンラインなので時間は関係ない',
        ],
      },
      'material-physical-chemistry-basics-ono': {
        name: '材料物理化学基礎',
        instructor: '大野',
        evaluationCriteria: '出席点あり, 期末テスト, 中間テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '最初に宿題の解説をしてくれる。',
        ],
        cons: [
          '正直内容はよくわからないのに、計算方法だけがわかってしまう。',
        ],
        others: [
          '特になし',
        ],
      },
      'mechanical-material-mechanics1-yamasaki': {
        name: '機械材料力学1',
        instructor: '山崎',
        evaluationCriteria: '期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '説明がわかりやすい。板書を写していたら大体は理解できる。',
          '授業がわかりやすい板書を理解していれはテストは解ける',
        ],
        cons: [
          '板書が多い。板書をスマホで撮影すると怒られる。',
          '期末100％で3テストは大問3つしかないのでミスったら終わる今年はテストは簡単だったがなぜか48人落単した',
        ],
        others: [
          'テストは3題しか出なかった。',
        ],
      },
      'optical-information-engineering-miyazaki': {
        name: '光情報工学',
        instructor: '宮崎',
        evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題',
        allowedMaterials: '自筆ノート',
        pros: [
          '特になし',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '演習問題を練習しておけば落単は回避できる',
        ],
      },
      'electrical-system-basic-experiment-tsujioka-hara-morita': {
        name: '電気電子システム工学基礎実験',
        instructor: '辻岡 / 原 / 森田',
        evaluationCriteria: '出席点あり, 毎回の課題',
        allowedMaterials: '(記載なし)',
        pros: [
          '６種類の実験を通して、回路を用いた機器について仕組みを学べる。レポート作成力が身につく。',
        ],
        cons: [
          '特になし。',
        ],
        others: [
          '特になし',
        ],
      },
      'elementary-crystallography-kimura': {
        name: '初頭結晶学',
        instructor: '木村',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '結晶構造を自分で解析できるツールを使える。',
        ],
        cons: [
          '毎回の課題が翌日の24時までに提出で、意外とキツイ。中間テストに比べて期末テストがかなり難しい。',
        ],
        others: [
          '特になし',
        ],
      },
      'programming-practice-chujo-kakegake': {
        name: 'プログラミング演習',
        instructor: '中條 / 角掛',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: 'レジュメと自分がやった課題だけ閲覧可',
        pros: [
          '出席点ない。',
        ],
        cons: [
          '毎回課題ある。難しめ。テストも難しめ。AIにやらせたら文句言われる。テストの点が悪かったとかでお気持ちメールくる。これで1単位かよってなる。',
        ],
        others: [
          '特になし',
        ],
      },
      'basic-fluid-mechanics-shigematsu': {
        name: '基礎流体力学',
        instructor: '重松',
        evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題, 毎回の事後学習（アンケート）',
        allowedMaterials: '持ち込みなし',
        pros: [
          'ちゃんと聞いていれば授業内容はわかりやすいと思う。レジュメの内容を完璧にすればテストは解ける。',
        ],
        cons: [
          'レジュメが穴埋めのままmoodleで配布、授業中で穴埋めするしかない。毎回の課題で答えを教えない。全員の課題の回答をPDFで公開して学習しろみたいな形。テストも過去問通り出ないです。',
          '毎回課題があるくせに難しい。アンケートでわからなかったところと授業内でやったことの身近な例を書かされ、次回の授業で教授の返答があるが、「何を言いたいのかわかりません」「？？？」「授業内で説明しました」しか言われずやる気無くす。教授の性格が悪く、期末テスト難しかったと言ってる人を見てニヤニヤしてた。過去問と全く違う出題範囲なので要注意。一つも被らなかった。',
        ],
        others: [
          '2025年度 単位取得率59%ほどです。本気でやらないと無理です。',
          '毎回のレポート20%アンケート20%期末テスト20%',
        ],
      },
      'inorganic-chemistry-intro-hayashi-tokudome': {
        name: '無機化学序論',
        instructor: '林 / 徳留',
        evaluationCriteria: '期末テスト, 毎回の課題, 出席点あり, 中間テスト, 授業中に課題を出され、それに回答すると出席扱いになる',
        allowedMaterials: '持ち込みなし',
        pros: [
          'それなりに分かりやすい 授業資料が見やすい 総合演習があるので勉強しやすい',
          '中間テストがボロボロでも期末テストが合格点を越えていたら単位はくれる。',
        ],
        cons: [
          '期末テストしかないので出題範囲が広い',
          '抽象的な話が多く、普通に難しい。',
        ],
        others: [
          '総合演習は過去問が出回っていて、全く同じ問題がでる 休んでも資料はもらえる',
        ],
      },
      'inorganic-materials-chemistry-sakuta': {
        name: '無機材料化学',
        instructor: '作田',
        evaluationCriteria: '出席点あり, 期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '定期試験に出る問題がわかりやすい。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          'よほど勉強をサボらない限りはまず落単しない。',
        ],
      },
      'electrical-measurement-sanada': {
        name: '電気電子計測',
        instructor: '真田',
        evaluationCriteria: '出席点あり, 期末テスト, 中間レポート',
        allowedMaterials: 'レジュメ, 自筆ノート, 教科書',
        pros: [
          '授業の説明が分かりやすい。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '特になし',
        ],
      },
      'analytical-chemistry-a-hisamoto': {
        name: '分析化学A',
        instructor: '久本',
        evaluationCriteria: '出席点あり, 期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '特になし,',
        ],
        cons: [
          '特になし,',
        ],
        others: [
          '前半の講義はあまり面白くない',
          'A4用紙手書き資料の持ち込みの中間まとめがあるが、シラバスの評価に記載されてないので評価に入るか謎',
          '授業はちょっと難しいが期末テストはそんなに難しくなかった',
        ],
      },
      'practical-biochemical-engineering-igarashi': {
        name: '実践生物化学工学',
        instructor: '五十嵐',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題, 出席点あり',
        allowedMaterials: 'レジュメ',
        pros: [
          '授業中に課題の答えを教えてくれる。テストもどういうのを出すか教えてくれる。',
          '頑張れば取れるところ。',
        ],
        cons: [
          'プログラムが難しい。だが、調べるかaiを使えばなんとかなる。',
          'プログラミング系のため苦手な人は苦手',
        ],
        others: [
          '落とす人もいたが、授業を理解していれば落とす心配は無い。授業を聞く必要はあまりない印象',
        ],
      },
      'organic-chemistry1a-yagi-maeda': {
        name: '有機化学1A',
        instructor: '八木 / 前田',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '授業がわかりやすい。前半の先生は話が上手いので、わかった気になるので復習はちゃんとしよう。小テストを3回やってくれるので、期末試験の範囲が狭い。',
        ],
        cons: [
          '後半の先生の講義資料が絶望的に見づらい。授業受けるのに支障があるレベル。モノクロな上に印刷が薄く、用紙も大きいため取り扱いづらい。講義資料がPDFで取得できるので、自分でカラー印刷するのがおすすめ。4アップで印刷するとよい。',
        ],
        others: [
          '小テストと期末試験は毎回の課題を解けるようにして教科書の問題もできれば解ける',
        ],
      },
      'perceptual-information-processing-iwamura': {
        name: '知覚情報処理',
        instructor: '岩村',
        evaluationCriteria: '期末テスト, 中間レポート, 毎回の課題',
        allowedMaterials: 'A4プリント1枚',
        pros: [
          '説明が上手い 授業内容が純粋に面白い 生徒に寄り添ってくれる評価方法を採用している(期末100% or 課題40%+期末60%の高いほう)',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '特になし',
        ],
      },
      'electromagnetics1b-kubota': {
        name: '電磁気学1B',
        instructor: '久保田',
        evaluationCriteria: '期末テスト, 毎回の課題',
        allowedMaterials: '前もって配られるプリントに書き込んでその1枚のみ',
        pros: [
          '講義資料が分かりやすい。',
        ],
        cons: [
          '特になし。',
        ],
        others: [
          '特になし',
        ],
      },
      'electrical-circuit-theory-shirafuji': {
        name: '電気回路学',
        instructor: '白藤',
        evaluationCriteria: '期末テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '授業内容が分かりやすい。簡単なところから入ってくれるから、内容をつかみやすい。',
        ],
        cons: [
          '毎週の課題が１週間で完全に締めきられてしまうところ。',
        ],
        others: [
          '個人的には授業の本質ではないTipsみたいなところが面白かったです。',
          '普通に課題を出していればテスト悪くても通ります。課題出してなかったらテスト勉強めちゃがんばりましょう。それでも単位はあるでしょう。',
        ],
      },
      'career-design-engineers-nomura': {
        name: 'エンジニアのためのキャリアデザイン',
        instructor: '野村',
        evaluationCriteria: '出席点あり, 毎回の課題',
        allowedMaterials: '(記載なし)',
        pros: [
          '社会人の方の話が聞ける 単位が取りやすい',
        ],
        cons: [
          'レポートが毎回あって疲れる',
        ],
        others: [
          '履修登録は早めにしておかないと、人数の面で受けられなくなる',
        ],
      },
      'organometallic-chemistry-ikeda': {
        name: '有機金属化学',
        instructor: '池田',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '毎回の課題があるので試験対策がやりやすい。',
        ],
        cons: [
          '基本的に板書なので授業に出ないとノートがとれない。',
        ],
        others: [
          '特になし',
        ],
      },
      'structural-analysis-practice-matsui': {
        name: '構造解析演習',
        instructor: '松井',
        evaluationCriteria: '期末テスト, 小テスト (全10回)',
        allowedMaterials: '自筆のプリント (A4裏表1枚)',
        pros: [
          '個人差はあるがシンプルに内容が面白い。,',
        ],
        cons: [
          '授業内演習が成績に占める割合が高い。',
          'すなわち欠席が落単に直結する。',
        ],
        others: [
          '定期試験は持ち込みができる。',
        ],
      },
      'material-design-control-takigawa': {
        name: '材料設計・制御',
        instructor: '瀧川',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '自筆ノート',
        pros: [
          '特になし',
        ],
        cons: [
          '定期試験の持ち込みが手書きのノートだけなので、内容をまとめるのが大変。',
        ],
        others: [
          '授業内課題はオンラインか手書きのどちらか。',
        ],
      },
      'physical-chemistry-practice2-horiuchi': {
        name: '物理化学演習2',
        instructor: '堀内',
        evaluationCriteria: '期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '「物理化学演習1」よりも予習課題が楽。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '特になし',
        ],
      },
      'applied-chemistry-experiment2-endo': {
        name: '応用化学実験2',
        instructor: '遠藤',
        evaluationCriteria: '毎回の課題',
        allowedMaterials: '(記載なし)',
        pros: [
          '特になし',
        ],
        cons: [
          '実験が20個あるのでシンプルにしんどい。',
        ],
        others: [
          'レポートを全て提出すれば落単は基本的にはない。',
        ],
      },
      'environmental-chemistry-sadanaga': {
        name: '環境化学',
        instructor: '定永',
        evaluationCriteria: '中間テスト, 期末レポート',
        allowedMaterials: '持ち込みなし',
        pros: [
          '途中からオンラインになる。',
        ],
        cons: [
          '期末レポートがかなり難しい（個人差）。',
        ],
        others: [
          '特になし',
        ],
      },
      'organic-chemistry-practice2-kodama': {
        name: '有機化学演習2',
        instructor: '小玉',
        evaluationCriteria: '出席点あり, 期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '特になし',
        ],
        cons: [
          '授業スピードがすごく速い。',
        ],
        others: [
          '特になし',
        ],
      },
      'career-design-management-nomura': {
        name: 'エンジニアのためのキャリアデザイン／経営論',
        instructor: '野村',
        evaluationCriteria: '出席点あり, 毎回の課題',
        allowedMaterials: '(記載なし)',
        pros: [
          'いろいろな人のキャリアにおけるお話を聞ける。',
        ],
        cons: [
          '回によっては課題が面倒くさいこともある。',
        ],
        others: [
          '特になし',
        ],
      },
      'electrical-circuit-practice-tanaka': {
        name: '電気回路学演習',
        instructor: '田中',
        evaluationCriteria: '毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          'テストが無いので、毎回の課題さえきちんと出していれば単位は間違いないところ。',
        ],
        cons: [
          '課題が出されるのが月曜の４限終わりなのにも関わらず、火曜の朝２時が提出の締切期限であること。',
        ],
        others: [
          '課題は特に後半になるにつれ多くなって時間もかかるので、この授業を受ける人は月曜日の夜に絶対にバイトや予定を入れない方が良いです。,',
          '課題は適宜手を抜きながら気楽にやりましょう。,',
        ],
      },
      'molecular-biology-nakanishi': {
        name: '分子生物学',
        instructor: '中西',
        evaluationCriteria: '出席点あり, 期末テスト, 中間テスト',
        allowedMaterials: 'レジュメ, 中間テストのみ持ち込み可能',
        pros: [
          '中間が持ち込み可能だった。期末はダメ、平均点は両方高い。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          'テストは時間がきついだけで、だいたいできる。',
        ],
      },
      'drafting-design-practice-takagi-yusa': {
        name: '製図設計演習',
        instructor: '高木 / 遊佐',
        evaluationCriteria: '出席点あり, 毎回の課題',
        allowedMaterials: '(記載なし)',
        pros: [
          '課題全部出せば単位ある。',
        ],
        cons: [
          'こんなに課題やって1単位かよと思う。製図設計の道具が高い。先輩にもらえそうならもらうべき。',
        ],
        others: [
          '模型を作る課題があり、持って帰ったら持ってきたりしないといけない。A3のケント紙持ってくるのがだるい。',
        ],
      },
      'aerospace-basics1-faculty': {
        name: '航空宇宙工学基礎1',
        instructor: '航空宇宙工学科所属の先生方',
        evaluationCriteria: '出席点あり, 毎回の課題',
        allowedMaterials: 'なし',
        pros: [
          '出席してレポート課題を提出しさえすれば単位を得られる。研究室選びの一助となる。',
        ],
        cons: [
          '内容が難しく、一方的に紹介されるだけであるため、退屈に感じられることもある。',
        ],
        others: [
          '特になし',
        ],
      },
      'computer-system-takubo': {
        name: 'コンピュータシステム',
        instructor: '田窪',
        evaluationCriteria: '出席点あり, 期末テスト, 小テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '先生が過去問の解説してくれる',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '専門の中では楽単だと思う',
        ],
      },
      'mechanical-fluid-mechanics1-wakimoto-omori': {
        name: '機械流体力学1',
        instructor: '脇本 / 大森',
        evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '前半後半で教員が違う。期末テスト内容はそれぞれ半々。前半の脇本先生は毎回の課題あり、テストが課題から出るのでそれを解けばOK。後半の大森先生は毎回の課題なし、授業が難しい、板書と授業内演習問題からテストに出るのでそれを復習すればOK。',
        ],
        cons: [
          '今年は43人落単した',
        ],
        others: [
          '特になし',
        ],
      },
      'urban-engineering-science-basics-kakegake-yamada-chujo': {
        name: '都市工学のための科学基礎',
        instructor: '角掛 / 山田 / 中條',
        evaluationCriteria: '期末テスト, 毎回の課題',
        allowedMaterials: '3科目のテストがあり、科目担当によって持ち込み可否は変わる。',
        pros: [
          '構造力学→授業出てレポート解けてればテストは簡単。',
          '土質力学→今期だけなのかわからないがテストがなく、レポート二つだけだった。',
          '水理学→テストが持ち込み可。テストは水理学の紺色と白の教科書とレポートから何問かそのまま出る。',
        ],
        cons: [
          '構造力学→教授めんどくさい。毎回レポート出る。',
          '土質力学→もしテストあったらやばかったと思う。レジュメの量が莫大。記述式っぽい。',
          '水理学→出席とられる。毎回授業内の課題と次までに出すレポートがある。当てられて前で解かされる。レポート若干むずい。',
        ],
        others: [
          '特になし',
        ],
      },
      'electronic-physical-engineering-intro1-omnibus': {
        name: '電子物理工学概論1',
        instructor: 'オムニバス',
        evaluationCriteria: '毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '楽なレポート多め',
        ],
        cons: [
          '特になし',
        ],
        others: [
          'ぴ逃げするときはmoodleにあるスライドを見て課題を確認してからにすること',
        ],
      },
      'biotechnology-intro-tachibana': {
        name: 'バイオテクノロジー概論',
        instructor: '立花',
        evaluationCriteria: '出席点あり, 期末テスト',
        allowedMaterials: '持ち込みなし',
        pros: [
          '話がおもしろい。',
          'テストの難易度も易しく、単位取りやすい',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '特になし',
        ],
      },
      'electrical-circuit1-sanada': {
        name: '電気回路1',
        instructor: '真田',
        evaluationCriteria: '出席点あり, 期末テスト, 中間レポート',
        allowedMaterials: '持ち込みなし',
        pros: [
          '授業が分かりやすい。テストも授業内容を理解すれば解けるものにしてくれている。',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '特になし',
        ],
      },
      'information-theory-b-shu': {
        name: '情報理論B',
        instructor: '周',
        evaluationCriteria: '出席点あり, 期末テスト, 期末レポート, 中間レポート',
        allowedMaterials: 'レジュメ, 自筆ノート, 教科書',
        pros: [
          '授業がわかりやすい',
        ],
        cons: [
          'あまり授業で触れられていなかった問題がテストに出た',
        ],
        others: [
          '良い成績をとるには課題を頑張ったほうがいい',
        ],
      },
      'urban-engineering-mechanics-basics-kakegake-yamada-chujo': {
        name: '都市工学のための力学基礎',
        instructor: '角掛 / 山田 / 中條',
        evaluationCriteria: '出席点あり, 期末テスト, 中間テスト, 毎回の課題',
        allowedMaterials: '構造力学、土質力学、水理学のそれぞれのテストで持ち込みの有無が異なる',
        pros: [
          '特になし',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '教科書はとりあえず構造力学パートは必要',
        ],
      },
      'system-optimization-morisawa': {
        name: 'システム最適化',
        instructor: '森澤',
        evaluationCriteria: '出席点あり, 期末テスト, 期末レポート, 毎回の課題',
        allowedMaterials: '持ち込みなし',
        pros: [
          '授業がわかりやすい',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '持ち込みなしなので覚えないといけない内容が多い,',
        ],
      },
      'power-engineering-ishigame': {
        name: '電力工学',
        instructor: '石亀',
        evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題, プレゼンテーション',
        allowedMaterials: '持ち込みなし',
        pros: [
          '授業がわかりやすい 過去問の解説をしてくれる',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '過去問は早めにやっておかないと、他の勉強もあるので余裕がなくなる',
        ],
      },
      'mechanical-thermodynamics1-segawa': {
        name: '機械熱力学1',
        instructor: '瀬川',
        evaluationCriteria: '出席点あり, 期末テスト',
        allowedMaterials: '教科書',
        pros: [
          '2025年前期から教科書持ち込み可になったので授業スライドを書き込んでそれを持ち込める',
        ],
        cons: [
          '出席には厳しい 期末テスト100％で大問3問構成なのでミスったら終わる 今年は30人落単した',
        ],
        others: [
          '特になし',
        ],
      },
      'physical-chemistry2a-shiigi': {
        name: '物理化学2A',
        instructor: '椎木',
        evaluationCriteria: '期末テスト, 中間テスト, 小テスト (前半のみ)',
        allowedMaterials: '持ち込みなし',
        pros: [
          'テスト範囲はわかりやすい。',
        ],
        cons: [
          '前半は授業のはじめに小テストがある。',
          '後半は板書が見づらい。',
        ],
        others: [
          '特になし',
        ],
      },
      'discrete-mathematics-uno': {
        name: '離散数学',
        instructor: '宇野',
        evaluationCriteria: '期末テスト, 中間テスト(参加だけすればいい)',
        allowedMaterials: 'A4プリント1枚 書き込みあり',
        pros: [
          '特になし',
        ],
        cons: [
          'テストがムズい',
        ],
        others: [
          '特になし',
        ],
      },
      'electromagnetic-wave-engineering-kubota': {
        name: '電磁波工学',
        instructor: '久保田',
        evaluationCriteria: '出席点あり, 期末テスト, 毎回の課題',
        allowedMaterials: '自筆ノート',
        pros: [
          '特になし',
        ],
        cons: [
          'スライドが多すぎる',
        ],
        others: [
          '勉強すればなんとかなる',
        ],
      },
      'electrical-machinery-inoue': {
        name: '電気機器工学',
        instructor: '井上',
        evaluationCriteria: '出席点あり, 期末テスト, 中間レポート',
        allowedMaterials: '持ち込みなし',
        pros: [
          '授業がわかりやすい 課題の解説がある',
        ],
        cons: [
          '特になし',
        ],
        others: [
          '回路と式を覚えておかないとテストがきつい',
        ],
      },
    };

    return courses[id] || courses['communication-systems-yamada'];
  };

  const courseData = getCourseData(courseId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header isAuthenticated={isAuthenticated} />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <Breadcrumb items={[
          { label: 'トップ', href: '/' },
          { label: '工学部科目一覧', href: '/courses/specialized/engineering' },
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
      </main>

      <Footer />
    </div>
  );
}
