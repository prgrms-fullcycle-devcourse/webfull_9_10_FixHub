import type { IssueStatus } from '../types/issue';

export interface PublicIssueItem {
  id: string;
  title: string;
  teamName: string;
  author: string;
  tags: string[];
  summary: string;
  commentCount: number;
  createdAt: string;
  status?: IssueStatus;
}

export interface GetPublicIssuesResponse {
  meta: {
    totalItemCount: number;
    currentItemCount: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
  };
  data: PublicIssueItem[];
}

export const getPublicIssues = async (page = 1, limit = 10) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL 값이 없습니다.');
  }

  const response = await fetch(
    `${baseUrl}/issues/public?page=${page}&limit=${limit}`,
    {
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(`최신 이슈 피드 조회 실패: ${response.status}`);
  }

  const contentType = response.headers.get('content-type');

  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('백엔드에서 JSON이 아닌 응답을 반환했습니다.');
  }

  return response.json() as Promise<GetPublicIssuesResponse>;
};
