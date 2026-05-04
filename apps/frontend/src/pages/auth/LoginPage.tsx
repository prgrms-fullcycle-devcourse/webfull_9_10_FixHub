import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { SocialLoginButton } from '@/components/auth/SocialLoginButton';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <form className="space-y-[32px]">
        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>

        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>

        <Button
          type="submit"
          className="mt-2 h-[69px] w-full rounded-[8px] bg-main-color font-bold text-black typo-semibold-18"
        >
          로그인
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/40" />
        <span className="text-xs text-white/40 typo-regular-14">또는</span>
        <span className="h-px flex-1 bg-white/40" />
      </div>

      <SocialLoginButton variant="login" />

      <p className="mt-5 text-center text-sm text-white typo-regular-14">
        계정이 없으신가요?{' '}
        <Link
          to="/signup"
          className="font-bold text-white underline underline-offset-2 typo-regular-14"
        >
          회원가입
        </Link>
      </p>
    </>
  );
}
