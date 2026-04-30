import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // TODO: 백엔드 API 연동 시 이름, 이메일 업데이트 로직 추가
    console.log('설정된 이름:', name);
    navigate('/');
  };

  return (
    <>
      <div className="mb-[40px] text-center">
        <h1 className="typo-medium-40 text-white mb-8">반갑습니다!</h1>
        <p className="typo-regular-16 text-white">
          FixHub에서 사용할 이름, 이메일을 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleComplete} className="space-y-[32px]">
        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">이름</label>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>
        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>

        <Button
          type="submit"
          className="mt-2 h-[69px] w-full rounded-[8px] bg-main-color font-bold text-black typo-semibold-18"
        >
          시작하기
        </Button>
      </form>
    </>
  );
}
