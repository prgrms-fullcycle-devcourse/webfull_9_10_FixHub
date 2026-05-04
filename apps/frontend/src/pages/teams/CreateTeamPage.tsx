import { useState } from 'react';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';

import { usePostTeams } from '@/api/generated';

export default function CreateTeamPage() {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');

  const navigate = useNavigate();

  // 팀 생성 mutation
  const { mutate: createTeam, isPending } = usePostTeams({
    mutation: {
      onSuccess: () => {
        // const team = res.data;

        // TODO: 팀 목록 다시 가져오기 (아직 팀 목록 가져오는 기능이 구현되지 않음)
        // queryClient.invalidateQueries({ queryKey: ['teams'] });

        // TODO: 생성된 팀 페이지로 이동
        // navigate(`/teams/${team.teamId}`);
        alert(`팀 생성이 완료되었습니다.`);
        navigate(`/`);
      },
      onError: (error: AxiosError<{ error: { message: string } }>) => {
        const message =
          error?.response?.data?.error?.message ?? '팀 생성에 실패했습니다.';
        alert(message);
      },
    },
  });

  const handleSubmit = () => {
    // TODO: 향후 생성완료/에러에 대한 UI가 필요
    if (!teamName.trim()) {
      alert('팀 이름을 입력해주세요.');
      return;
    }

    createTeam({
      data: {
        name: teamName,
        description: description || undefined,
      },
    });
  };

  return (
    <main className="w-full px-10 py-8">
      <section className="flex flex-col mx-auto max-w-292.5 gap-[102px]">
        <div className="flex flex-col w-full gap-13">
          {/* 헤더 */}
          <div className="flex flex-col gap-4">
            <h1 className="typo-medium-40">팀 생성</h1>
            <p className="typo-regular-20">
              새로운 팀을 만들고 함께 시작하세요.
            </p>
          </div>

          {/* 입력 영역 */}
          <div className="flex flex-col gap-8">
            {/* 팀 이름 */}
            <div className="flex flex-col gap-4">
              <label className="typo-regular-20">팀 이름</label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="팀 이름을 입력하세요."
                className="w-full px-4 py-3 rounded-sm outline-none typo-regular-16
                  transition-all duration-300
                  focus:border-white
                  focus:shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                style={{
                  background: 'var(--surface-input)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* 팀 설명 */}
            <div className="flex flex-col gap-4">
              <label className="typo-regular-20">
                팀 설명 <span className="text-[var(--text-muted)]">(선택)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="팀에 대한 설명을 입력하세요."
                className="w-full h-38 p-5 rounded-sm resize-none outline-none typo-regular-16
                  transition-all duration-300
                  focus:border-white
                  focus:shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                style={{
                  background: 'var(--surface-input)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* 이메일 초대 */}
            <div className="flex flex-col gap-4">
              <label className="typo-regular-20">
                팀원 초대(이메일){' '}
                <span className="text-[var(--text-muted)]">(선택)</span>
              </label>

              <div className="flex gap-4">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소를 입력하세요."
                  className="flex-1 px-5 rounded-sm outline-none typo-regular-16
                    transition-all duration-300
                    focus:border-white
                    focus:shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                  style={{
                    background: 'var(--surface-input)',
                    color: 'var(--text-primary)',
                  }}
                />

                <button
                  type="button"
                  className="px-[32px] py-[18px] rounded-sm border typo-regular-20"
                  style={{
                    borderColor: 'var(--color-white)',
                  }}
                >
                  초대 추가
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div
          className="pt-6 flex justify-end gap-4 border-t border-white/50"
          // style={{ borderTop: '1px solid var(--color-white)' }}
        >
          <div className="flex gap-4">
            <button
              className="py-[18px] px-[32px] h-15 rounded-sm typo-regular-20 cursor-pointer"
              style={{
                background: 'var(--background)',
                color: 'var(--text-primary)',
              }}
            >
              취소하기
            </button>

            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="py-[18px] px-[32px] h-15 rounded-sm typo-regular-20 
                cursor-pointer
                transition-all duration-200 ease-out
                hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              style={{
                background: 'var(--primary)',
                color: 'var(--text-inverse)',
              }}
            >
              {isPending ? '생성 중...' : '생성하기'}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
