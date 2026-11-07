import { describe, expect, it } from 'vitest';
import { CURRENT_TIME, ROOMS } from '@/data/rooms';
import { checkAvailability } from '@/domain/availability';
import {
  filterRooms,
  hasAllEquipment,
  hasCapacity,
  parseAttendees,
} from '@/domain/filtering';
import type { Room } from '@/domain/types';

const NOW = CURRENT_TIME; // 540
const byId = (id: string): Room => {
  const room = ROOMS.find((r) => r.id === id);
  if (!room) throw new Error(`missing fixture ${id}`);
  return room;
};
const roomA = byId('R101'); // 20 seats, Projector + Whiteboard, booking 600–660
const roomB = byId('R102'); // 6 seats, Whiteboard, BLOCKED
const labC = byId('R201'); // 30 seats, Projector + Whiteboard + Computers, bookings 660–780, 900–960
const ids = (rooms: Room[]) => rooms.map((r) => r.id);

// ---------------------------------------------------------------------------
// Catalog shape (new feature requirement)
// ---------------------------------------------------------------------------
describe('Catalog', () => {
  it('has at least four fictional rooms with id, name, capacity, equipment, blocked and bookings', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
    for (const room of ROOMS) {
      expect(room.id).toMatch(/\S/);
      expect(room.name).toMatch(/\S/);
      expect(room.capacity).toBeGreaterThan(0);
      expect(Array.isArray(room.equipment)).toBe(true);
      expect(typeof room.blocked).toBe('boolean');
      expect(Array.isArray(room.bookings)).toBe(true);
    }
    expect(new Set(ids([...ROOMS])).size).toBe(ROOMS.length);
  });
});

// ---------------------------------------------------------------------------
// AC1–AC5 regression on the catalog data (original A3 fixtures = Room A, Room B)
// ---------------------------------------------------------------------------
describe('AC regression on catalog rooms', () => {
  it('AC1: start must be strictly after the current time (540–570 rejected, 541–570 accepted)', () => {
    expect(checkAvailability(roomA, { start: 540, end: 570 }, NOW).status).toBe('unavailable');
    expect(checkAvailability(roomA, { start: 541, end: 570 }, NOW).status).toBe('available');
  });

  it('AC2 boundary: exactly 120 minutes is available, 121 minutes is not', () => {
    expect(checkAvailability(roomA, { start: 720, end: 840 }, NOW).status).toBe('available');
    const r = checkAvailability(roomA, { start: 720, end: 841 }, NOW);
    expect(r.status).toBe('unavailable');
    expect(r.errors).toContain('Duration must be at most 120 minutes.');
  });

  it('AC3 / F3: a blocked room is never reported as available, for any valid time', () => {
    for (let start = NOW + 1; start + 60 <= 1440; start += 37) {
      expect(checkAvailability(roomB, { start, end: start + 60 }, NOW).status).toBe('unavailable');
    }
    expect(checkAvailability(roomB, { start: 660, end: 720 }, NOW).reason).toMatch(/blocked/i);
  });

  it('AC4 boundary: touching intervals are available, overlapping intervals are not', () => {
    expect(checkAvailability(roomA, { start: 660, end: 720 }, NOW).status).toBe('available');
    expect(checkAvailability(roomA, { start: 541, end: 600 }, NOW).status).toBe('available');
    expect(checkAvailability(roomA, { start: 630, end: 690 }, NOW).status).toBe('unavailable');
    expect(checkAvailability(roomA, { start: 659, end: 700 }, NOW).status).toBe('unavailable');
  });

  it('AC5: catalog data is frozen and unchanged after checks', () => {
    const snapshot = JSON.stringify(ROOMS);
    for (const room of ROOMS) {
      checkAvailability(room, { start: 630, end: 690 }, NOW);
      checkAvailability(room, { start: 0, end: 1500 }, NOW);
    }
    expect(JSON.stringify(ROOMS)).toBe(snapshot);
    expect(Object.isFrozen(ROOMS)).toBe(true);
    expect(Object.isFrozen(roomA.bookings)).toBe(true);
    expect(Object.isFrozen(roomA.bookings[0])).toBe(true);
    expect(() => {
      (roomA.bookings as { start: number; end: number }[]).push({ start: 0, end: 1 });
    }).toThrow(TypeError);
  });

  it('uses the chosen room bookings, not another room’s data (660–720: Room A available, Lab C overlaps)', () => {
    const candidate = { start: 660, end: 720 };
    expect(checkAvailability(roomA, candidate, NOW).status).toBe('available');
    expect(checkAvailability(labC, candidate, NOW).status).toBe('unavailable');
    // 600–660 is the reverse: Room A is booked, Lab C is free
    expect(checkAvailability(roomA, { start: 600, end: 660 }, NOW).status).toBe('unavailable');
    expect(checkAvailability(labC, { start: 600, end: 660 }, NOW).status).toBe('available');
  });
});

// ---------------------------------------------------------------------------
// F1 capacity filter
// ---------------------------------------------------------------------------
describe('F1 capacity filter', () => {
  it('boundary: exact capacity matches, one more attendee does not', () => {
    expect(hasCapacity(roomA, 20)).toBe(true);
    expect(hasCapacity(roomA, 21)).toBe(false);
  });

  it('filters the catalog by attendees', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 1, equipment: [] }))).toEqual([
      'R101', 'R102', 'R201', 'R202', 'R301',
    ]);
    expect(ids(filterRooms(ROOMS, { attendees: 30, equipment: [] }))).toEqual(['R201', 'R301']);
    expect(ids(filterRooms(ROOMS, { attendees: 31, equipment: [] }))).toEqual(['R301']);
  });

  it('rejects invalid attendee input', () => {
    expect(parseAttendees('12')).toEqual({ ok: true, value: 12 });
    for (const bad of ['', '0', '-3', '2.5', 'abc']) {
      expect(parseAttendees(bad).ok).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// F2 equipment filter
// ---------------------------------------------------------------------------
describe('F2 equipment filter', () => {
  it('requires ALL selected items, not just one', () => {
    expect(hasAllEquipment(labC, ['Projector', 'Computers'])).toBe(true);
    expect(hasAllEquipment(roomA, ['Projector', 'Computers'])).toBe(false);
    expect(hasAllEquipment(roomA, [])).toBe(true);
  });

  it('combines capacity and equipment filters', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 1, equipment: ['Projector'] }))).toEqual([
      'R101', 'R201', 'R202', 'R301',
    ]);
    expect(
      ids(filterRooms(ROOMS, { attendees: 10, equipment: ['Projector', 'Video conferencing'] })),
    ).toEqual(['R202', 'R301']);
    expect(
      ids(filterRooms(ROOMS, { attendees: 11, equipment: ['Projector', 'Video conferencing'] })),
    ).toEqual(['R301']);
  });

  it('returns an empty list when nothing matches (data side of F4)', () => {
    expect(filterRooms(ROOMS, { attendees: 200, equipment: [] })).toEqual([]);
    expect(filterRooms(ROOMS, { attendees: 1, equipment: ['Computers', 'Microphone'] })).toEqual([]);
  });
});
