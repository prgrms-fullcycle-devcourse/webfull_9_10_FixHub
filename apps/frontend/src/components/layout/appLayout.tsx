import { Outlet } from 'react-router-dom';

import Header from './Header';
import Sidebar from '../ui/sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-main-background text-foreground">
      <Header />
      <Sidebar />

      <main className="ml-[315px] pt-[90px] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
