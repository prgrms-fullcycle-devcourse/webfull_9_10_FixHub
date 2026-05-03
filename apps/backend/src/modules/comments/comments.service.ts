import { AppError } from '../../common/errors/AppError.js';
import prisma from '../../common/config/prisma.js';
import { formatKoreanDate } from '../../common/utils/formatDate.js';
import type {
  CreateCommentBodyDto,
  CreateCommentParamsDto,
  CreateCommentResponseDto,
  GetCommentsParamsDto,
  GetCommentsResponseDto,
} from './comments.dto.js';

export async function createComment(
  params: CreateCommentParamsDto,
  body: CreateCommentBodyDto,
  userId: string,
): Promise<CreateCommentResponseDto> {
  const issue = await prisma.errorIssue.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
    },
  });

  if (!issue) {
    throw new AppError('ISSUE_NOT_FOUND', '이슈를 찾을 수 없습니다.', 404);
  }

  if (body.parentId !== null) {
    const parentComment = await prisma.comment.findFirst({
      where: {
        id: body.parentId,
        issueId: params.id,
      },
      select: {
        id: true,
      },
    });

    if (!parentComment) {
      throw new AppError(
        'COMMENT_PARENT_NOT_FOUND',
        '부모 댓글을 찾을 수 없습니다.',
        404,
      );
    }
  }

  const createdComment = await prisma.comment.create({
    data: {
      content: body.content,
      issue: {
        connect: {
          id: params.id,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
      ...(body.parentId === null
        ? {}
        : {
            parent: {
              connect: {
                id: body.parentId,
              },
            },
          }),
    },
    select: {
      id: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    id: createdComment.id,
    author: createdComment.user.name,
    createdAt: formatKoreanDate(createdComment.createdAt),
  };
}

export async function getComments(
  params: GetCommentsParamsDto,
): Promise<GetCommentsResponseDto> {
  const issue = await prisma.errorIssue.findUnique({
    where: {
      id: params.id,
    },
    select: {
      id: true,
    },
  });

  if (!issue) {
    throw new AppError('ISSUE_NOT_FOUND', '이슈를 찾을 수 없습니다.', 404);
  }

  const comments = await prisma.comment.findMany({
    where: {
      issueId: params.id,
      parentId: null,
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      content: true,
      parentId: true,
      isAdopted: true,
      createdAt: true,
      user: {
        select: {
          name: true,
        },
      },
      replies: {
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          id: true,
          content: true,
          parentId: true,
          isAdopted: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    data: comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: comment.user.name,
      parentId: comment.parentId,
      isAdopted: comment.isAdopted,
      createdAt: comment.createdAt.toISOString(),
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        author: reply.user.name,
        parentId: reply.parentId,
        isAdopted: reply.isAdopted,
        createdAt: reply.createdAt.toISOString(),
        replies: [],
      })),
    })),
  };
}
