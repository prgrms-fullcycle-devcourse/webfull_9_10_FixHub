import { Bell, Search } from 'lucide-react';

import Logo from '@/assets/logo.svg';

export default function Header() {
  return (
    <header className="flex justify-between items-center w-full border-b border-ring py-4 px-15 sticky z-50">
      {/* 로고 */}
      <Logo className="h-10 w-40" />

      {/* 검색 */}
      <div className="flex justify-start items-center bg-input w-111.5 h-14.5 rounded-[20px] py-3.5 px-5 gap-3">
        <Search className="w-4 h-4" />
        <input
          type="text"
          className="text-secondary-foreground placeholder-white/50 focus:outline-none text-base"
          placeholder="에러 제목, 태그, 팀, 담당자 검색"
        />
      </div>

      {/* 알림, 프로필 */}
      <div className="flex items-center gap-8">
        <div className="relative">
          <span className="absolute inline-block rounded-full bg-destructive w-[1.1rem] h-[1.1rem] text-center text-secondary-foreground -right-0.75 -top-1.25 text-xs">
            1
          </span>
          <Bell className="w-8 h-8" />
        </div>
        <div className="flex justify-end gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-white">
            <img src="" alt="" />
          </div>
          <span className="text-secondary-foreground text-base">김이름</span>
        </div>
      </div>
    </header>
  );
}
