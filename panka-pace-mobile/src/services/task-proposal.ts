import type { ContinuityTypeKey } from '@/domain/continuity-types';
import type { UserSettings } from '@/domain/models';

export interface GoalHearingInput {
  goal: string;
  deadline: string;
  dailyTime: string;
  currentLevel: string;
  obstacles: string;
}

export interface TaskProposal {
  tasks: string[];
  rationale: string;
  advice: string;
}

const typeAdvice: Record<ContinuityTypeKey, string> = {
  A: '完璧な日より、戻ってこられる計画を大切にしましょう。',
  B: '取り組んだ理由と変化を一言残すと、意味を見失いにくくなります。',
  C: '終わったことをPANKA PACEへ報告するところまでを1セットにしましょう。',
  D: '順番は固定せず、その日に選べる余白を残して進めましょう。',
};

export function createLocalTaskProposal(input: GoalHearingInput, userType: string | null, settings: UserSettings): TaskProposal {
  const type = (userType && userType in typeAdvice ? userType : 'A') as ContinuityTypeKey;
  const requestedMinutes = Number.parseInt(input.dailyTime, 10) || 20;
  const focusMinutes = Math.max(5, Math.min(requestedMinutes, settings.maxDailyMinutes));
  const focusBlock = Math.max(5, focusMinutes - (settings.taskGranularity === 'small' ? 12 : 8));
  const obstacleTask = input.obstacles.trim()
    ? `始める前に「${input.obstacles.trim().slice(0, 24)}」への対策を1つ選ぶ`
    : '始める前に、邪魔になりそうなことを1つ片づける';

  const tasks = [
      `「${input.goal.trim().slice(0, 28)}」の今日の一歩を決める`,
      `${focusBlock}分だけ集中して取り組む`,
      obstacleTask,
      '終わったこと・気づいたことを1行記録する',
    ];
  const adjustedTasks = settings.taskGranularity === 'large'
    ? [tasks[0], `${focusMinutes}分、今日選んだ内容に取り組む`, tasks[3]]
    : settings.taskGranularity === 'small'
      ? [tasks[0], '教材や道具を開く', tasks[1], tasks[2], tasks[3]]
      : tasks;
  const toneLead = settings.aiTone === 'analytical' ? '達成しやすさを優先して、' : settings.aiTone === 'flat' ? '無理のない範囲で、' : '焦らず、';
  return {
    tasks: adjustedTasks,
    rationale: `上限${settings.maxDailyMinutes}分の中で、準備・実行・記録まで完了できる${settings.taskGranularity === 'small' ? '細かな' : settings.taskGranularity === 'large' ? 'まとまりのある' : '標準的な'}大きさに分けました。`,
    advice: `${toneLead}${typeAdvice[type]}`,
  };
}
