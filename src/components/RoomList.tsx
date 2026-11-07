import { Ban, SearchX, Users } from 'lucide-react';
import type { Room } from '@/domain/types';

interface RoomListProps {
  rooms: readonly Room[];
  selectedRoomId: string | null;
  onSelect: (id: string) => void;
}

/** Shows only the rooms that match the requirements, or a clear empty state (F4). */
export default function RoomList({ rooms, selectedRoomId, onSelect }: RoomListProps) {
  return (
    <section aria-labelledby="rooms-heading" className="space-y-3">
      <h2 id="rooms-heading" className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
        2. Matching rooms <span className="text-gray-400 font-normal">({rooms.length})</span>
      </h2>

      {rooms.length === 0 ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4"
        >
          <SearchX size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-gray-800">No rooms match your requirements.</p>
            <p className="text-sm text-gray-500 mt-0.5">
              Try fewer attendees or fewer equipment items.
            </p>
          </div>
        </div>
      ) : (
        <div role="radiogroup" aria-labelledby="rooms-heading" className="space-y-2">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              selected={room.id === selectedRoomId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onSelect: (id: string) => void;
}

function RoomCard({ room, selected, onSelect }: RoomCardProps) {
  return (
    <label
      className={`block rounded-xl border-2 p-3.5 cursor-pointer transition ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="radio"
          name="room"
          value={room.id}
          checked={selected}
          onChange={() => onSelect(room.id)}
          className="mt-1 accent-blue-600"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{room.name}</span>
            <span className="text-xs text-gray-400">{room.id}</span>
            {room.blocked && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                <Ban size={12} /> Blocked
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <Users size={12} /> Capacity {room.capacity}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {room.equipment.map((item) => (
              <span key={item} className="px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </label>
  );
}
