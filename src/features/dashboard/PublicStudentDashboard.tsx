'use client';

import { useEffect, useState } from 'react';
import StudentDashboard from './StudentDashboard';
import { buildPublicDashboardData, readPublicProfileFromStorage } from '@/src/lib/public-mode';

export default function PublicStudentDashboard() {
  const [data, setData] = useState(() => buildPublicDashboardData());

  useEffect(() => {
    const storedProfile = readPublicProfileFromStorage();

    if (storedProfile) {
      setData(buildPublicDashboardData(storedProfile));
    }
  }, []);

  return <StudentDashboard data={data} />;
}
