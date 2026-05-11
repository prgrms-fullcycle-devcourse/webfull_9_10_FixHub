import { useState, useRef } from 'react';
import { Camera, User, Eye, EyeOff } from 'lucide-react';

import { useUpdateMyProfile } from '@/api/generated';
import type { GetMyProfile200, UpdateMyProfileBody } from '@/api/generated';
import CommonModal from '@/components/ui/CommonModal';
import { cn } from '@/utils/utils';

interface EditProfileModalProps {
  isOpen: boolean;
  profile: GetMyProfile200;
  onClose: () => void;
  onUpdated: () => void;
}

const inputCls =
  'w-full rounded-xl bg-(--surface-input) border border-white/5 px-4 py-3.5 typo-regular-14 text-(--text-primary) placeholder:text-(--text-muted)/30 outline-none focus:border-(--primary)/50 focus:ring-1 focus:ring-(--primary)/30 transition-all';
const labelCls =
  'typo-semibold-18 text-(--text-primary) mb-2.5 flex items-center gap-2';
const sectionCls =
  'bg-(--surface-panel) rounded-2xl p-6 border border-white/5 shadow-sm';
const errorTextCls =
  'mt-2 flex items-center gap-1 typo-regular-14 text-(--status-error)';

// 비밀번호 인풋
function PasswordInput({
  value,
  onChange,
  placeholder,
  isError,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isError?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative group">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          inputCls,
          'pr-12',
          isError && 'border-(--status-error)/50 focus:border-(--status-error)',
        )}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-(--text-muted) hover:text-(--primary) transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default function EditProfileModal({
  isOpen,
  profile,
  onClose,
  onUpdated,
}: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [profileImg, setProfileImg] = useState<string | null>(
    profile.profileImg ?? null,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPw, setCurrentPw] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutate, isPending } = useUpdateMyProfile({
    mutation: {
      onSuccess: () => {
        onUpdated();
        onClose();
      },
      onError: () => {
        setError('수정에 실패했습니다. 입력값을 다시 확인해주세요.');
      },
    },
  });

  // 유효성 검사
  const isNameValid = name.trim().length >= 2;

  const isPasswordInputting = currentPw || nextPw || confirmPw;
  const isNextPwValid = nextPw.length >= 8;
  const isConfirmPwMatch = nextPw === confirmPw;
  const isCurrentPwEntered = currentPw.length >= 1;

  const isPasswordValid =
    isCurrentPwEntered && isNextPwValid && isConfirmPwMatch;

  const canSubmit =
    !isPending && isNameValid && (!isPasswordInputting || isPasswordValid);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setProfileImg(objectUrl);
  };

  const handleSubmit = () => {
    setError(null);
    if (!canSubmit) return;

    const body: UpdateMyProfileBody = {};

    if (name.trim() !== profile.name) body.name = name.trim();
    if (profileImg !== profile.profileImg) body.profileImg = profileImg;

    if (isPasswordInputting) {
      body.password = { current: currentPw, next: nextPw };
    }

    if (Object.keys(body).length === 0) {
      onClose();
      return;
    }

    mutate({ data: body });
  };

  const modalContent = (
    <div className="flex flex-col gap-8 text-left py-2">
      <section className={sectionCls}>
        <div className="flex items-start gap-6 mb-2">
          <div className="relative group shrink-0 mt-1">
            <div className="w-24 h-24 rounded-3xl bg-(--surface-input) overflow-hidden border-2 border-white/10 group-hover:border-(--primary)/50 transition-all shadow-inner">
              {(previewUrl ?? profileImg) ? (
                <img
                  src={previewUrl ?? profileImg ?? ''}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-(--text-muted)/20">
                  <User size={40} />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -right-2 -bottom-2 w-9 h-9 rounded-full bg-(--primary) text-(--primary-foreground) flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
            >
              <Camera size={18} />
            </button>
          </div>
          <div className="flex-1">
            <label className={labelCls}>이름 변경</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요 (2자 이상)"
              className={cn(
                inputCls,
                !isNameValid && name.length > 0 && 'border-(--status-error)/50',
              )}
            />
            {!isNameValid && name.length > 0 && (
              <p className={errorTextCls}>이름은 2자 이상이어야 합니다.</p>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={handleFileChange}
        />
      </section>

      <section className={cn(sectionCls, 'space-y-5')}>
        <h3 className={labelCls}>비밀번호 변경</h3>
        <div className="grid gap-4">
          <div>
            <p className="typo-regular-14 text-(--text-muted) mb-1.5 ml-1">
              현재 비밀번호
            </p>
            <PasswordInput
              value={currentPw}
              onChange={setCurrentPw}
              placeholder="기존 비밀번호 입력"
              isError={!!(isPasswordInputting && !isCurrentPwEntered)}
            />
            {isPasswordInputting && !isCurrentPwEntered && (
              <p className={errorTextCls}>
                {' '}
                비밀번호를 변경하려면 현재 비밀번호가 필요합니다.
              </p>
            )}
          </div>
          <div className="h-px bg-white/5 my-1" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="typo-regular-14 text-(--text-muted) mb-1.5 ml-1">
                새 비밀번호
              </p>
              <PasswordInput
                value={nextPw}
                onChange={setNextPw}
                placeholder="8자 이상"
                isError={nextPw.length > 0 && !isNextPwValid}
              />
              {nextPw.length > 0 && !isNextPwValid && (
                <p className={errorTextCls}> 8자 이상 입력해주세요.</p>
              )}
            </div>
            <div>
              <p className="typo-regular-14 text-(--text-muted) mb-1.5 ml-1">
                새 비밀번호 확인
              </p>
              <PasswordInput
                value={confirmPw}
                onChange={setConfirmPw}
                placeholder="동일하게 입력"
                isError={confirmPw.length > 0 && !isConfirmPwMatch}
              />
              {confirmPw.length > 0 && !isConfirmPwMatch && (
                <p className={errorTextCls}> 비밀번호가 일치하지 않습니다.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="p-4 rounded-xl bg-(--status-error)/10 border border-(--status-error)/20 text-(--status-error) text-center typo-regular-14">
          {error}
        </div>
      )}
    </div>
  );

  return (
    <CommonModal
      isOpen={isOpen}
      title="회원 정보 수정"
      description={modalContent}
      icon={
        <div className="bg-(--primary) p-3 rounded-2xl text-(--primary-foreground) shadow-(--shadow)">
          <User size={28} />
        </div>
      }
      confirmText={isPending ? '처리 중...' : '변경사항 저장하기'}
      cancelText="닫기"
      onClose={onClose}
      onConfirm={handleSubmit}
      className="max-w-[520px] bg-(--background)"
      descriptionClassName="max-w-full"
      confirmButtonClassName={cn(
        'h-12 rounded-xl text-(--primary-foreground) font-bold transition-all',
        !canSubmit
          ? 'bg-white/10 text-white/20 cursor-not-allowed opacity-50'
          : 'bg-(--primary) hover:brightness-110 active:scale-95',
      )}
      cancelButtonClassName="h-12 rounded-xl bg-(--secondary) text-(--secondary-foreground) border border-white/5 hover:bg-white/10"
    />
  );
}
