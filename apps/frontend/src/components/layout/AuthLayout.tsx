import { Outlet } from 'react-router-dom';

import Logo from '@/assets/Logo_Login.svg';

export default function AuthLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="relative hidden flex-1 items-center justify-center lg:flex">
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <Logo />
        </div>
      </div>

      <div className="z-10 flex w-full items-center justify-center bg-black/30 backdrop-blur-[9px] lg:w-[50%]">
        <div className="w-full max-w-[462px] px-[20px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
