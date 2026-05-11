import { IssueStatus, Prisma } from '@prisma/client';
import OpenAI from 'openai';

import prisma from '../../common/config/prisma.js';
import { AppError, Errors } from '../../common/errors/AppError.js';
import {
  APP_NOTIFICATION_TYPE,
  createTeamAppNotifications,
} from '../../common/utils/appNotification.js';
import { sendSlackNotificationToTeam } from '../../common/utils/slackNotification.js';
import {
  type SearchIssuesQueryObjectDto,
  type GetPublicIssuesQuery,
  type GetIssueFeedsQuery,
  type GetIssueFeedsParamsDto,
  type GetIssueDetailParamsDto,
  type GetIssueDetailResponseDto,
  type CreateIssueParamsDto,
  type CreateIssueBodyDto,
  type CreateIssueResponseDto,
  type UpdateIssueParamsDto,
  type UpdateIssueBodyDto,
  type UpdateIssueResponseDto,
  type DeleteIssueParamsDto,
  type DeleteIssueResponseDto,
  SuggestIssueResponseSchema,
  SuggestIssueResponseDto,
} from './issues.dto.js';

const KEYS = [
  'title',
  'author',
  'authorId',
  'solvedBy',
  'tag',
  'status',
  'content',
  'page',
  'teamId',
  'sort',
] as const;
type Key = (typeof KEYS)[number];

function toPlainSummary(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/^\s*[-+*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/>\s?/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

function parseSearchQuery(input: string) {
  const result: SearchIssuesQueryObjectDto = {
    title: [],
    tag: [],
    content: [],
    sort: 'latest',
  };

  const tokens = input.split(/\s+/);

  for (const token of tokens) {
    const [key, ...rest] = token.split(':');

    if (KEYS.includes(key as Key) && rest.length > 0) {
      const value = rest.join(':');

      if (key === 'page') {
        const n = Number(value);
        if (!Number.isNaN(n)) result.page = n;
      } else if (key === 'title') {
        result.title.push(value);
      } else if (key === 'tag') {
        result.tag.push(value);
      } else if (key === 'content') {
        result.content.push(value);
      } else if (key === 'status') {
        if (value === IssueStatus.UNSOLVED || value === IssueStatus.SOLVED) {
          result.status = value;
        }
      } else if (key === 'author') {
        result.author = value;
      } else if (key === 'authorId') {
        result.authorId = value;
      } else if (key === 'solvedBy') {
        result.solvedBy = value;
      } else if (key === 'teamId') {
        result.teamId = value;
      } else if (key === 'sort') {
        if (value === 'latest' || value === 'oldest') {
          result.sort = value;
        }
      }
    } else {
      result.title.push(key);
    }
  }

  return result;
}

function mapFeedIssue(issue: {
  id: string;
  teamId: string;
  title: string;
  content: string | null;
  team: { name: string };
  user: { name: string | null } | null;
  tags: Array<{ tagName: string }>;
  _count: { comments: number };
  createdAt: Date;
}) {
  return {
    id: issue.id,
    teamId: issue.teamId,
    title: issue.title,
    teamName: issue.team.name,
    author: issue.user?.name ?? '',
    tags: issue.tags.map((tag) => tag.tagName),
    summary: toPlainSummary(issue.content ?? ''),
    commentCount: issue._count.comments,
    createdAt: issue.createdAt.toISOString(),
  };
}

function buildSearchWhere(dto: SearchIssuesQueryObjectDto) {
  const andConditions: Prisma.ErrorIssueWhereInput[] = [];

  if (!dto.teamId && !dto.author && !dto.authorId && !dto.solvedBy) {
    andConditions.push({ isPublic: true });
  }

  if (dto.teamId) {
    andConditions.push({ teamId: dto.teamId });
  }

  if (dto.title.length > 0) {
    andConditions.push(
      ...dto.title.map((t) => ({
        title: {
          contains: t,
          mode: Prisma.QueryMode.insensitive,
        },
      })),
    );
  }

  if (dto.content.length > 0) {
    andConditions.push(
      ...dto.content.map((c) => ({
        content: {
          contains: c,
          mode: Prisma.QueryMode.insensitive,
        },
      })),
    );
  }

  if (dto.author) {
    andConditions.push({
      user: {
        name: {
          contains: dto.author,
          mode: Prisma.QueryMode.insensitive,
        },
      },
    });
  }

  if (dto.authorId) {
    andConditions.push({ userId: dto.authorId });
  }

  if (dto.solvedBy) {
    andConditions.push({
      comments: {
        some: {
          userId: dto.solvedBy,
          isAdopted: true,
        },
      },
    });
  }

  if (dto.status) {
    andConditions.push({
      status: dto.status,
    });
  }

  if (dto.tag.length > 0) {
    andConditions.push(
      ...dto.tag.map((tag) => ({
        tags: {
          some: {
            tagName: {
              equals: tag,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        },
      })),
    );
  }

  const orderBy =
    dto.sort === 'oldest'
      ? { createdAt: Prisma.SortOrder.asc }
      : { createdAt: Prisma.SortOrder.desc };

  const where: Prisma.ErrorIssueWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  return { where, orderBy };
}

export async function searchIssues(input: string) {
  const dto = parseSearchQuery(input);
  const { where, orderBy } = buildSearchWhere(dto);

  const page = dto.page ?? 1;
  const itemsPerPage = 10;

  const [issues, totalItemCount] = await prisma.$transaction([
    prisma.errorIssue.findMany({
      where,
      include: {
        tags: true,
        team: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy,
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    }),
    prisma.errorIssue.count({ where }),
  ]);

  const data = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    teamId: issue.teamId,
    teamName: issue.team.name,
    summary: toPlainSummary(issue.content ?? ''),
    author: issue.userId,
    tag: issue.tags.map((t) => t.tagName),
    status: issue.status,
    commentCount: issue._count.comments,
    createdAt: issue.createdAt.toISOString(),
  }));

  return {
    meta: {
      totalItemCount,
      currentItemCount: data.length,
      itemsPerPage,
      currentPage: page,
      totalPages: Math.ceil(totalItemCount / itemsPerPage),
    },
    data,
  };
}

export async function getIssueFeeds({ page, limit }: GetIssueFeedsQuery) {
  const skip = (page - 1) * limit;

  const [totalItemCount, issues] = await Promise.all([
    prisma.errorIssue.count({
      where: {
        isPublic: true,
      },
    }),
    prisma.errorIssue.findMany({
      where: {
        isPublic: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: true,
        user: true,
        team: true,
        _count: {
          select: { comments: true },
        },
      },
    }),
  ]);

  return {
    meta: {
      totalItemCount,
      currentItemCount: issues.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalItemCount / limit) || 1,
    },
    data: issues.map(mapFeedIssue),
  };
}

export async function getTeamIssueFeeds(
  { teamId }: GetIssueFeedsParamsDto,
  { page, limit }: GetIssueFeedsQuery,
) {
  const skip = (page - 1) * limit;

  const [totalItemCount, issues] = await Promise.all([
    prisma.errorIssue.count({
      where: {
        teamId,
      },
    }),
    prisma.errorIssue.findMany({
      where: {
        teamId,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: true,
        user: true,
        team: true,
        _count: {
          select: { comments: true },
        },
      },
    }),
  ]);

  return {
    meta: {
      totalItemCount,
      currentItemCount: issues.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalItemCount / limit) || 1,
    },
    data: issues.map(mapFeedIssue),
  };
}

