'use client';

import { useDashboardData } from '../DashboardDataContext';
import RoomCard from '../components/RoomCard';
import DashboardSectionShell from './DashboardSectionShell';

export default function DashboardRoomsSection() {
  const { rooms } = useDashboardData();

  return (
    <DashboardSectionShell
      id="rooms"
      number="03"
      eyebrow="Practice Rooms"
      title="Immersive rooms that stay tied to the learner’s current context."
      description="The room system keeps the same four-entry structure from your sample, but the featured spaces now have more atmosphere and clearer energy around the next best action."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {rooms.map((room, index) => (
          <RoomCard key={room.roomKey} room={room} index={index} />
        ))}
      </div>
    </DashboardSectionShell>
  );
}
