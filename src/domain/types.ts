/** Whole minutes after midnight (0–1440). */
export type Minutes = number;

export interface Booking {
  readonly start: Minutes;
  readonly end: Minutes;
}

export const EQUIPMENT = [
  'Projector',
  'Whiteboard',
  'Computers',
  'Video conferencing',
  'Microphone',
] as const;

export type Equipment = (typeof EQUIPMENT)[number];

export interface Room {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly equipment: readonly Equipment[];
  readonly blocked: boolean;
  readonly bookings: readonly Booking[];
}
