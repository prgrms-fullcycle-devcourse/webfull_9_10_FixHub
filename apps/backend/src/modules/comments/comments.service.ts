import { randomUUID } from 'node:crypto';

import { AppError } from '../../common/errors/AppError.js';
import { formatKoreanDate } from '../../common/utils/formatDate.js';
import type {
  CreateCommentBodyDto,
  CreateCommentParamsDto,
  CreateCommentResponseDto,
} from './comments.dto.js';

type SavedComment = {
  id: string;
  parentId: string | null;
};

const issueComments = new Map<string, SavedComment[]>();

export function createComment(
  params: CreateCommentParamsDto,
  body: CreateCommentBodyDto,
): CreateCommentResponseDto {
  const savedComments = issueComments.get(params.id) ?? [];

  if (body.parentId !== null) {
    const parentComment = savedComments.find(
      (comment) => comment.id === body.parentId,
    );

    if (!parentComment) {
      throw new AppError(
        'COMMENT_PARENT_NOT_FOUND',
        '부모 댓글을 찾을 수 없습니다.',
        404,
      );
    }
  }

  const createdComment = {
    id: `comment-${randomUUID()}`,
    author: '홍길동', //TODO: user module 생성 후 연동 필요
    createdAt: formatKoreanDate(new Date()),
  };

  issueComments.set(params.id, [
    ...savedComments,
    {
      id: createdComment.id,
      parentId: body.parentId,
    },
  ]);

  return createdComment;
}
