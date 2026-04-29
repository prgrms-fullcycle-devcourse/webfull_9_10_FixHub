import { CalendarDays, Globe2, SquarePen, Trash2 } from 'lucide-react';

import IssueCommentComposer from '@/components/comments/IssueCommentComposer';
import IssueCommentList, {
  type IssueCommentItem,
} from '@/components/comments/IssueCommentList';

function IssueDetail() {
  const isPublic = false;
  const visibilityText = isPublic ? '전체공개' : '비공개';

  const comments: IssueCommentItem[] = [
    {
      id: 1,
      name: '김하늘',
      selected: true,
      isReply: false,
      text: 'Redis 세션 만료 시간이 너무 짧게 설정되어 있어서 발생한 것 같습니다. SessionTimeout 값을 30분으로 늘려보시고 확인해주세요.',
    },
    {
      id: 2,
      name: '김이름',
      selected: false,
      isReply: true,
      text: 'Redis 세션 만료 시간이 너무 짧게 설정되어 있어서 발생한 것 같습니다. SessionTimeout 값을 30분으로 늘려보시고 확인해주세요.',
    },
    {
      id: 3,
      name: '김하늘',
      selected: false,
      isReply: false,
      text: 'Redis 세션 만료 시간이 너무 짧게 설정되어 있어서 발생한 것 같습니다. SessionTimeout 값을 30분으로 늘려보시고 확인해주세요.',
    },
    {
      id: 4,
      name: '김하늘',
      selected: false,
      isReply: false,
      text: 'Redis 세션 만료 시간이 너무 짧게 설정되어 있어서 발생한 것 같습니다. SessionTimeout 값을 30분으로 늘려보시고 확인해주세요.',
    },
    {
      id: 5,
      name: '김하늘',
      selected: false,
      isReply: false,
      text: 'Redis 세션 만료 시간이 너무 짧게 설정되어 있어서 발생한 것 같습니다. SessionTimeout 값을 30분으로 늘려보시고 확인해주세요.',
    },
  ];

  return (
    <section className="grid gap-8 min-[1334px]:grid-cols-[minmax(0,1fr)_410px] relative min-h-[calc(100vh-90px)] overflow-hidden px-12 pt-4 pb-10 text-(--text-primary)">
      <div className="relative z-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="typo-semibold-18 text-(--text-primary)">
                로그인 시 500 에러 발생
              </h1>

              <span className="rounded-full bg-(--status-solved) px-4 py-1 typo-regular-14 text-success-foreground">
                해결
              </span>
            </div>

            <div className="mt-8 flex gap-3">
              <span className="rounded-sm bg-(--surface-tag) px-5 py-2.5 typo-regular-14 text-(--text-primary)">
                Axios
              </span>

              <span className="rounded-sm bg-(--surface-tag) px-5 py-2.5 typo-regular-14 text-(--text-primary)">
                JavaScript
              </span>
            </div>

            <div className="mt-5 flex items-center gap-3 typo-regular-14 text-(--text-primary)">
              <Globe2 size={24} />
              <span>{visibilityText}</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => alert('삭제 버튼 클릭')}
              className="flex h-16 w-20 cursor-pointer items-center justify-center rounded-md bg-(--surface-overlay) text-(--text-primary) shadow-(--shadow) hover:bg-(--surface-selected)"
              aria-label="삭제"
            >
              <Trash2 size={30} strokeWidth={1.7} />
            </button>

            <button
              type="button"
              onClick={() => alert('수정 버튼 클릭')}
              className="flex h-16 w-20 cursor-pointer items-center justify-center rounded-md bg-(--surface-overlay) text-(--text-primary) shadow-(--shadow) hover:bg-(--surface-selected)"
              aria-label="수정"
            >
              <SquarePen size={30} strokeWidth={1.7} />
            </button>
          </div>
        </div>

        <div className="mb-6 flex justify-between typo-regular-14 text-(--text-secondary)">
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

        <div className="mt-9 grid grid-cols-2 gap-5">
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
        <IssueCommentList comments={comments} />
      </div>

      <div className="min-[1334px]:col-start-1">
        <IssueCommentComposer />
      </div>
    </section>
  );
}

export default IssueDetail;
