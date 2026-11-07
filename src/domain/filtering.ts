import type { Equipment, Room } from './types';

/** Room filtering rules (F1, F2). Pure functions, no UI code. */

export interface RoomRequirements {
  attendees: number;
  equipment: readonly Equipment[];
}

/** F1: capacity must be greater than or equal to the requested attendees. */
export function hasCapacity(room: Room, attendees: number): boolean {
  return room.capacity >= attendees;
}

/** F2: the room must contain ALL selected equipment items. */
export function hasAllEquipment(room: Room, required: readonly Equipment[]): boolean {
  return required.every((item) => room.equipment.includes(item));
}

/**
 * Returns the rooms that satisfy every requirement, in catalog order.
 * Blocked rooms are kept (and labelled in the UI) — F3 is enforced by
 * checkAvailability, which never reports a blocked room as available.
 */
export function filterRooms(rooms: readonly Room[], requirements: RoomRequirements): Room[] {
  return rooms.filter(
    (room) =>
      hasCapacity(room, requirements.attendees) &&
      hasAllEquipment(room, requirements.equipment),
  );
}

export type AttendeesParseResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

/** Parses the attendees field: a whole number of at least 1. */
export function parseAttendees(input: string): AttendeesParseResult {
  const trimmed = input.trim();
  const value = Number(trimmed);
  if (trimmed === '' || !Number.isInteger(value) || value < 1) {
    return { ok: false, error: 'Enter a whole number of attendees (at least 1).' };
  }
  return { ok: true, value };
}
