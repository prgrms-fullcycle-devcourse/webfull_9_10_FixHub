import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';

import HomeIcon from '@/assets/icons/home.svg';
import CodingBoxIcon from '@/assets/icons/coding-box.svg';
import TeamIcon from '@/assets/icons/team.svg';
import PlusIcon from '@/assets/icons/plus.svg';
import UserIcon from '@/assets/icons/user.svg';
import LogoutIcon from '@/assets/icons/logout.svg';
import ArrowIcon from '@/assets/icons/arrow.svg';

// 추후 수정: api 요청 필요
const teams = ['팀 A', '팀 A', '팀 B'];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isMatch = (path: string) => Boolean(matchPath(path, location.pathname));

  const isIssueWriteActive =
    isMatch('/issues/new') || isMatch('/issues/:issueId/edit');

  const isHomeActive =
    isMatch('/') || (!isIssueWriteActive && isMatch('/issues/:issueId'));

  const isTeamCreationActive = isMatch('/teams/new');

  return (
    <aside
      className="fixed left-0 top-[90px] h-[calc(100vh-90px)] w-[315px]
      bg-main-background/30 text-foreground backdrop-blur-[9px]
      border-r border-white
      py-6
      flex flex-col gap-4
      px-6
    "
    >
      <nav className="flex h-full flex-col gap-4">
        <SidebarItem
          icon={<HomeIcon />}
          label="홈"
          active={isHomeActive}
          onClick={() => navigate('/')}
        />
        <SidebarItem
          icon={<CodingBoxIcon />}
          label="이슈 작성"
          active={isIssueWriteActive}
          onClick={() => navigate('/issues/new')}
        />

        <Divider />

        <section className="flex flex-col gap-[10px]">
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="typo-medium-16 flex w-full items-center justify-between
              m-0
              px-5 py-[10px]
              rounded-sm
              cursor-pointer
          "
          >
            <span>팀 목록</span>
            <ArrowIcon
              className={[
                'transition-transform duration-400 ease-in-out',
                'size-3',
                isOpen ? 'rotate-180' : 'rotate-0',
              ].join(' ')}
            />
          </button>

          <div
            className={[
              'overflow-hidden transition-all duration-400 ease-in-out',
              isOpen ? 'max-h-75 opacity-100' : 'max-h-0 opacity-0',
            ].join(' ')}
          >
            <div
              className={[
                'flex flex-col',
                'transition-all duration-400 ease-in-out',
                isOpen ? 'translate-y-0' : '-translate-y-2',
              ].join(' ')}
            >
              {teams.map((team, index) => (
                <SidebarItem
                  key={`${team}-${index}`}
                  icon={<TeamIcon />}
                  label={team}
                />
              ))}
            </div>
          </div>

          <div>
            <SidebarItem
              icon={<PlusIcon />}
              label="팀 생성"
              active={isTeamCreationActive}
              onClick={() => navigate('/teams/new')}
            />
          </div>
        </section>

        <Divider />

        <SidebarItem icon={<UserIcon />} label="마이페이지" />

        <Divider />

        <SidebarItem icon={<LogoutIcon />} label="로그아웃" />
      </nav>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'm-0',
        'flex w-full items-center gap-[10px]',
        'px-5 py-[10px]',
        'rounded-sm',
        'typo-medium-16 transition-all',
        'cursor-pointer',
        active
          ? 'bg-accent text-foreground font-semibold'
          : 'text-foreground hover:bg-accent hover:text-foreground',
      ].join(' ')}
    >
      <span className="flex size-6 items-center justify-center [&_svg]:size-6 [&_svg]:fill-current">
        {icon}
      </span>

      <span className="truncate">{label}</span>
    </button>
  );
}

function Divider() {
  return <div className="h-px w-full bg-foreground" />;
}
