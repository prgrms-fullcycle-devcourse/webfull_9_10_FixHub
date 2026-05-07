export function validateLogin(email: string, password: string): string | null {
  if (!email.trim()) return '이메일을 입력해주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return '올바른 이메일 형식이 아닙니다.';
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
  return null;
}

export function validateSignup(
  name: string,
  email: string,
  password: string,
  passwordConfirm: string,
): string | null {
  if (!name.trim()) return '이름을 입력해주세요.';
  if (name.trim().length < 2) return '이름은 2자 이상 입력해주세요.';
  if (!email.trim()) return '이메일을 입력해주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return '올바른 이메일 형식이 아닙니다.';
  if (!password) return '비밀번호를 입력해주세요.';
  if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
  if (!passwordConfirm) return '비밀번호 확인을 입력해주세요.';
  if (password !== passwordConfirm) return '비밀번호가 일치하지 않습니다.';
  return null;
}

// 백엔드 에러 응답에서 메시지 꺼내는 헬퍼
export function parseAuthError(error: unknown): string {
  const e = error as {
    response?: { status?: number; data?: { error?: { message?: string } } };
  };
  const status = e.response?.status;
  const serverMessage = e.response?.data?.error?.message;

  if (!e.response)
    return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
  if (status === 401) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (status === 409) return '이미 사용 중인 이메일입니다.';
  if (status === 400) return serverMessage ?? '입력 정보를 다시 확인해주세요.';
  return '오류가 발생했습니다. 다시 시도해주세요.';
}
