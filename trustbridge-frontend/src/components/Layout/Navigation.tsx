import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardNavigation from './DashboardNavigation';

const Navigation: React.FC = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  // Only render dashboard navigation on dashboard routes
  if (isDashboardRoute) {
    return <DashboardNavigation />;
  }

  // No navigation on landing page
  return null;
};

export default Navigation;