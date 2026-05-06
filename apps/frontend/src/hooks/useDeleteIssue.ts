import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DeleteIssueParams {
  teamId: string;
  issueId: string;
}

interface DeleteIssueResponse {
  success: boolean;
}

const deleteIssue = async ({
  teamId,
  issueId,
}: DeleteIssueParams): Promise<DeleteIssueResponse> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL 값이 없습니다.');
  }

  const response = await fetch(`${baseUrl}/teams/${teamId}/issues/${issueId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');

  if (!response.ok) {
    if (isJson) {
      const errorData = (await response.json()) as {
        error?: { message?: string };
      };

      throw new Error(errorData.error?.message ?? '이슈 삭제에 실패했습니다.');
    }

    throw new Error(`이슈 삭제에 실패했습니다. (${response.status})`);
  }

  if (!isJson) {
    return { success: true };
  }

  return response.json() as Promise<DeleteIssueResponse>;
};

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteIssue,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['publicIssues'],
      });
    },
  });
}
