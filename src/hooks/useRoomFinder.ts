import { useCallback, useMemo, useState } from 'react';
import {
  checkAvailability,
  type AvailabilityResult,
} from '@/domain/availability';
import { filterRooms, parseAttendees } from '@/domain/filtering';
import type { Equipment, Minutes, Room } from '@/domain/types';
import { parseMinutes } from '@/lib/time';

/**
 * UI state for the room finder. Holds no business rules itself: it calls the
 * domain functions and guarantees that a result is never shown for a room,
 * time range or filter set other than the one it was computed for (F5).
 */
export function useRoomFinder(rooms: readonly Room[], now: Minutes) {
  const [attendeesInput, setAttendeesInput] = useState('1');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const attendees = parseAttendees(attendeesInput);
  const attendeeCount = attendees.ok ? attendees.value : null;

  const visibleRooms = useMemo(
    () =>
      attendeeCount === null ? [] : filterRooms(rooms, { attendees: attendeeCount, equipment }),
    [rooms, attendeeCount, equipment],
  );

  // A room that no longer matches the filters is no longer selected.
  const selectedRoom = visibleRooms.find((room) => room.id === selectedRoomId) ?? null;

  // Every input change invalidates the previous result (original A3 behaviour, now also F5).
  const changeAttendees = useCallback((value: string) => {
    setAttendeesInput(value);
    setResult(null);
  }, []);

  const toggleEquipment = useCallback((item: Equipment) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item],
    );
    setResult(null);
  }, []);

  const selectRoom = useCallback((id: string) => {
    setSelectedRoomId(id);
    setResult(null);
  }, []);

  const changeStart = useCallback((value: string) => {
    setStart(value);
    setResult(null);
  }, []);

  const changeEnd = useCallback((value: string) => {
    setEnd(value);
    setResult(null);
  }, []);

  const check = useCallback(() => {
    if (!selectedRoom) return;
    setResult(
      checkAvailability(
        selectedRoom,
        { start: parseMinutes(start), end: parseMinutes(end) },
        now,
      ),
    );
  }, [selectedRoom, start, end, now]);

  return {
    attendeesInput,
    attendeesError: attendees.ok ? null : attendees.error,
    equipment,
    visibleRooms,
    selectedRoom,
    start,
    end,
    result,
    changeAttendees,
    toggleEquipment,
    selectRoom,
    changeStart,
    changeEnd,
    check,
  };
}
