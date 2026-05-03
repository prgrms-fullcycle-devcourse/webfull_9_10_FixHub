import prisma from '../../common/config/prisma.js';
import type { GetPublicIssuesQuery } from './issues.dto.js';

const issuesService = {
  async getPublicIssues({ page, limit }: GetPublicIssuesQuery) {
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
        author: '',
        tags: [],
        summary: issue.content ?? '',
        commentCount: 0,
        createdAt: issue.createdAt.toISOString(),
      })),
    };
  },
};

export default issuesService;
