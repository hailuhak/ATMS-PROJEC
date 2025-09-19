import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { MyCourses } from './MyCourses';
import { Progress } from './Progress';
import { Schedule } from './Schedule';
import { Resources } from './Resources';
import { DashboardOverview } from './DashboardOverview';

interface TraineeDashboardProps {
  activeSection: string;
}

export const TraineeDashboard: React.FC<TraineeDashboardProps> = ({ activeSection }) => {
  const { currentUser } = useAuth();

  switch (activeSection) {
    case 'courses':
      return <MyCourses currentUser={currentUser} />; // pass currentUser here
    case 'progress':
      return <Progress />;
    case 'schedule':
      return <Schedule />;
    case 'resources':
      return <Resources />;
    default:
      return <DashboardOverview currentUser={currentUser} />;
  }
};
