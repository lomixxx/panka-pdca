import type { DailyRecord } from '@/domain/models';
import { getLocalDateKey } from '@/lib/date';

export interface TrendDay {
  date: string;
  label: string;
  rate: number;
  recorded: boolean;
}

export interface TrendSummary {
  days: TrendDay[];
  recordedDays: number;
  averageRate: number;
  activeStreak: number;
  bestRate: number;
  change: number | null;
  insight: string;
}

export function analyzeTrend(records: DailyRecord[], period: 14 | 30, now = new Date()): TrendSummary {
  const days = Array.from({ length: period }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (period - 1 - index));
    const key = getLocalDateKey(date);
    const record = records.find((item) => item.date === key);
    return {
      date: key,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      rate: record?.rate ?? 0,
      recorded: Boolean(record),
    };
  });
  const recorded = days.filter((day) => day.recorded);
  const averageRate = recorded.length ? Math.round(recorded.reduce((sum, day) => sum + day.rate, 0) / recorded.length) : 0;
  const bestRate = recorded.length ? Math.max(...recorded.map((day) => day.rate)) : 0;
  let activeStreak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (!days[index].recorded) break;
    activeStreak += 1;
  }
  const middle = Math.floor(days.length / 2);
  const first = days.slice(0, middle).filter((day) => day.recorded);
  const second = days.slice(middle).filter((day) => day.recorded);
  const average = (items: TrendDay[]) => items.length ? items.reduce((sum, day) => sum + day.rate, 0) / items.length : null;
  const firstAverage = average(first);
  const secondAverage = average(second);
  const change = firstAverage === null || secondAverage === null ? null : Math.round(secondAverage - firstAverage);
  let insight = '記録が増えると、あなたの続きやすいペースが見えてきます。';
  if (recorded.length >= 3 && change !== null) {
    insight = change >= 10
      ? '期間の後半で達成率が上がっています。今のタスク量が合い始めているサインです。'
      : change <= -10
        ? '期間の後半は少しペースが落ちています。タスクを小さくする余地がありそうです。'
        : '大きく崩れず、安定したペースで進めています。この大きさをしばらく続けてみましょう。';
  }
  return { days, recordedDays: recorded.length, averageRate, activeStreak, bestRate, change, insight };
}
