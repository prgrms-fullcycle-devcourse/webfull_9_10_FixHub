import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { SocialLoginButton } from '@/components/auth/SocialLoginButton';
import { usePostAuthSignup } from '@/api/generated';
import { validateSignup, parseAuthError } from './AuthValidation';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const { mutate: signup, isPending } = usePostAuthSignup({
    mutation: {
      onSuccess: (data) => {
        console.log('회원가입 성공:', data.user);
        navigate('/login');
      },
      onError: (error) => {
        setErrorMessage(parseAuthError(error));
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const validationError = validateSignup(
      name,
      email,
      password,
      passwordConfirm,
    );
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    signup({ data: { name, email, password } });
  };

  return (
    <>
      <form className="space-y-[32px]" onSubmit={handleSubmit} noValidate>
        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">이름</label>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrorMessage('');
            }}
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>
        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">이메일</label>
          <input
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage('');
            }}
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>
        <div className="space-y-[10px]">
          <label className="block typo-regular-16 text-white">비밀번호</label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage('');
            }}
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
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              setErrorMessage('');
            }}
            className="h-[66px] w-full rounded-[8px] border-none bg-input-background px-[20px] text-white placeholder:text-white/30 focus:outline-none typo-regular-14"
          />
        </div>

        {errorMessage && (
          <p className="text-red-400 text-sm typo-regular-14">{errorMessage}</p>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="mt-2 h-[69px] w-full rounded-[8px] bg-main-color font-bold text-black typo-semibold-18"
        >
          {isPending ? '처리 중...' : '회원가입'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/40" />
        <span className="text-xs text-white/40 typo-regular-14">또는</span>
        <span className="h-px flex-1 bg-white/40" />
      </div>

      <SocialLoginButton variant="signup" />

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
