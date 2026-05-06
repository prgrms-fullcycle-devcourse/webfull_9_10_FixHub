import { IssueStatus, Prisma } from '@prisma/client';

import prisma from '../../common/config/prisma.js';
import { Errors } from '../../common/errors/AppError.js';
import type {
  SearchIssuesQueryObjectDto,
  GetPublicIssuesQuery,
  GetIssueDetailParamsDto,
  GetIssueDetailResponseDto,
  CreateIssueParamsDto,
  CreateIssueBodyDto,
  CreateIssueResponseDto,
} from './issues.dto.js';

const KEYS = [
  'title',
  'author',
  'tag',
  'status',
  'content',
  'page',
  'teamId',
  'sort',
] as const;
type Key = (typeof KEYS)[number];

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

function buildSearchWhere(dto: SearchIssuesQueryObjectDto) {
  const andConditions: Prisma.ErrorIssueWhereInput[] = [];

  andConditions.push(dto.teamId ? { teamId: dto.teamId } : { isPublic: true });

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
            tagName: tag,
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
    teamName: issue.team.name,
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
      title: issue.title,
      teamName: '',
      author: issue.user?.name ?? '',
      tags: issue.tags.map((tag) => tag.tagName),
      summary: issue.content ?? '',
      commentCount: issue._count.comments,
      createdAt: issue.createdAt.toISOString(),
    })),
  };
}

/* 이슈 상세 조회 */
export async function getIssueDetail({
  teamId,
  issueId,
}: GetIssueDetailParamsDto): Promise<GetIssueDetailResponseDto> {
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
      createdAt: true,
    },
  });

  return {
    id: createdIssue.id,
    createdAt: createdIssue.createdAt.toISOString(),
  };
}
