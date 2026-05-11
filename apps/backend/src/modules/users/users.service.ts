import bcrypt from 'bcrypt';

import prisma from '../../common/config/prisma.js';
import { AppError, Errors } from '../../common/errors/AppError.js';
import type {
  GetMyProfileResponseDto,
  UpdateMyProfileBodyDto,
  UpdateMyProfileResponseDto,
  GetUserProfileResponseDto,
  GetMyIssuesQueryDto,
  GetMyIssuesResponseDto,
  GetMySolvedQueryDto,
  GetMySolvedResponseDto,
  GetMyScoreQueryDto,
  GetMyScoreResponseDto,
  GetMyScoreLogsQueryDto,
  GetMyScoreLogsResponseDto,
} from './users.dto.js';

const SALT_ROUNDS = 10;

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

function formatCreatedAt(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    totalItemCount: total,
    currentItemCount: 0, // 아래에서 data.length 로 덮어씀
    itemsPerPage: limit,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
}

// GET /users/me
export async function getMyProfile(
  userId: string,
): Promise<GetMyProfileResponseDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teamMembers: {
        where: { status: 'ACTIVE' },
        select: { score: true },
      },
      errorIssues: {
        select: { id: true },
      },
    },
  });

  if (!user) throw Errors.NOT_FOUND;

  // 전체 팀에서 누적 점수 합산
  const totalScore = user.teamMembers.reduce((acc, tm) => acc + tm.score, 0);

  // 내가 해결한 이슈 수: 내 댓글이 채택된 이슈 개수
  const solvedCount = await prisma.comment.count({
    where: { userId, isAdopted: true },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profileImg: user.profileImg ?? null,
    createdAt: formatCreatedAt(user.createdAt),
    totalScore,
    issueCount: user.errorIssues.length,
    solvedCount,
  };
}

// PATCH /users/me
export async function updateMyProfile(
  userId: string,
  body: UpdateMyProfileBodyDto,
): Promise<UpdateMyProfileResponseDto> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw Errors.NOT_FOUND;

  // 이메일 중복 체크 (이메일을 수정하려 할 때만)
  if (body.email && body.email !== user.email) {
    const existing = await prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existing)
      throw new AppError('CONFLICT', '이미 사용 중인 이메일입니다.', 409);
  }

  // 비밀번호 변경 처리
  let hashedPassword: string | undefined;
  if (body.password) {
    if (!user.password) {
      throw new AppError(
        'BAD_REQUEST',
        '소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.',
        400,
      );
    }
    const isValid = await bcrypt.compare(body.password.current, user.password);
    if (!isValid) {
      throw new AppError(
        'UNAUTHORIZED',
        '현재 비밀번호가 올바르지 않습니다.',
        401,
      );
    }
    hashedPassword = await bcrypt.hash(body.password.next, SALT_ROUNDS);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.profileImg !== undefined && { profileImg: body.profileImg }),
      ...(hashedPassword !== undefined && { password: hashedPassword }),
    },
  });

  return {
    id: updated.id,
    name: updated.name,
    profileImg: updated.profileImg ?? null,
    updatedAt: new Date().toISOString(),
  };
}

// GET /users/:userId
export async function getUserProfile(
  userId: string,
): Promise<GetUserProfileResponseDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teamMembers: {
        where: { status: 'ACTIVE' },
        select: { score: true },
      },
      errorIssues: {
        select: { id: true },
      },
    },
  });

  if (!user) throw Errors.NOT_FOUND;

  const totalScore = user.teamMembers.reduce((acc, tm) => acc + tm.score, 0);

  const solvedCount = await prisma.comment.count({
    where: { userId, isAdopted: true },
  });

  return {
    id: user.id,
    name: user.name,
    profileImg: user.profileImg ?? null,
    createdAt: formatCreatedAt(user.createdAt),
    totalScore,
    issueCount: user.errorIssues.length,
    solvedCount,
  };
}

