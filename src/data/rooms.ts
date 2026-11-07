import type { Room } from '@/domain/types';

/** Fixed, fictional "current time" used by every availability check (09:00). */
export const CURRENT_TIME = 540;

/**
 * Fictional room catalog. All data is invented for demonstration only.
 * Room A and Room B keep the Assignment #03 fixtures (booking 600–660; blocked room).
 */
const catalog: Room[] = [
  {
    id: 'R101',
    name: 'Room A – Seminar Room',
    capacity: 20,
    equipment: ['Projector', 'Whiteboard'],
    blocked: false,
    bookings: [{ start: 600, end: 660 }],
  },
  {
    id: 'R102',
    name: 'Room B – Study Room',
    capacity: 6,
    equipment: ['Whiteboard'],
    blocked: true,
    bookings: [],
  },
  {
    id: 'R201',
    name: 'Lab C – Computer Lab',
    capacity: 30,
    equipment: ['Projector', 'Whiteboard', 'Computers'],
    blocked: false,
    bookings: [
      { start: 660, end: 780 },
      { start: 900, end: 960 },
    ],
  },
  {
    id: 'R202',
    name: 'Room D – Meeting Room',
    capacity: 10,
    equipment: ['Video conferencing', 'Projector'],
    blocked: false,
    bookings: [{ start: 720, end: 750 }],
  },
  {
    id: 'R301',
    name: 'Hall E – Lecture Hall',
    capacity: 120,
    equipment: ['Projector', 'Microphone', 'Video conferencing'],
    blocked: false,
    bookings: [{ start: 600, end: 720 }],
  },
];

/** Recursively freezes the catalog so no part of the app can change booking data (AC5). */
function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

export const ROOMS: readonly Room[] = deepFreeze(catalog);
