export type ContinuityTypeKey = 'A' | 'B' | 'C' | 'D';

export interface ContinuityType {
  key: ContinuityTypeKey;
  name: string;
  emoji: string;
  description: string;
  strength: string;
}

export const continuityTypes: Record<ContinuityTypeKey, ContinuityType> = {
  A: { key: 'A', name: '積み上げ設計士', emoji: '📐', description: 'ステップごとの積み上げが得意。崩れた日も失敗にせず、再開しやすい計画が力になります。', strength: '計画力・小さな達成の積み上げ' },
  B: { key: 'B', name: '気づき探究家', emoji: '🔍', description: '「なぜやるか」に納得すると大きく伸びます。進捗と気づきが見えることが継続の鍵です。', strength: '探究心・意味を見つける力' },
  C: { key: 'C', name: '宣言ランナー', emoji: '📣', description: '報告や約束があると力を発揮します。小さな宣言と温かな反応が次の一歩につながります。', strength: 'コミットメント・報告する力' },
  D: { key: 'D', name: '自由な開拓者', emoji: '🎨', description: '自分のペースと方法を選べると力を発揮します。余白のある計画が継続を助けます。', strength: '柔軟性・自分の方法を作る力' },
};

export const diagnosisQuestions = [
  { question: '目標にしていたことが1日できなかった時は？', options: [{ key: 'A', text: '強く落ち込み、もうダメだと思いやすい' }, { key: 'B', text: 'なぜできなかったか分析したくなる' }, { key: 'C', text: '誰かに話したい、報告したいと感じる' }, { key: 'D', text: 'あまり気にせず次へ進む' }] },
  { question: '新しい習慣を始める時、大切なのは？', options: [{ key: 'A', text: '明確なルールとスケジュール' }, { key: 'B', text: '取り組む理由への納得' }, { key: 'C', text: '一緒にやる仲間や報告相手' }, { key: 'D', text: '自分のペースで動ける環境' }] },
  { question: '一番頑張れる状況は？', options: [{ key: 'A', text: 'やることが明確で計画通りの時' }, { key: 'B', text: '前進が数字や変化で分かる時' }, { key: 'C', text: '誰かに見てもらい報告できる時' }, { key: 'D', text: '自分のやり方を選べる時' }] },
  { question: '習慣が続かなかった主な理由は？', options: [{ key: 'A', text: '完璧にできない日が続いた' }, { key: 'B', text: '取り組む意味が見えなくなった' }, { key: 'C', text: '一人で張り合いがなくなった' }, { key: 'D', text: '決まった方法が窮屈だった' }] },
  { question: '合いそうな振り返り方は？', options: [{ key: 'A', text: '同じ形式で毎日記録する' }, { key: 'B', text: '数字や変化を見ながら記録する' }, { key: 'C', text: '報告してコメントをもらう' }, { key: 'D', text: 'その日の気分で自由に書く' }] },
] as const satisfies readonly { question: string; options: readonly { key: ContinuityTypeKey; text: string }[] }[];

export function diagnoseType(answers: ContinuityTypeKey[]): ContinuityType {
  const counts: Record<ContinuityTypeKey, number> = { A: 0, B: 0, C: 0, D: 0 };
  answers.forEach((answer) => { counts[answer] += 1; });
  const winner = (Object.keys(counts) as ContinuityTypeKey[]).reduce((best, key) => counts[key] > counts[best] ? key : best, 'A');
  return continuityTypes[winner];
}
