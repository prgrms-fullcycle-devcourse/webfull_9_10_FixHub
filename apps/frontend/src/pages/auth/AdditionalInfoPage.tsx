import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { useUpdateMyProfile, getGetMyProfileQueryKey } from '@/api/generated';
import { validateAdditionalInfo } from '@/utils/validations/AuthValidation';

export default function OnboardingPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: updateProfile, isPending } = useUpdateMyProfile({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetMyProfileQueryKey(),
        });
      },
      onError: (error) => {
        console.error('Profile update error:', error);
        const message =
          error.response?.data?.error?.message ||
          '정보 업데이트 중 오류가 발생했습니다.';
        setErrorMessage(message);
      },
    },
  });

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const validationError = validateAdditionalInfo(name, email);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    // PATCH /users/me 호출
    updateProfile({
      data: {
        name,
        email,
      },
    });

    console.log('설정된 이름:', name);
    navigate('/');
  };

  return (
    <>
      <div className="mb-[40px] text-center">
        <h1 className="typo-medium-40 text-white mb-8">반갑습니다!</h1>
        <p className="typo-regular-16 text-white">
          FixHub에서 사용할 이름, 이메일을 입력해주세요.
          <br />
          이메일은 이후에 수정할 수 없습니다.
        </p>
      </div>

      <form onSubmit={handleComplete} className="space-y-[32px]" noValidate>
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
            onChange={(e) => {
              setEmail(e.target.value);
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
          {isPending ? '처리 중...' : '시작하기'}
        </Button>
      </form>
    </>
  );
}
