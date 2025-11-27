'use client';

import DashboardNav from './DashboardNav';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
