import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import Logo from '@/assets/Logo_Login.svg';
import CommonModal from '@/components/ui/CommonModal';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [modalDismissed, setModalDismissed] = useState(false);

  const isOnboardingPage = location.pathname === '/signup/name';

  if (isLoading) return null;

  const handleGoHome = () => {
    setModalDismissed(true);
    navigate('/', { replace: true });
  };

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

      <CommonModal
        isOpen={isLoggedIn && !modalDismissed && !isOnboardingPage}
        title="이미 로그인 상태입니다"
        description="현재 로그인된 계정이 있습니다. 홈으로 이동합니다."
        confirmText="홈으로 이동"
        showCancelButton={false}
        closeOnBackdropClick={false}
        onClose={handleGoHome}
        onConfirm={handleGoHome}
      />
    </div>
  );
}
