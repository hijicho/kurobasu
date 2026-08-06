'use client'

import { X } from 'lucide-react'

interface GlossaryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function GlossaryModal({ isOpen, onClose }: GlossaryModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg">大学用語</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <h3 className="mb-2">般教（一般教養科目）</h3>
            <p className="text-gray-600 text-sm">
              専門分野に関わらず、幅広い教養を身につけるための科目です。人文科学、社会科学、自然科学など多様な分野から選択できます。今の正式名称は総合教養科目。
主に1年生と2年生が受講する。
            </p>
          </div>
          <div>
            <h3 className="mb-2">コミュカ</h3>
            <p className="text-gray-600 text-sm">
              コミュニケーションカードの略。出席カードとも言われる。出席確認のため、毎授業終わりに感想や質問を書くもの。これがある授業はピ逃げ不可。
            </p>
          </div>
          <div>
            <h3 className="mb-2">レジュメ</h3>
            <p className="text-gray-600 text-sm">
              授業資料のこと。紙で配布、moodle上で配布、配布されないの3通りに分かれる。
            </p>
          </div>
          <div>
            <h3 className="mb-2">GPA</h3>
            <p className="text-gray-600 text-sm">
              Grade Point Averageの略。成績を数値で評価する基準のこと。0～4があり、高いほど成績が良い。0は落単。
            </p>
          </div>
          <div>
            <h3 className="mb-2">CAP制</h3>
            <p className="text-gray-600 text-sm">
              1学期に履修登録できる単位数の上限を定める制度です。学生が過度な履修登録を避け、質の高い学習を行えるようにするための仕組みです。
            </p>
          </div>
          <div>
            <h3 className="mb-2">楽単（らくたん）</h3>
            <p className="text-gray-600 text-sm">
              簡単に単位を取得できる科目を指す俗語です。ただし、学びの質も重要です。単位は簡単に言うと成績のことなので、こだわりがないなら楽単を取るべき。
          　</p>
          </div>
          <div>
            <h3 className="mb-2">オムニバス</h3>
            <p className="text-gray-600 text-sm">
              複数人の先生が回ごとに交代して行う授業のこと。オムニバス形式の授業という形で使われる。楽単が多い。
            </p>
          </div>
          <div>
            <h3 className="mb-2">moodle</h3>
            <p className="text-gray-600 text-sm">
              授業で用いられるサイトの一つ。授業資料やテストの概要等が掲載される。提出物もmoodle上で出すものが多いので、要注意。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
