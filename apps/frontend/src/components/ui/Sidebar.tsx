import { useEffect, useState, type ReactNode } from 'react';
import {
  useLocation,
  useNavigate,
  matchPath,
  useMatch,
} from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import HomeIcon from '@/assets/icons/home.svg';
import CodingBoxIcon from '@/assets/icons/coding-box.svg';
import TeamIcon from '@/assets/icons/team.svg';
import PlusIcon from '@/assets/icons/plus.svg';
import UserIcon from '@/assets/icons/user.svg';
import LogoutIcon from '@/assets/icons/logout.svg';
import ArrowIcon from '@/assets/icons/arrow.svg';
import { useGetTeams, usePostAuthLogout } from '@/api/generated';
import { useAuth } from '@/hooks/useAuth';
import CommonModal from '@/components/ui/CommonModal';

// 팀 목록 스켈레톤
function TeamSkeleton() {
  return (
    <div className="flex items-center gap-[10px] px-5 py-[10px] animate-pulse">
      <div className="size-6 rounded bg-foreground/20" />
      <div className="h-4 w-32 rounded bg-foreground/20" />
    </div>
  );
}

type ModalType = 'login' | 'noTeam' | 'logout' | null;

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const { mutate: logout } = usePostAuthLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        navigate('/login');
      },
      onError: () => {
        queryClient.clear();
        navigate('/login');
      },
    },
  });

  const isMatch = (path: string) => Boolean(matchPath(path, location.pathname));

  const isIssueWriteActive =
    isMatch('/teams/:teamId/issues/new') ||
    isMatch('/teams/:teamId/issues/:issueId/edit');

  const isMyPageActive = isMatch('/mypage');

  const isHomeActive =
    isMatch('/') ||
    (!isIssueWriteActive &&
      !isMyPageActive &&
      isMatch('/teams/:teamId/issues/:issueId'));

  const isTeamPageMatch = useMatch('/teams/:teamId/*');
  const isTeamCreationActive = isMatch('/teams/new');

  const currentTeamId = isTeamPageMatch?.params.teamId;

  // 내가 속한 팀 조회 API
  const { data: teamsResponse, isLoading, isError, error } = useGetTeams();

  useEffect(() => {
    if (isError) {
      console.error('useGetTeams ERROR:', error);
    }
  }, [isError, error]);

  const teams =
    teamsResponse &&
    'data' in teamsResponse &&
    Array.isArray(teamsResponse.data)
      ? teamsResponse.data
      : [];

  // 로그인 체크 공통 유틸
  const requireLogin = () => {
    if (!isLoggedIn) {
      setActiveModal('login');
      return false;
    }
    return true;
  };

  const handleMyPage = () => {
    if (requireLogin()) navigate('/mypage');
  };
  const handleTeamCreation = () => {
    if (requireLogin()) navigate('/teams/new');
  };
  const handleIssueWrite = () => {
    if (!requireLogin()) return;
    if (teams.length === 0) {
      setActiveModal('noTeam');
      return;
    }
    navigate(`/teams/${teams[0].teamId}/issues/new`);
  };

  return (
    <>
      <aside
        className="fixed left-0 top-[90px] h-[calc(100vh-90px)] w-[315px]
        bg-main-background/30 text-foreground backdrop-blur-[9px]
        border-r border-white
        py-6
        flex flex-col gap-4
        px-6"
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
            onClick={handleIssueWrite}
          />

          <Divider />

          <section className="flex flex-col gap-[10px]">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="typo-medium-16 flex w-full items-center justify-between
                m-0 
                px-5 py-[10px] 
                rounded-sm 
                cursor-pointer"
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
                {isLoading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <TeamSkeleton key={i} />
                  ))}
                {teams.map((team) => (
                  <SidebarItem
                    key={team.teamId}
                    icon={<TeamIcon />}
                    active={currentTeamId === team.teamId}
                    label={team.name}
                    onClick={() => navigate(`/teams/${team.teamId}`)}
                  />
                ))}
              </div>
            </div>

            <div>
              <SidebarItem
                icon={<PlusIcon />}
                label="팀 생성"
                active={isTeamCreationActive}
                onClick={handleTeamCreation}
              />
            </div>
          </section>

          <Divider />

          <SidebarItem
            icon={<UserIcon />}
            label="마이페이지"
            active={isMyPageActive}
            onClick={handleMyPage}
          />

          {isLoggedIn && (
            <>
              <Divider />
              <SidebarItem
                icon={<LogoutIcon />}
                label="로그아웃"
                onClick={() => setActiveModal('logout')}
              />
            </>
          )}
        </nav>
      </aside>

      <CommonModal
        isOpen={activeModal === 'login'}
        title="로그인이 필요합니다"
        description="해당 기능은 로그인 후 이용할 수 있습니다."
        confirmText="로그인하기"
        cancelText="취소"
        onClose={() => setActiveModal(null)}
        onConfirm={() => {
          setActiveModal(null);
          navigate('/login');
        }}
      />
      <CommonModal
        isOpen={activeModal === 'noTeam'}
        title="팀이 없습니다"
        description="이슈 작성은 팀에 속한 후 이용할 수 있습니다."
        confirmText="팀 생성하기"
        cancelText="취소"
        onClose={() => setActiveModal(null)}
        onConfirm={() => {
          setActiveModal(null);
          navigate('/teams/new');
        }}
      />
      <CommonModal
        isOpen={activeModal === 'logout'}
        title="로그아웃"
        description="정말로 로그아웃 하시겠습니까?"
        confirmText="로그아웃"
        cancelText="취소"
        onClose={() => setActiveModal(null)}
        onConfirm={() => {
          setActiveModal(null);
          logout();
        }}
      />
    </>
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
