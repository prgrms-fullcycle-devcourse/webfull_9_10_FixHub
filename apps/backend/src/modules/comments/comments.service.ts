import { Errors } from '../../common/errors/AppError.js';
import prisma from '../../common/config/prisma.js';
import {
  APP_NOTIFICATION_TYPE,
  createAppNotification,
} from '../../common/utils/appNotification.js';
import { formatKoreanDate } from '../../common/utils/formatDate.js';
import { sendSlackNotificationToTeamMember } from '../../common/utils/slackNotification.js';
import type {
  AdoptCommentParamsDto,
  AdoptCommentResponseDto,
  CreateCommentBodyDto,
  CreateCommentParamsDto,
  CreateCommentResponseDto,
  DeleteCommentParamsDto,
  DeleteCommentResponseDto,
  GetCommentsParamsDto,
  GetCommentsResponseDto,
  UpdateCommentBodyDto,
  UpdateCommentParamsDto,
  UpdateCommentResponseDto,
} from './comments.dto.js';

const ADOPT_COMMENT_REWARDED_SCORE = 10;
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
      title: true,
      userId: true,
      teamId: true,
    },
  });

  if (!issue) {
    console.error('createComment() - 이슈를 찾을 수 없습니다.');
    throw Errors.NOT_FOUND;
  }

  let parentComment: { id: string; userId: string } | null = null;

  if (body.parentId !== null) {
    parentComment = await prisma.comment.findFirst({
      where: {
        id: body.parentId,
        issueId: params.id,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!parentComment) {
      console.error('createComment() - 부모 댓글을 찾을 수 없습니다.');
      throw Errors.NOT_FOUND;
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

  if (body.parentId === null) {
    await createAppNotification({
      userId: issue.userId,
      actorUserId: userId,
      resourceId: issue.id,
      type: APP_NOTIFICATION_TYPE.COMMENT,
      content: `${createdComment.user.name}님이 회원님의 이슈에 댓글을 달았습니다: ${issue.title}`,
    });

    if (issue.userId !== userId) {
      await sendSlackNotificationToTeamMember({
        teamId: issue.teamId,
        userId: issue.userId,
        enabledField: 'slackNotifyCommentOnMyIssue',
        text: `${createdComment.user.name}님이 회원님의 이슈에 제안을 등록했어요: ${issue.title}`,
      });
    }
  } else if (parentComment) {
    await createAppNotification({
      userId: parentComment.userId,
      actorUserId: userId,
      resourceId: issue.id,
      type: APP_NOTIFICATION_TYPE.REPLY,
      content: `${createdComment.user.name}님이 회원님의 댓글에 답글을 달았습니다: ${issue.title}`,
    });

    if (parentComment.userId !== userId) {
      await sendSlackNotificationToTeamMember({
        teamId: issue.teamId,
        userId: parentComment.userId,
        enabledField: 'slackNotifyReplyOnMyComment',
        text: `${createdComment.user.name}님이 회원님의 제안에 답글을 달았어요: ${issue.title}`,
      });
    }
  }

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
    console.error('getComment() - 이슈를 찾을 수 없습니다.');
    throw Errors.NOT_FOUND;
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
          id: true,
          name: true,
        },
      },
      replies: {
        orderBy: [{ isAdopted: 'desc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          content: true,
          parentId: true,
          isAdopted: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const sortedComments = [...comments].sort((prevComment, nextComment) => {
    const prevHasAdoptedComment =
      prevComment.isAdopted ||
      prevComment.replies.some((reply) => reply.isAdopted);
    const nextHasAdoptedComment =
      nextComment.isAdopted ||
      nextComment.replies.some((reply) => reply.isAdopted);

    if (prevHasAdoptedComment !== nextHasAdoptedComment) {
      return prevHasAdoptedComment ? -1 : 1;
    }

    return prevComment.createdAt.getTime() - nextComment.createdAt.getTime();
  });

  return {
    data: sortedComments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.user.id,
        name: comment.user.name,
      },
      parentId: comment.parentId,
      isAdopted: comment.isAdopted,
      createdAt: comment.createdAt.toISOString(),
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        author: {
          id: reply.user.id,
          name: reply.user.name,
        },
        parentId: reply.parentId,
        isAdopted: reply.isAdopted,
        createdAt: reply.createdAt.toISOString(),
        replies: [],
      })),
    })),
  };
}

