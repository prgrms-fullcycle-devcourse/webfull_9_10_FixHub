import axios from 'axios';

export interface PublicIssueItem {
  id: string;
  title: string;
  teamName: string;
  author: string;
  tags: string[];
  summary: string;
  commentCount: number;
  createdAt: string;
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

export const getPublicIssues = async (page = 1, limit = 20) => {
  const response = await axios.get<GetPublicIssuesResponse>(
    `${import.meta.env.VITE_API_BASE_URL}/issues/public`,
    {
      params: {
        page,
        limit,
      },
      withCredentials: true,
    },
  );

  return response.data;
};
