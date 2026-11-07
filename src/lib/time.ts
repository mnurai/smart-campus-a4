import { DAY_END } from '@/domain/availability';
import type { Minutes } from '@/domain/types';

/** Parses a time field. Empty input becomes NaN so validation can say "required". */
export function parseMinutes(value: string): number {
  const trimmed = value.trim();
  if (trimmed === '') return NaN;
  return Number(trimmed);
}

/** True when the value can be shown as a clock time (0–1440). */
export function isDisplayableTime(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= DAY_END;
}

/** Converts minutes-after-midnight to an HH:MM display string. */
export function formatTime(minutes: Minutes): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