export async function getPublicIssues({ page, limit }: GetPublicIssuesQuery) {
  const skip = (page - 1) * limit;

  const [totalItemCount, issues] = await Promise.all([
    prisma.errorIssue.count({
      where: {
        isPublic: true,
      },
    }),
    prisma.errorIssue.findMany({
      where: {
        isPublic: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        tags: true,
        user: true,
        team: true,
        _count: {
          select: { comments: true },
        },
      },
    }),
  ]);

  return {
    meta: {
      totalItemCount,
      currentItemCount: issues.length,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalItemCount / limit) || 1,
    },
    data: issues.map((issue) => ({
      id: issue.id,
      teamId: issue.teamId,
      title: issue.title,
      teamName: issue.team.name,
      author: issue.user?.name ?? '',
      tags: issue.tags.map((tag) => tag.tagName),
      summary: toPlainSummary(issue.content ?? ''),
      commentCount: issue._count.comments,
      createdAt: issue.createdAt.toISOString(),
    })),
  };
}

/* 이슈 상세 조회 */
export async function getIssueDetail(
  userId: string,
  { teamId, issueId }: GetIssueDetailParamsDto,
): Promise<GetIssueDetailResponseDto> {
  const issue = await prisma.errorIssue.findFirst({
    where: {
      id: issueId,
      teamId,
    },
    include: {
      user: true,
      tags: true,
      errorLogs: {
        orderBy: {
          capturedAt: 'desc',
        },
      },
    },
  });

  if (!issue) {
    console.error('getIssueDetail() - 이슈를 찾을 수 없습니다.');
    throw Errors.NOT_FOUND;
  }

  const errorLog = issue.errorLogs
    .map((log) => log.stackTrace ?? log.message ?? '')
    .filter((value) => value.length > 0)
    .join('\n\n');

  return {
    id: issue.id,
    title: issue.title,
    content: issue.content ?? '',
    tag: issue.tags.map((item) => item.tagName),
    author: issue.user.name,
    authorId: issue.userId,
    isAuthor: issue.userId === userId,
    createdAt: issue.createdAt.toISOString(),
    errorLog,
    isPublic: issue.isPublic,
    status: issue.status,
    logs: issue.errorLogs.map((log, index) => ({
      logId: `log-uuid-00${index + 1}`,
      logType: log.logType as 'SENT' | 'RECEIVED',
      source: log.source,
      message: log.message ?? '',
    })),
  };
}

