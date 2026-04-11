import { defaultStudentProfile } from '@/src/features/dashboard/student-profile-model';
import PythonRoomsIndexPage from '@/src/features/rooms/PythonRoomsIndexPage';

export default function DashboardPythonRoomsPageIndex() {
  return <PythonRoomsIndexPage learnerName={defaultStudentProfile.name} />;
}
