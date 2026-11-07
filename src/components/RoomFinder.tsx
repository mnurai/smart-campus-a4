import { CalendarX } from 'lucide-react';
import { CURRENT_TIME, ROOMS } from '@/data/rooms';
import type { Minutes, Room } from '@/domain/types';
import { useRoomFinder } from '@/hooks/useRoomFinder';
import BookingPanel from './BookingPanel';
import RequirementsForm from './RequirementsForm';
import RoomList from './RoomList';

interface RoomFinderProps {
  rooms?: readonly Room[];
  now?: Minutes;
}

/** Composes the page. Data comes in as props so tests can supply their own catalog. */
export default function RoomFinder({ rooms = ROOMS, now = CURRENT_TIME }: RoomFinderProps) {
  const finder = useRoomFinder(rooms, now);

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-5 sm:p-6 space-y-6 border-b lg:border-b-0 lg:border-r border-gray-100">
          <RequirementsForm
            attendeesInput={finder.attendeesInput}
            attendeesError={finder.attendeesError}
            equipment={finder.equipment}
            onAttendeesChange={finder.changeAttendees}
            onToggleEquipment={finder.toggleEquipment}
          />
          <RoomList
            rooms={finder.visibleRooms}
            selectedRoomId={finder.selectedRoom?.id ?? null}
            onSelect={finder.selectRoom}
          />
        </div>
        <div className="p-5 sm:p-6">
          <BookingPanel
            room={finder.selectedRoom}
            now={now}
            start={finder.start}
            end={finder.end}
            result={finder.result}
            onStartChange={finder.changeStart}
            onEndChange={finder.changeEnd}
            onCheck={finder.check}
          />
        </div>
      </div>

      <div className="px-6 pb-5">
        <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
          <CalendarX size={14} strokeWidth={2} className="flex-shrink-0 mt-0.5" />
          <p>All data is fictional and for demonstration only. No real bookings are created or modified.</p>
        </div>
      </div>
    </div>
  );
}
