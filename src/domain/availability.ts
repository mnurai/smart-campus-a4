import type { Booking, Minutes, Room } from './types';

/** Booking and availability rules (AC1–AC5). Pure functions, no UI code. */

export const DAY_END: Minutes = 1440;
export const MAX_DURATION: Minutes = 120;

export interface Candidate {
  start: Minutes;
  end: Minutes;
}

export type AvailabilityStatus = 'available' | 'unavailable';

export interface AvailabilityResult {
  status: AvailabilityStatus;
  /** Human-readable reason for the result. Present for both statuses. */
  reason: string;
  /** Validation errors (only present when input is invalid). Empty array otherwise. */
  errors: string[];
}

/** The only room fields the availability rules need. */
export type AvailabilityRoom = Pick<Room, 'blocked' | 'bookings'>;

/**
 * Validates a candidate time range (AC1, AC2).
 * Returns a list of human-readable error strings. Empty array = valid.
 */
export function validateCandidate(candidate: Candidate, now: Minutes): string[] {
  const errors: string[] = [];
  const { start, end } = candidate;

  if (Number.isNaN(start)) {
    errors.push('Start time is required.');
  } else if (!Number.isInteger(start)) {
    errors.push('Start time must be a whole number of minutes.');
  }
  if (Number.isNaN(end)) {
    errors.push('End time is required.');
  } else if (!Number.isInteger(end)) {
    errors.push('End time must be a whole number of minutes.');
  }

  // Only do range checks if both are integers
  if (errors.length === 0) {
    if (start < 0) {
      errors.push('Start time must be at least 0.');
    }
    if (end > DAY_END) {
      errors.push(`End time must be at most ${DAY_END}.`);
    }
    if (start >= end) {
      errors.push('Start time must be before end time.');
    }
    if (start <= now) {
      errors.push(`Start time must be strictly after the current time (${now}).`);
    }
  }

  // Duration check only if the range itself is valid
  if (errors.length === 0 && end - start > MAX_DURATION) {
    errors.push(`Duration must be at most ${MAX_DURATION} minutes.`);
  }

  return errors;
}

/**
 * Half-open interval overlap (AC4). Touching endpoints
 * (a.end === b.start or b.end === a.start) do NOT overlap.
 */
export function hasOverlap(a: Booking, b: Candidate): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Determines availability of ONE room for a candidate time range (AC1–AC5).
 * Uses only the bookings of the room passed in. Never mutates room data.
 */
export function checkAvailability(
  room: AvailabilityRoom,
  candidate: Candidate,
  now: Minutes,
): AvailabilityResult {
  const errors = validateCandidate(candidate, now);

  if (errors.length > 0) {
    return { status: 'unavailable', reason: 'The requested time is not valid.', errors };
  }

  if (room.blocked) {
    return {
      status: 'unavailable',
      reason: 'This room is blocked and cannot be booked.',
      errors: [],
    };
  }

  if (room.bookings.some((booking) => hasOverlap(booking, candidate))) {
    return {
      status: 'unavailable',
      reason: 'The requested time overlaps an existing booking.',
      errors: [],
    };
  }

  return {
    status: 'available',
    reason: 'The room is available for the requested time.',
    errors: [],
  };
}
