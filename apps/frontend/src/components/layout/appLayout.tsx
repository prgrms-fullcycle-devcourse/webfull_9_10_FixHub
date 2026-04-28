import { Outlet } from 'react-router-dom';

import Sidebar from '../ui/sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      <main>
        <Outlet />
      </main>
    </div>
  );
}