export async function editComment(
  params: UpdateCommentParamsDto,
  body: UpdateCommentBodyDto,
  userId: string,
): Promise<UpdateCommentResponseDto> {
  const comment = await prisma.comment.findFirst({
    where: {
      id: params.commentId,
      issueId: params.id,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!comment) {
    console.error('editComment() - 댓글을 찾을 수 없습니다.');
    throw Errors.NOT_FOUND;
  }

  if (comment.userId !== userId) {
    console.error('editComment() - 댓글 작성자만 수정할 수 있습니다.');
    throw Errors.FORBIDDEN;
  }

  const updatedComment = await prisma.comment.update({
    where: {
      id: comment.id,
    },
    data: {
      content: body.content,
    },
    select: {
      id: true,
      content: true,
      updatedAt: true,
    },
  });

  return {
    id: updatedComment.id,
    content: updatedComment.content,
    updatedAt: updatedComment.updatedAt.toISOString(),
  };
}

export async function deleteComment(
  params: DeleteCommentParamsDto,
  userId: string,
): Promise<DeleteCommentResponseDto> {
  const comment = await prisma.comment.findFirst({
    where: {
      id: params.commentId,
      issueId: params.id,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!comment) {
    console.error('deleteComment() - 댓글을 찾을 수 없습니다.');
    throw Errors.NOT_FOUND;
  }

  if (comment.userId !== userId) {
    console.error('deleteComment() - 댓글 작성자만 삭제할 수 있습니다.');
    throw Errors.FORBIDDEN;
  }

  await prisma.comment.delete({
    where: {
      id: comment.id,
    },
  });

  return {
    success: true,
  };
}

export async function adoptComment(
  params: AdoptCommentParamsDto,
  userId: string,
): Promise<AdoptCommentResponseDto> {
  const adoptedComment = await prisma.$transaction(async (tx) => {
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
            title: true,
            userId: true,
            teamId: true,
            status: true,
          },
        },
      },
    });

    if (!comment) {
      console.error('adoptComment() - 댓글을 찾을 수 없습니다.');
      throw Errors.NOT_FOUND;
    }

    // 채택하려는 댓글이 이미 채택된 댓글인경우
    if (comment.isAdopted) {
      console.error('adoptComment() - 이미 채택된 댓글 입니다.');
      throw Errors.VALIDATION_ERROR;
    }

    if (comment.issue.userId !== userId) {
      console.error('adoptComment() - 이슈 작성자만 채택할 수 있습니다.');
      throw Errors.FORBIDDEN;
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
      console.error(
        'adoptComment() - 댓글 작성자의 팀 정보를 찾을 수 없습니다.',
      );
      throw Errors.NOT_FOUND;
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

    const ADOPT_COMMENT_REASON = `이슈 해결 기여 - ${params.id}`;

    await tx.scoreLog.create({
      data: {
        teamMemberId: teamMember.id,
        amount: ADOPT_COMMENT_REWARDED_SCORE,
        reason: ADOPT_COMMENT_REASON,
        issueId: comment.issue.id,
      },
    });

    return {
      notificationUserId: comment.userId,
      response: {
        issueId: comment.issue.id,
        commentId: comment.id,
        rewardedScore: ADOPT_COMMENT_REWARDED_SCORE,
        reason: ADOPT_COMMENT_REASON,
        status: SOLVED_STATUS,
      },
      slackNotification: {
        teamId: comment.issue.teamId,
        userId: comment.userId,
        issueTitle: comment.issue.title,
      },
    };
  });

  await createAppNotification({
    userId: adoptedComment.notificationUserId,
    actorUserId: userId,
    resourceId: adoptedComment.response.issueId,
    type: APP_NOTIFICATION_TYPE.ADOPTED,
    content: '회원님의 댓글이 해결책으로 채택되었습니다.',
  });

  if (adoptedComment.slackNotification.userId !== userId) {
    await sendSlackNotificationToTeamMember({
      teamId: adoptedComment.slackNotification.teamId,
      userId: adoptedComment.slackNotification.userId,
      enabledField: 'slackNotifyCommentAdopted',
      text: `회원님의 제안이 해결책으로 채택되었어요: ${adoptedComment.slackNotification.issueTitle}`,
    });
  }

  return adoptedComment.response;
}
