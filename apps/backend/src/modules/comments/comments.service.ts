import { AppError } from '../../common/errors/AppError.js';
import prisma from '../../common/config/prisma.js';
import { formatKoreanDate } from '../../common/utils/formatDate.js';
import type {
  AdoptCommentParamsDto,
  AdoptCommentResponseDto,
  CreateCommentBodyDto,
  CreateCommentParamsDto,
  CreateCommentResponseDto,
} from './comments.dto.js';

const ADOPT_COMMENT_REWARDED_SCORE = 50;
const ADOPT_COMMENT_REASON = '댓글 채택 보상';
const SOLVED_STATUS = 'SOLVED' as const;

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

export async function adoptComment(
  params: AdoptCommentParamsDto,
  userId: string,
): Promise<AdoptCommentResponseDto> {
  return prisma.$transaction(async (tx) => {
    const comment = await tx.comment.findFirst({
      where: {
        id: params.commentId,
        issueId: params.id,
      },
      select: {
        id: true,
        userId: true,
        isAdopted: true,
        issue: {
          select: {
            id: true,
            userId: true,
            teamId: true,
            status: true,
          },
        },
      },
    });

    if (!comment) {
      throw new AppError('COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.', 404);
    }

    if (comment.issue.userId !== userId) {
      throw new AppError('FORBIDDEN', '이슈 작성자만 채택할 수 있습니다.', 403);
    }

    if (comment.issue.status === SOLVED_STATUS || comment.isAdopted) {
      throw new AppError(
        'COMMENT_ALREADY_ADOPTED',
        '이미 채택된 댓글이 있습니다.',
        409,
      );
    }

    const adoptedComment = await tx.comment.findFirst({
      where: {
        issueId: params.id,
        isAdopted: true,
      },
      select: {
        id: true,
      },
    });

    if (adoptedComment) {
      throw new AppError(
        'COMMENT_ALREADY_ADOPTED',
        '이미 채택된 댓글이 있습니다.',
        409,
      );
    }

    const teamMember = await tx.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: comment.issue.teamId,
          userId: comment.userId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!teamMember) {
      throw new AppError(
        'TEAM_MEMBER_NOT_FOUND',
        '댓글 작성자의 팀 정보를 찾을 수 없습니다.',
        404,
      );
    }

    await tx.comment.update({
      where: {
        id: comment.id,
      },
      data: {
        isAdopted: true,
        rewardScore: ADOPT_COMMENT_REWARDED_SCORE,
      },
    });

    await tx.errorIssue.update({
      where: {
        id: comment.issue.id,
      },
      data: {
        status: SOLVED_STATUS,
      },
    });

    await tx.teamMember.update({
      where: {
        id: teamMember.id,
      },
      data: {
        score: {
          increment: ADOPT_COMMENT_REWARDED_SCORE,
        },
      },
    });

    await tx.scoreLog.create({
      data: {
        teamMemberId: teamMember.id,
        amount: ADOPT_COMMENT_REWARDED_SCORE,
        reason: ADOPT_COMMENT_REASON,
      },
    });

    return {
      issueId: comment.issue.id,
      commentId: comment.id,
      rewardedScore: ADOPT_COMMENT_REWARDED_SCORE,
      reason: ADOPT_COMMENT_REASON,
      status: SOLVED_STATUS,
    };
  });
}
