import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

export default function SignupPage() {
  return (
    <>
      <form className="space-y-[32px]">
        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">이름</label>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>
        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>
        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>
        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">
            비밀번호 확인
          </label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>

        <Button
          type="submit"
          className="mt-2 h-[69px] w-full rounded-[8px] bg-main-color font-bold text-black typo-semibold-18"
        >
          회원가입
        </Button>
      </form>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/40" />
        <span className="text-xs text-white/40 typo-regular-14">또는</span>
        <span className="h-px flex-1 bg-white/40" />
      </div>

      <Button
        type="button"
        className="flex h-[69px] w-full rounded-[8px] items-center justify-center gap-[12px] rounded-[8px] bg-black text-white"
      >
        GitHub으로 회원가입
        <GithubIcon className="h-[31px] w-[31px] shrink-0" />
      </Button>

      <p className="mt-5 text-center text-sm text-white typo-regular-14">
        이미 계정이 있으신가요?{' '}
        <Link
          to="/login"
          className="font-bold text-white underline underline-offset-2 typo-regular-14"
        >
          로그인
        </Link>
      </p>
    </>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ width: '100%', height: '100%' }}
      >
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    </div>
  );
}
