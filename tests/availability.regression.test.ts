// Original Assignment #03 suite (42 tests). Only imports and the removed `name`
// field changed; every assertion is unchanged. See the Evidence file, section 3.
import { describe, expect, it } from 'vitest';
import {
  checkAvailability,
  hasOverlap,
  validateCandidate,
  type AvailabilityRoom as Room,
  type Candidate,
} from '@/domain/availability';
import type { Booking } from '@/domain/types';

// ---------------------------------------------------------------------------
// Base data per assignment spec
// ---------------------------------------------------------------------------
const NOW = 540;
const BASE_BOOKINGS: Booking[] = [{ start: 600, end: 660 }];

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    blocked: false,
    bookings: BASE_BOOKINGS,
    ...overrides,
  };
}

function candidate(start: number, end: number): Candidate {
  return { start, end };
}

// ---------------------------------------------------------------------------
// validateCandidate
// ---------------------------------------------------------------------------
describe('validateCandidate', () => {
  it('accepts a valid candidate strictly after now', () => {
    expect(validateCandidate(candidate(541, 600), NOW)).toEqual([]);
  });

  it('accepts duration of exactly 120 minutes', () => {
    expect(validateCandidate(candidate(541, 661), NOW)).toEqual([]);
  });

  it('rejects start at or before now', () => {
    expect(validateCandidate(candidate(540, 570), NOW)).not.toEqual([]);
    expect(validateCandidate(candidate(0, 1), NOW)).not.toEqual([]);
  });

  it('rejects start >= end (reversed times)', () => {
    expect(validateCandidate(candidate(700, 600), NOW)).not.toEqual([]);
    expect(validateCandidate(candidate(600, 600), NOW)).not.toEqual([]);
  });

  it('rejects end > 1440 (day bounds)', () => {
    expect(validateCandidate(candidate(1430, 1441), NOW)).not.toEqual([]);
  });

  it('accepts end = 1440', () => {
    expect(validateCandidate(candidate(1439, 1440), NOW)).toEqual([]);
  });

  it('rejects duration > 120', () => {
    expect(validateCandidate(candidate(541, 662), NOW)).not.toEqual([]);
  });

  it('collects multiple errors for wildly bad input', () => {
    const errors = validateCandidate(candidate(0, 1500), NOW);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });

  it('reports "is required" for NaN start', () => {
    const errors = validateCandidate(candidate(NaN, 600), NOW);
    expect(errors).toContain('Start time is required.');
  });

  it('reports "is required" for NaN end', () => {
    const errors = validateCandidate(candidate(600, NaN), NOW);
    expect(errors).toContain('End time is required.');
  });

  it('reports "is required" for both NaN', () => {
    const errors = validateCandidate(candidate(NaN, NaN), NOW);
    expect(errors).toContain('Start time is required.');
    expect(errors).toContain('End time is required.');
  });

  it('rejects fractional start with whole-number message', () => {
    const errors = validateCandidate(candidate(660.5, 720), NOW);
    expect(errors).toContain('Start time must be a whole number of minutes.');
    expect(errors).not.toContain('Start time is required.');
  });

  it('rejects fractional end with whole-number message', () => {
    const errors = validateCandidate(candidate(660, 720.5), NOW);
    expect(errors).toContain('End time must be a whole number of minutes.');
    expect(errors).not.toContain('End time is required.');
  });

  it('reports future-start error with specific now value in message', () => {
    const errors = validateCandidate(candidate(540, 570), NOW);
    expect(errors).toContain('Start time must be strictly after the current time (540).');
  });

  it('uses the actual now value in the message for a different now', () => {
    const errors = validateCandidate(candidate(700, 710), 800);
    expect(errors).toContain('Start time must be strictly after the current time (800).');
    expect(errors).not.toContain('(540)');
  });
});

