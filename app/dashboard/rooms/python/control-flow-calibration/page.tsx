import { notFound } from 'next/navigation';
import PythonRoomShell from '@/src/features/rooms/PythonRoomShell';
import { fetchPythonRoomById } from '@/src/lib/supabase/python-rooms';

const CONTROL_FLOW_CALIBRATION_ROOM_ID = 'control-flow-calibration';

export default async function DashboardPythonControlFlowCalibrationPage() {
  const room = await fetchPythonRoomById(CONTROL_FLOW_CALIBRATION_ROOM_ID);

  if (!room) {
    notFound();
  }

  return <PythonRoomShell room={room} />;
}
