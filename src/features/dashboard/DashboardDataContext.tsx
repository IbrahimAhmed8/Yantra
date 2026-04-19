'use client';

import { createContext, useContext } from 'react';
import type { StudentDashboardData } from './student-dashboard-model';

export const DashboardDataContext = createContext<StudentDashboardData | null>(null);

export function useDashboardData() {
  const context = useContext(DashboardDataContext);

  if (!context) {
    throw new Error('useDashboardData must be used inside StudentDashboard.');
  }

  return context;
}
