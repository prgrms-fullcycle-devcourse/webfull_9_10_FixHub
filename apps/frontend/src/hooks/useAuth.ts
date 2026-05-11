import { useGetMyProfile } from '@/api/generated';

/**
 * 현재 로그인 상태와 사용자 정보를 반환합니다.
 *
 * - isLoggedIn: 로그인 여부 (프로필 조회 성공 시 true)
 * - isLoading:  초기 인증 상태 확인 중 여부
 * - user:       로그인한 사용자 정보 (비로그인 시 undefined)
 */

export function useAuth() {
  const {
    data: user,
    isLoading,
    isError,
  } = useGetMyProfile({
    query: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5분 캐시
    },
  });

  return {
    isLoggedIn: !isError && !!user,
    isLoading,
    user,
  };
}
