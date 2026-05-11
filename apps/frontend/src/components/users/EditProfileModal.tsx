import { useState } from 'react';
import { X } from 'lucide-react';

import { useUpdateMyProfile } from '@/api/generated';
import type { GetMyProfile200, UpdateMyProfileBody } from '@/api/generated';

interface EditProfileModalProps {
  isOpen: boolean;
  profile: GetMyProfile200;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditProfileModal({
  isOpen,
  profile,
  onClose,
  onUpdated,
}: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [profileImg, setProfileImg] = useState(profile.profileImg ?? '');
  const [currentPw, setCurrentPw] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useUpdateMyProfile({
    mutation: {
      onSuccess: () => {
        onUpdated();
        onClose();
      },
      onError: () => {
        setError('프로필 수정에 실패했습니다. 입력값을 확인해주세요.');
      },
    },
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    setError(null);

    const body: UpdateMyProfileBody = {};

    if (name.trim() && name !== profile.name) body.name = name.trim();

    const imgValue = profileImg.trim() || null;
    if (imgValue !== profile.profileImg) body.profileImg = imgValue;

    if (currentPw && nextPw) {
      body.password = { current: currentPw, next: nextPw };
    }

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    mutate({ data: body });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl bg-[#1e1e38] border border-white/10 p-8 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-white/10 transition"
        >
          <X size={20} />
        </button>

        <h2 className="typo-bold-20 mb-6">프로필 수정</h2>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="typo-regular-14 text-white/60">
              프로필 이미지 URL
            </label>
            <input
              type="text"
              value={profileImg}
              onChange={(e) => setProfileImg(e.target.value)}
              placeholder="https://example.com/profile.png"
              className="w-full rounded-lg bg-[#292947] px-4 py-3 typo-regular-14 text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#fff835]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="typo-regular-14 text-white/60">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full rounded-lg bg-[#292947] px-4 py-3 typo-regular-14 text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#fff835]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="typo-regular-14 text-white/60">
              현재 비밀번호 (변경 시에만 입력)
            </label>
            <input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="현재 비밀번호"
              className="w-full rounded-lg bg-[#292947] px-4 py-3 typo-regular-14 text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#fff835]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="typo-regular-14 text-white/60">새 비밀번호</label>
            <input
              type="password"
              value={nextPw}
              onChange={(e) => setNextPw(e.target.value)}
              placeholder="새 비밀번호 (8자 이상)"
              className="w-full rounded-lg bg-[#292947] px-4 py-3 typo-regular-14 text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-[#fff835]"
            />
          </div>

          {error && <p className="typo-regular-14 text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/20 py-3 typo-medium-16 cursor-pointer hover:bg-white/5 transition"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex-1 rounded-lg bg-[#fff835] py-3 typo-medium-16 text-black cursor-pointer hover:opacity-90 transition disabled:opacity-50"
            >
              {isPending ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
