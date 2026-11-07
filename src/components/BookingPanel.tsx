import { Ban, Clock, DoorClosed, MousePointerClick } from 'lucide-react';
import { MAX_DURATION, type AvailabilityResult } from '@/domain/availability';
import type { Minutes, Room } from '@/domain/types';
import { formatTime, parseMinutes } from '@/lib/time';
import AvailabilityResultPanel from './AvailabilityResultPanel';
import TimeField from './TimeField';

interface BookingPanelProps {
  room: Room | null;
  now: Minutes;
  start: string;
  end: string;
  result: AvailabilityResult | null;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onCheck: () => void;
}

export default function BookingPanel({
  room,
  now,
  start,
  end,
  result,
  onStartChange,
  onEndChange,
  onCheck,
}: BookingPanelProps) {
  const startNum = parseMinutes(start);
  const endNum = parseMinutes(end);
  const duration =
    Number.isFinite(startNum) && Number.isFinite(endNum) && startNum < endNum
      ? endNum - startNum
      : null;

  return (
    <section aria-labelledby="booking-heading" className="space-y-5">
      <h2 id="booking-heading" className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        3. Check availability
      </h2>

      <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
        {room ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white">
                <DoorClosed size={20} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-semibold text-gray-900" data-testid="selected-room">
                  {room.name}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                  <Clock size={14} strokeWidth={2} />
                  Current time: {formatTime(now)}
                </p>
              </div>
            </div>
            {room.blocked && (
              <p className="mt-3 text-xs font-medium text-red-700 flex items-center gap-1.5">
                <Ban size={12} /> This room is blocked and cannot be booked.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide self-center">
                Existing bookings:
              </span>
              {room.bookings.length === 0 && <span className="text-xs text-gray-500">none</span>}
              {room.bookings.map((b) => (
                <span
                  key={`${b.start}-${b.end}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600"
                >
                  {formatTime(b.start)} – {formatTime(b.end)}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <MousePointerClick size={16} /> Select a room from the list to check its availability.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TimeField
          id="start-time"
          label="Start time (min after midnight)"
          value={start}
          placeholder="e.g. 660"
          onChange={onStartChange}
        />
        <TimeField
          id="end-time"
          label="End time (min after midnight)"
          value={end}
          placeholder="e.g. 720"
          onChange={onEndChange}
        />
      </div>

      {duration !== null && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={14} strokeWidth={2} />
          <span>
            Duration: <span className="font-medium text-gray-700">{duration}</span> minute
            {duration === 1 ? '' : 's'}
            {duration > MAX_DURATION && (
              <span className="text-red-500 font-medium ml-1.5">
                (exceeds {MAX_DURATION} min limit)
              </span>
            )}
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onCheck}
        disabled={!room}
        className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Check Availability
      </button>

      <AvailabilityResultPanel roomName={room?.name ?? ''} result={result} />
    </section>
  );
}
