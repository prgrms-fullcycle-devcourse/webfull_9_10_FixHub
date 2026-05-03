import { Prisma } from '@prisma/client';

import prisma from '../../common/config/prisma.js';
import { SearchIssuesQueryObjectDto } from './issues.dto.js';

const KEYS = [
  'title',
  'author',
  'tag',
  'status',
  'content',
  'page',
  'teamId',
] as const;
type Key = (typeof KEYS)[number];

function parseSearchQuery(input: string) {
  const result: SearchIssuesQueryObjectDto = {
    title: [],
    tag: [],
    content: [],
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
        if (value === 'UNSOLVED' || value === 'SOLVED') {
          result.status = value;
        }
      } else if (key === 'author') {
        result.author = value;
      } else if (key === 'teamId') {
        result.teamId = value;
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

  // title (AND)
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

  // content (AND)
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

  // author (relation 있을 때)
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

  // status
  if (dto.status) {
    andConditions.push({
      status: dto.status.toLowerCase(),
    });
  }

  // tag (AND)
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

  // 최종 where 생성
  const where: Prisma.ErrorIssueWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  return where;
}

export async function searchIssues(input: string) {
  const dto = parseSearchQuery(input);
  const where = buildSearchWhere(dto);

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
      orderBy: { createdAt: 'desc' },
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
  }));

  const response = {
    meta: {
      totalItemCount,
      currentItemCount: data.length,
      itemsPerPage,
      currentPage: page,
      totalPages: Math.ceil(totalItemCount / itemsPerPage),
    },
    data,
  };

  return response;
}
