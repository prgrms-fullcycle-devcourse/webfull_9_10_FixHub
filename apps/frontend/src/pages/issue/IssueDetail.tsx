import { CalendarDays, Globe2, SquarePen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useGetComments,
  useGetTeamsTeamIdIssuesIssueId,
  type GetComments200DataItem,
  type GetComments200DataItemRepliesItem,
  GetTeamsTeamIdIssuesIssueId200Status,
} from '@/api/generated';
import IssueCommentComposer from '@/components/comments/IssueCommentComposer';
import IssueCommentList, {
  type IssueCommentItem,
} from '@/components/comments/IssueCommentList';
import IssueDeleteButton from '@/pages/issue/IssueDeleteButton';
import IssueMarkdown from '@/components/issues/IssueMarkdown';

type ApiCommentItem =
  | GetComments200DataItem
  | GetComments200DataItemRepliesItem;

function mapCommentToIssueCommentItem(
  comment: ApiCommentItem,
  isReply: boolean,
): IssueCommentItem {
  return {
    id: comment.id,
    author: {
      id: comment.author.id,
      name: comment.author.name,
    },
    selected: comment.isAdopted,
    isReply,
    text: comment.content,
    createdAt: comment.createdAt,
  };
}

function IssueDetail() {
  const navigate = useNavigate();
  const { issueId, teamId } = useParams();

  const {
    data: issue,
    isPending: isIssuePending,
    isError: isIssueError,
  } = useGetTeamsTeamIdIssuesIssueId(teamId ?? '', issueId ?? '', {
    query: {
      enabled: Boolean(teamId && issueId),
    },
  });

  const {
    data: commentsResponse,
    isPending: isCommentsPending,
    isError: isCommentsError,
  } = useGetComments(issueId ?? '', {
    query: {
      enabled: Boolean(issueId),
      refetchOnMount: 'always',
    },
  });

  if (isIssuePending || !issue) {
    return (
      <section className="w-full flex-1 px-[60px] pt-[60px] pb-[60px] text-(--text-primary)">
        <div className="py-10 text-center typo-regular-14 text-(--text-secondary)">
          불러오는 중...
        </div>
      </section>
    );
  }

  if (isIssueError) {
    return (
      <section className="w-full flex-1 px-[60px] pt-[60px] pb-[60px] text-(--text-primary)">
        <div className="py-10 text-center typo-regular-14 text-(--status-error)">
          이슈 상세 정보를 불러오지 못했습니다.
        </div>
      </section>
    );
  }

  const isPublic = issue.isPublic;
  const visibilityText = isPublic ? '전체공개' : '비공개';
  const isIssueAuthor = 'isAuthor' in issue ? issue.isAuthor === true : false;

  const comments: IssueCommentItem[] =
    commentsResponse?.data.flatMap((comment) => [
      mapCommentToIssueCommentItem(comment, false),
      ...comment.replies.map((reply) =>
        mapCommentToIssueCommentItem(reply, true),
      ),
    ]) ?? [];

  const statusClass =
    issue.status === GetTeamsTeamIdIssuesIssueId200Status.SOLVED
      ? 'bg-(--status-solved) text-success-foreground'
      : 'bg-(--status-unsaved) text-(--text-primary)';

  const statusText =
    issue.status === GetTeamsTeamIdIssuesIssueId200Status.SOLVED
      ? '해결'
      : '미해결';

  const requestInfoText =
    issue.logs
      .filter((log) => log.logType === 'RECEIVED')
      .map((log) => log.message)
      .join('\n\n') || '요청 정보가 없습니다.';

  return (
    <section className="relative grid min-h-[calc(100vh-90px)] w-full flex-1 gap-[60px] overflow-hidden px-[60px] pt-[60px] pb-[60px] text-(--text-primary) min-[1334px]:grid-cols-[minmax(0,1fr)_410px]">
      <div className="relative z-10 flex flex-col gap-[60px]">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <h1 className="typo-semibold-18 text-(--text-primary)">
                {issue.title}
              </h1>

              <span
                className={`rounded-full px-4 py-1 typo-regular-14 ${statusClass}`}
              >
                {statusText}
              </span>
            </div>

            <div className="flex gap-3">
              {issue.tag.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm bg-(--surface-tag) px-5 py-2.5 typo-regular-14 text-(--text-primary)"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 typo-regular-14 text-(--text-primary)">
              <Globe2 size={24} />
              <span>{visibilityText}</span>
            </div>
          </div>

          {isIssueAuthor && (
            <div className="flex items-center gap-5">
              <IssueDeleteButton teamId={teamId} issueId={issueId} />

              <button
                type="button"
                onClick={() =>
                  navigate(`/teams/${teamId}/issues/${issueId}/edit`)
                }
                className="flex h-16 w-20 cursor-pointer items-center justify-center rounded-md bg-(--surface-overlay) text-(--text-primary) shadow-(--shadow) hover:bg-(--surface-selected)"
                aria-label="수정"
              >
                <SquarePen size={30} strokeWidth={1.7} />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between typo-regular-14 text-(--text-secondary)">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-(--surface-selected)" />
            <span>{issue.author}</span>
          </div>

          <div className="flex items-center gap-2 typo-regular-14 text-(--text-primary)">
            <CalendarDays size={22} strokeWidth={1.8} />
            <span>-</span>
          </div>
        </div>

        <div className="min-h-47.5 rounded-md bg-(--surface-panel) p-7">
          <IssueMarkdown content={issue.content} />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <h2 className="mb-3 typo-semibold-18 text-(--text-primary)">
              에러 로그
            </h2>

            <div className="h-57.5 rounded-md bg-(--surface-panel) p-5 typo-regular-14 text-(--text-secondary) whitespace-pre-wrap">
              {issue.errorLog || '에러 로그가 없습니다.'}
            </div>
          </div>

          <div>
            <h2 className="mb-3 typo-semibold-18 text-(--text-primary)">
              요청 정보
            </h2>

            <div className="h-57.5 rounded-md bg-(--surface-panel) p-5 typo-regular-14 text-(--text-secondary) whitespace-pre-wrap">
              {requestInfoText}
            </div>
          </div>
        </div>
      </div>

      <div className="min-[1334px]:col-start-2 min-[1334px]:row-span-2">
        {isCommentsPending ? (
          <aside className="relative z-10 rounded-lg bg-(--surface-panel) p-5 typo-regular-14 text-(--text-secondary)">
            댓글을 불러오는 중입니다.
          </aside>
        ) : isCommentsError ? (
          <aside className="relative z-10 rounded-lg bg-(--surface-panel) p-5 typo-regular-14 text-(--status-error)">
            댓글 목록을 불러오지 못했습니다.
          </aside>
        ) : (
          <IssueCommentList
            comments={comments}
            currentUserId=""
            isIssueAuthor={isIssueAuthor}
            issueId={issueId ?? ''}
          />
        )}
      </div>

      <div className="min-[1334px]:col-start-1">
        <IssueCommentComposer issueId={issueId ?? ''} />
      </div>
    </section>
  );
}

export default IssueDetail;
