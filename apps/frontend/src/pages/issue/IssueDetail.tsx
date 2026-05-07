import { CalendarDays, Globe2, SquarePen } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  useGetComments,
  type GetComments200DataItem,
  type GetComments200DataItemRepliesItem,
} from '@/api/generated';
import IssueCommentComposer from '@/components/comments/IssueCommentComposer';
import IssueCommentList, {
  type IssueCommentItem,
} from '@/components/comments/IssueCommentList';
import IssueDeleteButton from '@/pages/issue/IssueDeleteButton';

type ApiCommentItem =
  | GetComments200DataItem
  | GetComments200DataItemRepliesItem;

function mapCommentToIssueCommentItem(
  comment: ApiCommentItem,
  isReply: boolean,
): IssueCommentItem {
  return {
    id: comment.id,
    // TODO: 댓글 목록 API에서 authorId를 내려주면 author 대신 authorId로 교체합니다.
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
  // TODO: 이슈 상세 API 연결 전까지 임시로 데이터를 불러오기위함
  // const { issueId, teamId } = useParams();
  const issueId = 'dbca8c89-674b-4e33-ab57-1b757152327c';
  const { teamId } = useParams();

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

  const isPublic = false;
  const visibilityText = isPublic ? '전체공개' : '비공개';
  const currentUserId = '019e0177-c468-7adf-a877-d668b1b4f6a3'; // TODO: 채택 뷰 테스트용 로그인된 사용자 id
  const isIssueAuthor =
    currentUserId === '019e0177-c468-7adf-a877-d668b1b4f6a3'; // TODO: 채택 뷰 테스트용 해당 이슈의 작성자인지 여부

  const comments: IssueCommentItem[] =
    commentsResponse?.data.flatMap((comment) => [
      mapCommentToIssueCommentItem(comment, false),
      ...comment.replies.map((reply) =>
        mapCommentToIssueCommentItem(reply, true),
      ),
    ]) ?? [];

  return (
    <section className="relative grid min-h-[calc(100vh-90px)] w-full flex-1 gap-[60px] overflow-hidden px-[60px] pt-[60px] pb-[60px] text-(--text-primary) min-[1334px]:grid-cols-[minmax(0,1fr)_410px]">
      <div className="relative z-10 flex flex-col gap-[60px]">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <h1 className="typo-semibold-18 text-(--text-primary)">
                로그인 시 500 에러 발생
              </h1>

              <span className="rounded-full bg-(--status-solved) px-4 py-1 typo-regular-14 text-success-foreground">
                해결
              </span>
            </div>

            <div className="flex gap-3">
              <span className="rounded-sm bg-(--surface-tag) px-5 py-2.5 typo-regular-14 text-(--text-primary)">
                Axios
              </span>

              <span className="rounded-sm bg-(--surface-tag) px-5 py-2.5 typo-regular-14 text-(--text-primary)">
                JavaScript
              </span>
            </div>

            <div className="flex items-center gap-3 typo-regular-14 text-(--text-primary)">
              <Globe2 size={24} />
              <span>{visibilityText}</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <IssueDeleteButton teamId={teamId} issueId={issueId} />

            <button
              type="button"
              onClick={() => navigate(`/issues/${issueId}/edit`)}
              className="flex h-16 w-20 cursor-pointer items-center justify-center rounded-md bg-(--surface-overlay) text-(--text-primary) shadow-(--shadow) hover:bg-(--surface-selected)"
              aria-label="수정"
            >
              <SquarePen size={30} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <div className="flex justify-between typo-regular-14 text-(--text-secondary)">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-white" />
            <span>김이름</span>
          </div>

          <div className="flex items-center gap-2 typo-regular-14 text-(--text-primary)">
            <CalendarDays size={22} strokeWidth={1.8} />
            <span>2026-04-25(토)</span>
          </div>
        </div>

        <div className="min-h-47.5 rounded-md bg-(--surface-panel) p-7 typo-regular-14 leading-8 text-(--text-primary)">
          네트워크단 Description에 여기서 나타내는 내용으로 입력합니다. 500에서
          에러가 발생합니다. 내용을 넣습니다 Description에 여기서 나타내는
          내용으로 넣습니다. 500에서 에러가 발생합니다. 내용을 넣습니다
          Description에 여기서 나타내는 내용으로 넣습니다. 500에서 에러가
          발생합니다. 내용입니다. TTT
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <h2 className="mb-3 typo-semibold-18 text-(--text-primary)">
              에러 로그
            </h2>

            <div className="h-57.5 rounded-md bg-(--surface-panel) p-5 typo-regular-14 text-(--text-secondary)">
              {'{여기는 에러로그에 시도하며 자동 코드가 보였야 할 영역입니다}'}
            </div>
          </div>

          <div>
            <h2 className="mb-3 typo-semibold-18 text-(--text-primary)">
              요청 정보
            </h2>

            <div className="h-57.5 rounded-md bg-(--surface-panel) p-5 typo-regular-14 text-(--text-secondary)">
              {
                '{여기는 클라이언트에서 서버 API를 호출한 기록이 보일 영역입니다}'
              }
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
            issueId={issueId}
            comments={comments}
            currentUserId={currentUserId}
            isIssueAuthor={isIssueAuthor}
          />
        )}
      </div>

      <div className="min-[1334px]:col-start-1">
        <IssueCommentComposer />
      </div>
    </section>
  );
}

export default IssueDetail;
