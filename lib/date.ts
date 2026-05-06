/**
 * 日付ユーティリティ。Client / Server 両対応（依存なし）。
 */

/**
 * ローカル時刻ベースで「今日」の YYYY-MM-DD を返す。
 * （ユーザーの体感日付。タスク管理はこの単位で集計する）
 */
export function getTodayDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * 今日を含む直近 n 日分の YYYY-MM-DD 配列を返す（今日が末尾）。
 */
export function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    dates.push(`${y}-${mo}-${da}`);
  }
  return dates;
}
