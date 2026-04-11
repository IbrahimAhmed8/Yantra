import StudentProfilePage from '@/src/features/dashboard/StudentProfilePage';
import { defaultStudentProfile } from '@/src/features/dashboard/student-profile-model';

export default function DashboardStudentProfilePage() {
  return (
    <StudentProfilePage
      initialProfileData={defaultStudentProfile}
      defaultProfileData={defaultStudentProfile}
      publicMode
    />
  );
}
