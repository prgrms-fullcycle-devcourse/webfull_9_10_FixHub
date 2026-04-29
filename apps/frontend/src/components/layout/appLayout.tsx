import { Outlet } from 'react-router-dom';

import Header from './Header';
import Sidebar from '../ui/sidebar';

export default function AppLayout() {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <Sidebar />

      <main className="pl-[315px] pt-[91px] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