// GET /users/me/issues
export async function getMyIssues(
  userId: string,
  query: GetMyIssuesQueryDto,
): Promise<GetMyIssuesResponseDto> {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [total, issues] = await Promise.all([
    prisma.errorIssue.count({ where: { userId } }),
    prisma.errorIssue.findMany({
      where: { userId },
      include: {
        tags: true,
        comments: { select: { id: true, isAdopted: true } },
        team: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  const data = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    status: issue.status as 'UNSOLVED' | 'SOLVED',
    tags: issue.tags.map((t) => t.tagName),
    summary: toPlainSummary(issue.content ?? ''),
    commentCount: issue.comments.length,
    adoptedCount: issue.comments.filter((c) => c.isAdopted).length,
    createdAt: issue.createdAt.toISOString(),
    teamId: issue.team.id,
    teamName: issue.team.name,
  }));

  const meta = buildPaginationMeta(total, page, limit);
  meta.currentItemCount = data.length;

  return { meta, data };
}

// GET /users/me/solved
export async function getMySolved(
  userId: string,
  query: GetMySolvedQueryDto,
): Promise<GetMySolvedResponseDto> {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // 내가 채택된 댓글을 작성한 이슈들
  const [total, adoptedComments] = await Promise.all([
    prisma.comment.count({ where: { userId, isAdopted: true } }),
    prisma.comment.findMany({
      where: { userId, isAdopted: true },
      include: {
        issue: {
          include: {
            tags: true,
            comments: { select: { id: true, isAdopted: true } },
            team: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  const data = adoptedComments.map((comment) => {
    const issue = comment.issue;
    return {
      id: issue.id,
      title: issue.title,
      status: issue.status as 'UNSOLVED' | 'SOLVED',
      tags: issue.tags.map((t) => t.tagName),
      summary: toPlainSummary(issue.content ?? ''),
      commentCount: issue.comments.length,
      adoptedCount: issue.comments.filter((c) => c.isAdopted).length,
      createdAt: issue.createdAt.toISOString(),
      teamId: issue.team.id,
      teamName: issue.team.name,
      myAdoptedCommentId: comment.id,
    };
  });

  const meta = buildPaginationMeta(total, page, limit);
  meta.currentItemCount = data.length;

  return { meta, data };
}

// GET /users/me/score (잔디 그래프용)
export async function getMyScore(
  userId: string,
  query: GetMyScoreQueryDto,
): Promise<GetMyScoreResponseDto> {
  const year = query.year ?? new Date().getFullYear();

  const from = new Date(`${year}-01-01T00:00:00.000Z`);
  const to = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  // 해당 유저의 팀멤버 id 목록
  const teamMembers = await prisma.teamMember.findMany({
    where: { userId },
    select: { id: true, score: true },
  });
  const teamMemberIds = teamMembers.map((tm) => tm.id);
  const totalScore = teamMembers.reduce((acc, tm) => acc + tm.score, 0);

  const logs = await prisma.scoreLog.findMany({
    where: {
      teamMemberId: { in: teamMemberIds },
      createdAt: { gte: from, lt: to },
    },
    include: {
      issue: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // 날짜별로 그루핑
  const dailyMap = new Map<
    string,
    {
      totalAmount: number;
      logs: GetMyScoreResponseDto['daily'][number]['logs'];
    }
  >();

  for (const log of logs) {
    const dateStr = log.createdAt.toISOString().slice(0, 10);
    if (!dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, { totalAmount: 0, logs: [] });
    }
    const day = dailyMap.get(dateStr)!;
    day.totalAmount += log.amount;
    day.logs.push({
      id: log.id,
      amount: log.amount,
      reason: log.reason,
      issueId: log.issueId ?? null,
      issueTitle: log.issue?.title ?? null,
      createdAt: log.createdAt.toISOString(),
    });
  }

  const daily = Array.from(dailyMap.entries()).map(([date, value]) => ({
    date,
    totalAmount: value.totalAmount,
    logs: value.logs,
  }));

  return { year, totalScore, daily };
}

// GET /users/me/score/logs (페이지네이션 점수 목록)
export async function getMyScoreLogs(
  userId: string,
  query: GetMyScoreLogsQueryDto,
): Promise<GetMyScoreLogsResponseDto> {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const teamMembers = await prisma.teamMember.findMany({
    where: { userId },
    select: { id: true },
  });
  const teamMemberIds = teamMembers.map((tm) => tm.id);

  const [total, logs] = await Promise.all([
    prisma.scoreLog.count({ where: { teamMemberId: { in: teamMemberIds } } }),
    prisma.scoreLog.findMany({
      where: { teamMemberId: { in: teamMemberIds } },
      include: { issue: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  const data = logs.map((log) => ({
    id: log.id,
    amount: log.amount,
    reason: log.reason,
    issueId: log.issueId ?? null,
    issueTitle: log.issue?.title ?? null,
    createdAt: log.createdAt.toISOString(),
  }));

  const meta = buildPaginationMeta(total, page, limit);
  meta.currentItemCount = data.length;

  return { meta, data };
}