/* 이슈 등록 */
export async function createIssue(
  userId: string,
  params: CreateIssueParamsDto,
  body: CreateIssueBodyDto,
): Promise<CreateIssueResponseDto> {
  const teamMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: params.teamId,
        userId,
      },
    },
    select: {
      id: true,
      status: true,
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!teamMember) {
    console.error('createIssue() - 팀 멤버 정보를 찾을 수 없습니다.');
    throw Errors.FORBIDDEN;
  }

  if (teamMember.status !== 'ACTIVE') {
    console.error('createIssue() - 활성화된 팀 멤버가 아닙니다.');
    throw Errors.FORBIDDEN;
  }

  const createdIssue = await prisma.errorIssue.create({
    data: {
      userId,
      teamId: params.teamId,
      title: body.title,
      content: body.content,
      status: body.status,
      isPublic: body.isPublic,
      tags: {
        create: body.tag.map((tagName) => ({
          tagName,
        })),
      },
      errorLogs: {
        create: body.logs.map((log) => ({
          logType: log.logType,
          source: log.source,
          message: log.message,
          stackTrace: log.message,
          capturedAt: new Date(),
        })),
      },
    },
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  await sendSlackNotificationToTeam({
    teamId: params.teamId,
    excludeUserId: userId,
    enabledField: 'slackNotifyIssueCreated',
    text: `내 팀의 새 이슈가 등록되었어요: ${createdIssue.title}`,
  });

  await createTeamAppNotifications({
    teamId: params.teamId,
    actorUserId: userId,
    resourceId: createdIssue.id,
    type: APP_NOTIFICATION_TYPE.ISSUE_CREATED,
    content: `${teamMember.user.name}님이 새 이슈를 등록했습니다: ${createdIssue.title}`,
  });

  return {
    id: createdIssue.id,
    createdAt: createdIssue.createdAt.toISOString(),
  };
}

/* 이슈 수정 */
export async function updateIssue(
  userId: string,
  params: UpdateIssueParamsDto,
  body: UpdateIssueBodyDto,
): Promise<UpdateIssueResponseDto> {
  const teamMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: params.teamId,
        userId,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!teamMember) {
    console.error('updateIssue() - 팀 멤버 정보를 찾을 수 없습니다.');
    throw Errors.FORBIDDEN;
  }

  if (teamMember.status !== 'ACTIVE') {
    console.error('updateIssue() - 활성화된 팀 멤버가 아닙니다.');
    throw Errors.FORBIDDEN;
  }

  const issue = await prisma.errorIssue.findFirst({
    where: {
      id: params.issueId,
      teamId: params.teamId,
    },
    select: {
      id: true,
    },
  });

  if (!issue) {
    console.error('updateIssue() - 이슈를 찾을 수 없습니다.');
    throw Errors.NOT_FOUND;
  }

  const uniqueTags = [...new Set(body.tags)];

  const updatedIssue = await prisma.errorIssue.update({
    where: {
      id: issue.id,
    },
    data: {
      title: body.title,
      content: body.content,
      status: body.status,
      isPublic: body.isPublic,
      tags: {
        deleteMany: {},
        create: uniqueTags.map((tagName) => ({
          tagName,
        })),
      },
      errorLogs: {
        deleteMany: {},
        create: body.logs.map((log) => ({
          logType: log.logType,
          source: log.stackTrace,
          message: log.stackTrace,
          stackTrace: log.stackTrace,
          capturedAt: new Date(),
        })),
      },
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });

  return {
    id: updatedIssue.id,
    updatedAt: updatedIssue.updatedAt.toISOString(),
  };
}

/* 이슈 삭제 */
export async function deleteIssue(
  userId: string,
  params: DeleteIssueParamsDto,
): Promise<DeleteIssueResponseDto> {
  const teamMember = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: params.teamId,
        userId,
      },
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!teamMember) {
    console.error('deleteIssue() - 팀 멤버 정보를 찾을 수 없습니다.');
    throw Errors.FORBIDDEN;
  }

  if (teamMember.status !== 'ACTIVE') {
    console.error('deleteIssue() - 활성화된 팀 멤버가 아닙니다.');
    throw Errors.FORBIDDEN;
  }

  const issue = await prisma.errorIssue.findFirst({
    where: {
      id: params.issueId,
      teamId: params.teamId,
    },
    select: {
      id: true,
    },
  });

  if (!issue) {
    console.error('deleteIssue() - 이슈를 찾을 수 없습니다.');
    throw Errors.NOT_FOUND;
  }

  await prisma.errorIssue.delete({
    where: {
      id: issue.id,
    },
  });

  return {
    success: true,
  };
}

const systemPrompt = `
You are a strict JSON generator.
You are an issue analyzer.

Rules:
- Title: max 8 words
- Tags: 2~3 lowercase English words
- Summary: 1 sentence
- Return JSON only

Output format:
{
  "title": "",
  "tags": [],
  "summary": ""
}`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateIssue(
  log: string,
): Promise<SuggestIssueResponseDto> {
  const res = await openai.chat.completions.create({
    model: 'gpt-5.4-nano',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: log },
    ],
    temperature: 0.2,
    max_completion_tokens: 300,
  });

  const text = res.choices[0].message.content ?? '';

  try {
    const json = JSON.parse(text);
    return SuggestIssueResponseSchema.parse(json);
  } catch (_e) {
    throw new AppError('502 Bad Gateway', 'Openai Error', 502);
  }
}