// ---------------------------------------------------------------------------
// hasOverlap
// ---------------------------------------------------------------------------
describe('hasOverlap', () => {
  const booking: Booking = { start: 600, end: 660 };

  it('returns true for partial overlap at the start', () => {
    expect(hasOverlap(booking, candidate(590, 610))).toBe(true);
  });

  it('returns true for partial overlap at the end', () => {
    expect(hasOverlap(booking, candidate(650, 700))).toBe(true);
  });

  it('returns true when candidate fully contains booking', () => {
    expect(hasOverlap(booking, candidate(500, 700))).toBe(true);
  });

  it('returns true when booking fully contains candidate', () => {
    expect(hasOverlap(booking, candidate(610, 620))).toBe(true);
  });

  it('returns false when touching at the start boundary', () => {
    expect(hasOverlap(booking, candidate(541, 600))).toBe(false);
  });

  it('returns false when touching at the end boundary', () => {
    expect(hasOverlap(booking, candidate(660, 700))).toBe(false);
  });

  it('returns false when entirely before', () => {
    expect(hasOverlap(booking, candidate(541, 599))).toBe(false);
  });

  it('returns false when entirely after', () => {
    expect(hasOverlap(booking, candidate(700, 800))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// checkAvailability — assignment cases (now=540, blocked=false, bookings=[600-660])
// ---------------------------------------------------------------------------
describe('checkAvailability — assignment cases', () => {
  const room = makeRoom();

  it('660–720: Available', () => {
    const result = checkAvailability(room, candidate(660, 720), NOW);
    expect(result.status).toBe('available');
    expect(result.errors).toEqual([]);
  });

  it('630–690: Unavailable (overlaps existing booking)', () => {
    const result = checkAvailability(room, candidate(630, 690), NOW);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toMatch(/overlap/i);
  });

  it('660–720 with blocked=true: Unavailable', () => {
    const blockedRoom = makeRoom({ blocked: true });
    const result = checkAvailability(blockedRoom, candidate(660, 720), NOW);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toMatch(/blocked/i);
  });

  it('720–840: Available', () => {
    const result = checkAvailability(room, candidate(720, 840), NOW);
    expect(result.status).toBe('available');
    expect(result.errors).toEqual([]);
  });

  it('720–841: Unavailable (duration 121 > 120)', () => {
    const result = checkAvailability(room, candidate(720, 841), NOW);
    expect(result.status).toBe('unavailable');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('540–570: Unavailable (start not strictly after now)', () => {
    const result = checkAvailability(room, candidate(540, 570), NOW);
    expect(result.status).toBe('unavailable');
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// checkAvailability — additional boundary tests
// ---------------------------------------------------------------------------
describe('checkAvailability — additional boundaries', () => {
  const room = makeRoom();

  it('reversed times (700–600): Unavailable with validation errors', () => {
    const result = checkAvailability(room, candidate(700, 600), NOW);
    expect(result.status).toBe('unavailable');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('end beyond day bounds (1430–1441): Unavailable with validation errors', () => {
    const result = checkAvailability(room, candidate(1430, 1441), NOW);
    expect(result.status).toBe('unavailable');
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('touching at start boundary (541–600): Available', () => {
    const result = checkAvailability(room, candidate(541, 600), NOW);
    expect(result.status).toBe('available');
  });

  it('touching at end boundary (660–700): Available', () => {
    const result = checkAvailability(room, candidate(660, 700), NOW);
    expect(result.status).toBe('available');
  });

  it('duration exactly 120 (660–780): Available', () => {
    const result = checkAvailability(room, candidate(660, 780), NOW);
    expect(result.status).toBe('available');
  });

  it('blocked room with valid time: Unavailable', () => {
    const blockedRoom = makeRoom({ blocked: true });
    const result = checkAvailability(blockedRoom, candidate(700, 800), NOW);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toMatch(/blocked/i);
  });

  it('blocked room with invalid time: Unavailable with validation errors', () => {
    const blockedRoom = makeRoom({ blocked: true });
    const result = checkAvailability(blockedRoom, candidate(0, 10), NOW);
    expect(result.status).toBe('unavailable');
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// checkAvailability — multiple bookings
// ---------------------------------------------------------------------------
describe('checkAvailability — multiple bookings', () => {
  const multiRoom: Room = {
    blocked: false,
    bookings: [
      { start: 600, end: 660 },
      { start: 700, end: 780 },
      { start: 900, end: 960 },
    ],
  };

  it('available in gap between first and second booking', () => {
    const result = checkAvailability(multiRoom, candidate(660, 700), NOW);
    expect(result.status).toBe('available');
  });

  it('available in gap between second and third booking', () => {
    const result = checkAvailability(multiRoom, candidate(780, 900), NOW);
    expect(result.status).toBe('available');
  });

  it('unavailable when overlapping the second booking', () => {
    const result = checkAvailability(multiRoom, candidate(750, 810), NOW);
    expect(result.status).toBe('unavailable');
    expect(result.reason).toMatch(/overlap/i);
  });

  it('available after the last booking', () => {
    const result = checkAvailability(multiRoom, candidate(960, 1020), NOW);
    expect(result.status).toBe('available');
  });
});

// ---------------------------------------------------------------------------
// checkAvailability — immutability (AC5)
// ---------------------------------------------------------------------------
describe('checkAvailability — never mutates bookings', () => {
  it('bookings array and contents are unchanged after a check', () => {
    const bookings: Booking[] = [{ start: 600, end: 660 }];
    const room: Room = {
      blocked: false,
      bookings,
    };
    const snapshot = JSON.stringify(bookings);

    checkAvailability(room, candidate(541, 600), NOW);
    checkAvailability(room, candidate(630, 690), NOW);
    checkAvailability(room, candidate(0, 1500), NOW);

    expect(JSON.stringify(bookings)).toBe(snapshot);
    expect(room.bookings).toBe(bookings); // still the same array reference
    expect(bookings[0].start).toBe(600);
    expect(bookings[0].end).toBe(660);
  });

  it('unchanged inputs produce the same result', () => {
    const room = makeRoom();
    const r1 = checkAvailability(room, candidate(660, 720), NOW);
    const r2 = checkAvailability(room, candidate(660, 720), NOW);
    expect(r1).toEqual(r2);
  });
});
