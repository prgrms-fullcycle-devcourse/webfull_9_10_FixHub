import { Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import Logo from '@/assets/logo.svg';
import NotificationPopover from '@/components/notifications/NotificationPopover';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value;

      const params = new URLSearchParams();

      value
        .trim()
        .split(/\s+/)
        .forEach((token) => {
          const tokens = token.split(':');
          const key = tokens[0];
          if (key === '') return;
          const value = tokens.slice(1).join(':');
          if (value === '') {
            params.append('title', key);
          } else {
            params.append(key, value);
          }
        });

      navigate(`${location.pathname}?${params.toString()}`);
    }
  };

  return (
    <header className="flex justify-between items-center w-full border-b border-ring py-4 px-15 fixed bg-main-background/50 text-foreground backdrop-blur-[12px] z-50">
      {/* 로고 */}
      <Logo
        className="h-10 w-40 cursor-pointer"
        onClick={() => navigate('/')}
      />

      {/* 검색 */}
      <div className="flex justify-start items-center bg-input w-111.5 h-14.5 rounded-[20px] py-3.5 px-5 gap-3">
        <Search className="w-4 h-4" />
        <input
          type="text"
          className="text-secondary-foreground placeholder-white/50 focus:outline-none text-base"
          placeholder="에러 제목, 태그, 팀, 담당자 검색"
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* 알림, 프로필 / 로그인 버튼 */}
      <div className="flex items-center gap-8">
        {isLoggedIn ? (
          <>
            <NotificationPopover />
            <button
              onClick={() => navigate('/mypage')}
              className="flex justify-end gap-4 items-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-white overflow-hidden">
                <img
                  src={user?.profileImg ?? ''}
                  alt={user?.name ?? '프로필'}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-secondary-foreground text-base">
                {user?.name ?? ''}
              </span>
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-[20px] bg-main-color font-bold text-black typo-semibold-18 text-base font-medium hover:opacity-80 transition-opacity cursor-pointer"
          >
            로그인하기
          </button>
        )}
      </div>
    </header>
  );
}
