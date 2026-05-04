import { FileImage, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

function IssueCommentComposer() {
  return (
    <div className="rounded-md bg-(--surface-panel) p-7">
      <div className="mb-5 flex items-center">
        <h2 className="typo-semibold-18 text-(--text-primary)">
          해결 제안 하기
        </h2>

        <div className="ml-auto flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => alert('첨부 추가 클릭')}
            className="h-12 w-12 rounded-sm bg-(--surface-input) text-(--text-primary) hover:bg-(--surface-selected)"
            aria-label="첨부 추가"
          >
            <Plus size={24} />
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => alert('이미지 추가 클릭')}
            className="h-12 w-12 rounded-sm bg-(--surface-input) text-(--text-primary) hover:bg-(--surface-selected)"
            aria-label="이미지 추가"
          >
            <FileImage size={22} />
          </Button>

          <Button
            type="button"
            variant="default"
            onClick={() => alert('댓글 작성 버튼 클릭')}
            className="h-12 rounded-sm px-6 typo-medium-16 text-(--text-inverse) hover:opacity-90"
          >
            댓글 작성
          </Button>
        </div>
      </div>

      <textarea
        className="h-42.5 w-full resize-none rounded-md border border-border bg-(--surface-input) p-5 text-(--text-primary) outline-none placeholder:text-(--text-muted)"
        placeholder="해결 제안을 입력하세요"
      />
    </div>
  );
}

export default IssueCommentComposer;
